import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { eq, desc, and, ilike, sql } from "drizzle-orm";
import { db } from "../db/index";
import { warta } from "../db/schema";
import { authMiddleware, requirePermission } from "../middleware/auth";

const router = new Hono();

const wartaSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  excerpt: z.string().optional(),
  content: z.string().min(1),
  coverImage: z.string().nullish(),
  isPublished: z.boolean().optional(),
  publishedAt: z.string().nullish(),
});

// Public: list published warta
router.get("/", async (c) => {
  const data = await db
    .select()
    .from(warta)
    .where(eq(warta.isPublished, true))
    .orderBy(desc(warta.publishedAt));
  return c.json(data);
});

// Public: get by slug
router.get("/:slug", async (c) => {
  const slug = c.req.param("slug");
  const [item] = await db.select().from(warta).where(eq(warta.slug, slug)).limit(1);
  if (!item || !item.isPublished) return c.json({ error: "Warta tidak ditemukan" }, 404);
  return c.json(item);
});

// Admin: list all
router.get("/admin/all", authMiddleware, requirePermission("warta.manage"), async (c) => {
  const { search, isPublish, page = "1", limit = "20" } = c.req.query();
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const offset = (pageNum - 1) * limitNum;

  // Build filters
  const filters = [];
  if (search) {
    filters.push(ilike(warta.title, `%${search}%`));
  }
  if (isPublish !== undefined) {
    filters.push(eq(warta.isPublished, isPublish === "true"));
  }

  const combinedFilter = filters.length === 0
    ? undefined
    : filters.length === 1 ? filters[0]! : and(...filters)!;

  const [data, [{ count }]] = await Promise.all([
    db.select()
      .from(warta)
      .where(combinedFilter)
      .limit(limitNum)
      .offset(offset)
      .orderBy(desc(warta.createdAt)),

    db.select({ count: sql<number>`count(*)` })
      .from(warta)
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
router.post("/", authMiddleware, requirePermission("warta.manage"), zValidator("json", wartaSchema), async (c) => {
  const user = c.get("user");
  const { publishedAt: _, ...data } = c.req.valid("json");
  const [item] = await db.insert(warta).values({
    ...data,
    authorId: user.id,
    publishedAt: data.isPublished ? new Date() : undefined,
    updatedAt: new Date(),
  }).returning();
  return c.json(item, 201);
});

// Admin: update
router.put("/:id", authMiddleware, requirePermission("warta.manage"), zValidator("json", wartaSchema), async (c) => {
  const id = parseInt(c.req.param("id"));
  const { publishedAt: _, ...data } = c.req.valid("json");

  const [existing] = await db.select().from(warta).where(eq(warta.id, id)).limit(1);
  if (!existing) return c.json({ error: "Warta tidak ditemukan" }, 404);

  // Baru dipublish -> isi tanggal hari ini; sudah publish -> pertahankan; unpublish -> kosongkan
  const publishedAt = data.isPublished
    ? existing.isPublished && existing.publishedAt ? existing.publishedAt : new Date()
    : null;

  const [item] = await db
    .update(warta)
    .set({ ...data, publishedAt, updatedAt: new Date() })
    .where(eq(warta.id, id))
    .returning();
  return c.json(item);
});

// Admin: delete
router.delete("/:id", authMiddleware, requirePermission("warta.manage"), async (c) => {
  const id = parseInt(c.req.param("id"));
  const [deleted] = await db.delete(warta).where(eq(warta.id, id)).returning();
  if (!deleted) return c.json({ error: "Warta tidak ditemukan" }, 404);
  return c.json({ message: "Warta berhasil dihapus" });
});

export default router;
