import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { eq, asc } from "drizzle-orm";
import { db } from "../db/index";
import { events } from "../db/schema";
import { authMiddleware } from "../middleware/auth";

const router = new Hono();

const eventSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  location: z.string().optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
  coverImage: z.string().optional(),
  isActive: z.boolean().optional(),
});

// Public: list active events
router.get("/", async (c) => {
  const data = await db
    .select()
    .from(events)
    .where(eq(events.isActive, true))
    .orderBy(asc(events.startDate));
  return c.json(data);
});

// Public: get by id
router.get("/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  const [item] = await db.select().from(events).where(eq(events.id, id)).limit(1);
  if (!item) return c.json({ error: "Event tidak ditemukan" }, 404);
  return c.json(item);
});

// Admin: list all
router.get("/admin/all", authMiddleware, async (c) => {
  const data = await db.select().from(events).orderBy(asc(events.startDate));
  return c.json(data);
});

// Admin: create
router.post("/", authMiddleware, zValidator("json", eventSchema), async (c) => {
  const data = c.req.valid("json");
  const [item] = await db.insert(events).values({
    ...data,
    startDate: new Date(data.startDate),
    endDate: data.endDate ? new Date(data.endDate) : undefined,
    updatedAt: new Date(),
  }).returning();
  return c.json(item, 201);
});

// Admin: update
router.put("/:id", authMiddleware, zValidator("json", eventSchema), async (c) => {
  const id = parseInt(c.req.param("id"));
  const data = c.req.valid("json");
  const [item] = await db
    .update(events)
    .set({
      ...data,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      updatedAt: new Date(),
    })
    .where(eq(events.id, id))
    .returning();
  if (!item) return c.json({ error: "Event tidak ditemukan" }, 404);
  return c.json(item);
});

// Admin: delete
router.delete("/:id", authMiddleware, async (c) => {
  const id = parseInt(c.req.param("id"));
  const [deleted] = await db.delete(events).where(eq(events.id, id)).returning();
  if (!deleted) return c.json({ error: "Event tidak ditemukan" }, 404);
  return c.json({ message: "Event berhasil dihapus" });
});

export default router;
