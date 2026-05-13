import { createMiddleware } from "hono/factory";
import jwt from "jsonwebtoken";

export type JwtPayload = {
  id: number;
  username: string;
  role: string;
};

declare module "hono" {
  interface ContextVariableMap {
    user: JwtPayload;
  }
}

export const authMiddleware = createMiddleware(async (c, next) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET ?? "secret") as JwtPayload;
    c.set("user", payload);
    await next();
  } catch {
    return c.json({ error: "Token tidak valid atau sudah kadaluarsa" }, 401);
  }
});
