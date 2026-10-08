import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { and, asc, eq, exists, ilike, inArray, or, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "../db/index";
import { users, roles, rolePermissions, userRoles } from "../db/schema";
import { authMiddleware, requirePermission, getPermissionsForRoles, invalidatePermissionCache } from "../middleware/auth";
import { isValidPermission, type Permission } from "../shared/permissions";

const router = new Hono();

router.use("*", authMiddleware);

const canManageUsers = requirePermission("users.manage");
const canManageRoles = requirePermission("roles.manage");

// Permission yang tidak boleh hilang dari diri sendiri, biar admin tidak mengunci dirinya keluar
const LOCKOUT_PERMISSIONS: Permission[] = ["roles.manage"];

// ─── Roles ───────────────────────────────────────────────────────────────────

const roleSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Kode role minimal 2 karakter")
    .max(20, "Kode role maksimal 20 karakter")
    .regex(/^[a-z0-9_]+$/, "Kode role hanya boleh huruf kecil, angka, dan underscore"),
  label: z.string().trim().min(1, "Nama role wajib diisi").max(100),
  description: z.string().trim().nullish(),
  permissions: z.array(z.string()).refine((ps) => ps.every(isValidPermission), "Ada permission yang tidak dikenal"),
});

// Dipakai juga oleh menu User (pilihan role), jadi cukup salah satu permission
router.get("/roles", requirePermission("roles.manage", "users.manage"), async (c) => {
  const rows = await db
    .select({
      id: roles.id,
      name: roles.name,
      label: roles.label,
      description: roles.description,
      isSystem: roles.isSystem,
      createdAt: roles.createdAt,
      userCount: sql<number>`(select count(*)::int from ${userRoles} where ${userRoles.roleId} = ${roles.id})`,
    })
    .from(roles)
    .orderBy(asc(roles.id));

  const perms = await db.select().from(rolePermissions);
  return c.json(
    rows.map((r) => ({
      ...r,
      permissions: perms.filter((p) => p.roleId === r.id).map((p) => p.permission),
    }))
  );
});

router.post("/roles", canManageRoles, zValidator("json", roleSchema), async (c) => {
  const { permissions, ...data } = c.req.valid("json");

  const [exists] = await db.select({ id: roles.id }).from(roles).where(eq(roles.name, data.name)).limit(1);
  if (exists) return c.json({ error: `Kode role "${data.name}" sudah dipakai` }, 400);

  const role = await db.transaction(async (tx) => {
    const [role] = await tx.insert(roles).values(data).returning();
    if (permissions.length) {
      await tx.insert(rolePermissions).values(permissions.map((permission) => ({ roleId: role.id, permission })));
    }
    return role;
  });

  invalidatePermissionCache();
  return c.json({ ...role, permissions }, 201);
});

// Kode role (name) tidak bisa diubah karena dipakai sebagai kunci di API
router.put("/roles/:id", canManageRoles, zValidator("json", roleSchema.omit({ name: true })), async (c) => {
  const id = parseInt(c.req.param("id"));
  const { permissions, ...data } = c.req.valid("json");
  const user = c.get("user");

  const [role] = await db.select().from(roles).where(eq(roles.id, id)).limit(1);
  if (!role) return c.json({ error: "Role tidak ditemukan" }, 404);

  // Kalau role ini milik user sendiri, pastikan gabungan dengan role lainnya masih punya akses kelola role
  if (user.roles.includes(role.name)) {
    const otherPerms = await getPermissionsForRoles(user.roles.filter((r) => r !== role.name));
    const missing = LOCKOUT_PERMISSIONS.filter((p) => !permissions.includes(p) && !otherPerms.includes(p));
    if (missing.length) {
      return c.json({ error: "Tidak bisa menghapus hak akses kelola role dari role Anda sendiri" }, 400);
    }
  }

  const updated = await db.transaction(async (tx) => {
    const [updated] = await tx
      .update(roles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(roles.id, id))
      .returning();
    await tx.delete(rolePermissions).where(eq(rolePermissions.roleId, id));
    if (permissions.length) {
      await tx.insert(rolePermissions).values(permissions.map((permission) => ({ roleId: id, permission })));
    }
    return updated;
  });

  invalidatePermissionCache();
  return c.json({ ...updated, permissions });
});

router.delete("/roles/:id", canManageRoles, async (c) => {
  const id = parseInt(c.req.param("id"));

  const [role] = await db.select().from(roles).where(eq(roles.id, id)).limit(1);
  if (!role) return c.json({ error: "Role tidak ditemukan" }, 404);
  if (role.isSystem) return c.json({ error: "Role bawaan sistem tidak bisa dihapus" }, 400);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(userRoles)
    .where(eq(userRoles.roleId, role.id));
  if (count > 0) {
    return c.json({ error: `Role masih dipakai oleh ${count} user. Lepas dulu role ini dari user tersebut.` }, 400);
  }

  await db.delete(roles).where(eq(roles.id, id));
  invalidatePermissionCache();
  return c.json({ message: "Role berhasil dihapus" });
});

// ─── Users ───────────────────────────────────────────────────────────────────

const userSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username minimal 3 karakter")
    .max(50)
    .regex(/^[a-zA-Z0-9_.]+$/, "Username hanya boleh huruf, angka, titik, dan underscore"),
  fullName: z.string().trim().max(100).nullish(),
  // Kode role (roles.name), minimal satu
  roles: z.array(z.string()).min(1, "Pilih minimal satu role"),
  isActive: z.boolean().optional(),
  // Wajib saat tambah; saat edit kosongkan jika tidak ingin mengganti password
  password: z.string().min(6, "Password minimal 6 karakter").optional().or(z.literal("")),
});

