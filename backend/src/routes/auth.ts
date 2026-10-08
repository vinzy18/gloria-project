import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { db } from "../db/index";
import { users } from "../db/schema";
import { authMiddleware, getPermissionsForRoles, getUserRoles } from "../middleware/auth";

const router = new Hono();

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

// Data user + role + permission gabungan, dipakai frontend untuk menu & akses halaman
async function buildAuthUser(user: { id: number; username: string; fullName: string | null }) {
  const userRoleRows = await getUserRoles(user.id);
  return {
    id: user.id,
    username: user.username,
    fullName: user.fullName,
    roles: userRoleRows,
    permissions: await getPermissionsForRoles(userRoleRows.map((r) => r.name)),
  };
}

router.post("/login", zValidator("json", loginSchema), async (c) => {
  const { username, password } = c.req.valid("json");

  const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1);
  if (!user) {
    return c.json({ error: "Username atau password salah" }, 401);
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return c.json({ error: "Username atau password salah" }, 401);
  }
  if (!user.isActive) {
    return c.json({ error: "Akun Anda sudah dinonaktifkan" }, 403);
  }

  const token = jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return c.json({ token, user: await buildAuthUser(user) });
});

// Dipanggil frontend untuk sinkron role & permission terbaru
router.get("/me", authMiddleware, async (c) => {
  const { id } = c.get("user");
  const [user] = await db
    .select({ id: users.id, username: users.username, fullName: users.fullName })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);
  return c.json(await buildAuthUser(user));
});

export default router;
