import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { db } from "../db/index";
import { news } from "../db/schema";
import { authMiddleware } from "../middleware/auth";

const router = new Hono();

const newsSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  excerpt: z.string().optional(),
  content: z.string().min(1),
  coverImage: z.string().optional(),
  isPublished: z.boolean().optional(),
  publishedAt: z.string().optional(),
});

// Public: list published news
router.get("/", async (c) => {
  const data = await db
    .select()
    .from(news)
    .where(eq(news.isPublished, true))
    .orderBy(desc(news.publishedAt));
  return c.json(data);
});

// Public: get by slug
router.get("/:slug", async (c) => {
  const slug = c.req.param("slug");
  const [item] = await db.select().from(news).where(eq(news.slug, slug)).limit(1);
  if (!item || !item.isPublished) return c.json({ error: "Berita tidak ditemukan" }, 404);
  return c.json(item);
});

// Admin: list all
router.get("/admin/all", authMiddleware, async (c) => {
  const data = await db.select().from(news).orderBy(desc(news.createdAt));
  return c.json(data);
});

// Admin: create
router.post("/", authMiddleware, zValidator("json", newsSchema), async (c) => {
  const user = c.get("user");
  const data = c.req.valid("json");
  const [item] = await db.insert(news).values({
    ...data,
    authorId: user.id,
    publishedAt: data.isPublished ? new Date() : undefined,
    updatedAt: new Date(),
  }).returning();
  return c.json(item, 201);
});

// Admin: update
router.put("/:id", authMiddleware, zValidator("json", newsSchema), async (c) => {
  const id = parseInt(c.req.param("id"));
  const data = c.req.valid("json");
  const [item] = await db
    .update(news)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(news.id, id))
    .returning();
  if (!item) return c.json({ error: "Berita tidak ditemukan" }, 404);
  return c.json(item);
});

// Admin: delete
router.delete("/:id", authMiddleware, async (c) => {
  const id = parseInt(c.req.param("id"));
  const [deleted] = await db.delete(news).where(eq(news.id, id)).returning();
  if (!deleted) return c.json({ error: "Berita tidak ditemukan" }, 404);
  return c.json({ message: "Berita berhasil dihapus" });
});

export default router;