// Kode role -> id role; null jika ada kode yang tidak dikenal
const resolveRoleIds = async (names: string[]) => {
  const unique = Array.from(new Set(names));
  const rows = await db.select({ id: roles.id }).from(roles).where(inArray(roles.name, unique));
  return rows.length === unique.length ? rows.map((r) => r.id) : null;
};

const usernameTaken = async (username: string, exceptId?: number) => {
  const [row] = await db.select({ id: users.id }).from(users).where(eq(users.username, username)).limit(1);
  return !!row && row.id !== exceptId;
};

router.get("/users", canManageUsers, async (c) => {
  const { search, role, page = "1", limit = "10" } = c.req.query();
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

  const conditions = [];
  if (search) conditions.push(or(ilike(users.username, `%${search}%`), ilike(users.fullName, `%${search}%`)));
  if (role) {
    conditions.push(
      exists(
        db
          .select({ one: sql`1` })
          .from(userRoles)
          .innerJoin(roles, eq(roles.id, userRoles.roleId))
          .where(and(eq(userRoles.userId, users.id), eq(roles.name, role)))
      )
    );
  }
  const where = conditions.length ? and(...conditions) : undefined;

  const [rows, [{ total }]] = await Promise.all([
    db
      .select({
        id: users.id,
        username: users.username,
        fullName: users.fullName,
        isActive: users.isActive,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(where)
      .orderBy(asc(users.username))
      .limit(limitNum)
      .offset((pageNum - 1) * limitNum),
    db.select({ total: sql<number>`count(*)::int` }).from(users).where(where),
  ]);

  const roleRows = rows.length
    ? await db
        .select({ userId: userRoles.userId, name: roles.name, label: roles.label })
        .from(userRoles)
        .innerJoin(roles, eq(roles.id, userRoles.roleId))
        .where(inArray(userRoles.userId, rows.map((u) => u.id)))
        .orderBy(asc(roles.id))
    : [];

  return c.json({
    data: rows.map((u) => ({
      ...u,
      roles: roleRows.filter((r) => r.userId === u.id).map(({ name, label }) => ({ name, label })),
    })),
    pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
  });
});

router.post("/users", canManageUsers, zValidator("json", userSchema), async (c) => {
  const { password, roles: roleNames, ...data } = c.req.valid("json");

  if (!password) return c.json({ error: "Password wajib diisi" }, 400);
  const roleIds = await resolveRoleIds(roleNames);
  if (!roleIds) return c.json({ error: "Ada role yang tidak ditemukan" }, 400);
  if (await usernameTaken(data.username)) return c.json({ error: `Username "${data.username}" sudah dipakai` }, 400);

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await db.transaction(async (tx) => {
    const [user] = await tx.insert(users).values({ ...data, passwordHash }).returning({ id: users.id });
    await tx.insert(userRoles).values(roleIds.map((roleId) => ({ userId: user.id, roleId })));
    return user;
  });
  return c.json(user, 201);
});

router.put("/users/:id", canManageUsers, zValidator("json", userSchema), async (c) => {
  const id = parseInt(c.req.param("id"));
  const { password, roles: roleNames, ...data } = c.req.valid("json");
  const me = c.get("user");

  const roleIds = await resolveRoleIds(roleNames);
  if (!roleIds) return c.json({ error: "Ada role yang tidak ditemukan" }, 400);
  if (await usernameTaken(data.username, id)) return c.json({ error: `Username "${data.username}" sudah dipakai` }, 400);

  if (id === me.id) {
    if (data.isActive === false) return c.json({ error: "Tidak bisa menonaktifkan akun Anda sendiri" }, 400);
    const newPerms = await getPermissionsForRoles(roleNames);
    if (!newPerms.includes("users.manage")) {
      return c.json({ error: "Role Anda sendiri harus tetap punya akses kelola user" }, 400);
    }
  }

  const passwordHash = password ? await bcrypt.hash(password, 10) : undefined;
  const updated = await db.transaction(async (tx) => {
    const [updated] = await tx
      .update(users)
      .set({ ...data, ...(passwordHash ? { passwordHash } : {}), updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning({ id: users.id });
    if (!updated) return null;
    await tx.delete(userRoles).where(eq(userRoles.userId, id));
    await tx.insert(userRoles).values(roleIds.map((roleId) => ({ userId: id, roleId })));
    return updated;
  });
  if (!updated) return c.json({ error: "User tidak ditemukan" }, 404);
  return c.json(updated);
});

router.delete("/users/:id", canManageUsers, async (c) => {
  const id = parseInt(c.req.param("id"));
  if (id === c.get("user").id) return c.json({ error: "Tidak bisa menghapus akun Anda sendiri" }, 400);

  try {
    const [deleted] = await db.delete(users).where(eq(users.id, id)).returning({ id: users.id });
    if (!deleted) return c.json({ error: "User tidak ditemukan" }, 404);
  } catch {
    // FK created_by / updated_by di tabel lain masih mengacu ke user ini
    return c.json({ error: "User sudah punya riwayat data, nonaktifkan saja akunnya" }, 400);
  }
  return c.json({ message: "User berhasil dihapus" });
});

export default router;
