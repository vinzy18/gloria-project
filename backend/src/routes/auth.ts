import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { db } from "../db/index";
import { users } from "../db/schema";
import { authMiddleware } from "../middleware/auth";

const router = new Hono();

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

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

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET ?? "secret",
    { expiresIn: "7d" }
  );

  return c.json({
    token,
    user: { id: user.id, username: user.username, role: user.role },
  });
});

router.get("/me", authMiddleware, async (c) => {
  const user = c.get("user");
  return c.json({ id: user.id, username: user.username, role: user.role });
});

export default router;
