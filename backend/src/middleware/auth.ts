import { createMiddleware } from "hono/factory";
import jwt from "jsonwebtoken";
import { asc, eq } from "drizzle-orm";
import { db } from "../db/index";
import { users, roles, rolePermissions, userRoles } from "../db/schema";
import type { Permission } from "../shared/permissions";
import { JWT_SECRET } from "../lib/env";

// Role sengaja tidak disimpan di token; selalu dibaca dari DB tiap request
export type JwtPayload = {
  id: number;
  username: string;
};

export type AuthContextUser = JwtPayload & {
  // Kode role (roles.name) yang dimiliki user
  roles: string[];
};

declare module "hono" {
  interface ContextVariableMap {
    user: AuthContextUser;
  }
}

// Cache permission per role; dikosongkan setiap kali role/permission diubah
const permissionCache = new Map<string, string[]>();

export const invalidatePermissionCache = () => permissionCache.clear();

export async function getRolePermissions(roleName: string): Promise<string[]> {
  const cached = permissionCache.get(roleName);
  if (cached) return cached;

  const rows = await db
    .select({ permission: rolePermissions.permission })
    .from(rolePermissions)
    .innerJoin(roles, eq(roles.id, rolePermissions.roleId))
    .where(eq(roles.name, roleName));

  const perms = rows.map((r) => r.permission);
  permissionCache.set(roleName, perms);
  return perms;
}

// Gabungan permission dari semua role
export async function getPermissionsForRoles(roleNames: string[]): Promise<string[]> {
  const lists = await Promise.all(roleNames.map(getRolePermissions));
  return Array.from(new Set(lists.flat()));
}

export async function getUserRoles(userId: number) {
  return db
    .select({ name: roles.name, label: roles.label })
    .from(userRoles)
    .innerJoin(roles, eq(roles.id, userRoles.roleId))
    .where(eq(userRoles.userId, userId))
    .orderBy(asc(roles.id));
}

export const authMiddleware = createMiddleware(async (c, next) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const token = authHeader.slice(7);
  let payload: JwtPayload;
  try {
    payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return c.json({ error: "Token tidak valid atau sudah kadaluarsa" }, 401);
  }

  // Ambil data terbaru dari DB supaya perubahan role / nonaktif user langsung berlaku tanpa login ulang
  const [user] = await db
    .select({ id: users.id, username: users.username, isActive: users.isActive })
    .from(users)
    .where(eq(users.id, payload.id))
    .limit(1);
  if (!user || !user.isActive) {
    return c.json({ error: "Akun tidak ditemukan atau sudah dinonaktifkan" }, 401);
  }

  const userRoleRows = await getUserRoles(user.id);
  c.set("user", { id: user.id, username: user.username, roles: userRoleRows.map((r) => r.name) });
  await next();
});

// Pakai setelah authMiddleware: lolos jika salah satu role user punya salah satu permission
export const requirePermission = (...permissions: Permission[]) =>
  createMiddleware(async (c, next) => {
    const user = c.get("user");
    const owned = user ? await getPermissionsForRoles(user.roles) : [];
    if (!permissions.some((p) => owned.includes(p))) {
      return c.json({ error: "Anda tidak memiliki akses untuk aksi ini" }, 403);
    }
    await next();
  });
