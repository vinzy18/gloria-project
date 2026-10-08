import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { eq, asc, ilike, and, sql, desc } from "drizzle-orm";
import { db } from "../db/index";
import { events } from "../db/schema";
import { authMiddleware, requirePermission } from "../middleware/auth";

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
router.get("/admin/all", authMiddleware, requirePermission("events.manage"), async (c) => {
  // const data = await db.select().from(events).orderBy(asc(events.startDate));
  // return c.json(data);

  const { search, isActive, page = "1", limit = "20" } = c.req.query();
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;
  
    // Build filters
    const filters = [];
    if (search) {
      filters.push(ilike(events.title, `%${search}%`));
    }
    if (isActive !== undefined) {
      filters.push(eq(events.isActive, isActive === "true"));
    }
  
    const combinedFilter = filters.length === 0
      ? undefined
      : filters.length === 1 ? filters[0]! : and(...filters)!;
  
    const [data, [{ count }]] = await Promise.all([
      db.select()
        .from(events)
        .where(combinedFilter)
        .limit(limitNum)
        .offset(offset)
        .orderBy(desc(events.createdAt)),
  
      db.select({ count: sql<number>`count(*)` })
        .from(events)
        .where(combinedFilter),
    ]);
    const total = Number(count);
  
    return c.json({
      data,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
});

// Admin: create
router.post("/", authMiddleware, requirePermission("events.manage"), zValidator("json", eventSchema), async (c) => {
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
router.put("/:id", authMiddleware, requirePermission("events.manage"), zValidator("json", eventSchema), async (c) => {
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
router.delete("/:id", authMiddleware, requirePermission("events.manage"), async (c) => {
  const id = parseInt(c.req.param("id"));
  const [deleted] = await db.delete(events).where(eq(events.id, id)).returning();
  if (!deleted) return c.json({ error: "Event tidak ditemukan" }, 404);
  return c.json({ message: "Event berhasil dihapus" });
});

export default router;
