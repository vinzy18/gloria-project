import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { eq, asc } from "drizzle-orm";
import { db } from "../db/index";
import { organization } from "../db/schema";
import { authMiddleware } from "../middleware/auth";

const router = new Hono();

const orgSchema = z.object({
  name: z.string().min(1),
  position: z.string().min(1),
  department: z.string().optional(),
  photoUrl: z.string().optional(),
  displayOrder: z.number().optional(),
  isActive: z.boolean().optional(),
});

// Public: list active jemaat
router.get("/", async (c) => {
  const data = await db
    .select()
    .from(organization)
    .where(eq(organization.isActive, true))
    .orderBy(asc(organization.displayOrder));
  return c.json(data);
});

// Admin: list all
router.get("/admin/all", authMiddleware, async (c) => {
  const data = await db.select().from(organization).orderBy(asc(organization.displayOrder));
  return c.json(data);
});

// Admin: create
router.post("/", authMiddleware, zValidator("json", orgSchema), async (c) => {
  const data = c.req.valid("json");
  const [item] = await db.insert(organization).values(data).returning();
  return c.json(item, 201);
});

// Admin: update
router.put("/:id", authMiddleware, zValidator("json", orgSchema), async (c) => {
  const id = parseInt(c.req.param("id"));
  const data = c.req.valid("json");
  const [item] = await db
    .update(organization)
    .set(data)
    .where(eq(organization.id, id))
    .returning();
  if (!item) return c.json({ error: "Data tidak ditemukan" }, 404);
  return c.json(item);
});

// Admin: delete
router.delete("/:id", authMiddleware, async (c) => {
  const id = parseInt(c.req.param("id"));
  const [deleted] = await db.delete(organization).where(eq(organization.id, id)).returning();
  if (!deleted) return c.json({ error: "Data tidak ditemukan" }, 404);
  return c.json({ message: "Data berhasil dihapus" });
});

export default router;
