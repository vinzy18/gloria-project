import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { eq, ilike, or, and, sql, asc, desc } from "drizzle-orm";
import { db } from "../db/index";
import { bpmj, pelsus, bpmjPosition, pelsusPosition } from "../db/schema";
import { authMiddleware, requirePermission } from "../middleware/auth";

const router = new Hono();

const bpmjSchema = z.object({
  name: z.string().min(1),
  positionId: z.number().optional(),
  photoUrl: z.string().nullish(),
  displayOrder: z.number().optional(),
  isActive: z.boolean().optional(),
});

const pelsusSchema = z.object({
  name: z.string().min(1),
  positionId: z.number().optional(),
  pelsus: z.string().nullish(),
  pelayanan: z.string().nullish(),
  photoUrl: z.string().nullish(),
  isActive: z.boolean().optional(),
});

// Public: combined organization data
router.get("/", async (c) => {
  const [bpmjData, pelsusData] = await Promise.all([
    db.select({
      id: bpmj.id,
      name: bpmj.name,
      positionName: bpmjPosition.name,
      photoUrl: bpmj.photoUrl,
      displayOrder: bpmj.displayOrder,
      isActive: bpmj.isActive,
    })
    .from(bpmj)
    .leftJoin(bpmjPosition, eq(bpmj.positionId, bpmjPosition.id))
    .where(eq(bpmj.isActive, true))
    .orderBy(asc(bpmj.displayOrder)),

    db.select({
      id: pelsus.id,
      name: pelsus.name,
      positionName: pelsusPosition.name,
      pelsus: pelsus.pelsus,
      pelayanan: pelsus.pelayanan,
      photoUrl: pelsus.photoUrl,
      isActive: pelsus.isActive,
    })
    .from(pelsus)
    .leftJoin(pelsusPosition, eq(pelsus.positionId, pelsusPosition.id))
    .where(eq(pelsus.isActive, true)),
  ]);
  return c.json({ bpmj: bpmjData, pelsus: pelsusData });
});

// Admin BPMJ Routes
router.get("/admin/bpmj", authMiddleware, requirePermission("organization.manage"), async (c) => {
  const { search, isActive, page = "1", limit = "20" } = c.req.query();
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const offset = (pageNum - 1) * limitNum;

  // Build filters
  const filters = [];
  if (search) {
    filters.push(
      ilike(bpmj.name, `%${search}%`)
    );
  }
  if (isActive !== undefined) {
    filters.push(eq(bpmj.isActive, isActive === "true"));
  }

  const combinedFilter = filters.length === 0
    ? undefined
    : filters.length === 1 ? filters[0]! : and(...filters)!;

  const [data, [{ count }]] = await Promise.all([
    db.select({
      id: bpmj.id,
      name: bpmj.name,
      positionId: bpmj.positionId,
      positionName: bpmjPosition.name,
      photoUrl: bpmj.photoUrl,
      displayOrder: bpmj.displayOrder,
      isActive: bpmj.isActive,
    })
    .from(bpmj)
    .leftJoin(bpmjPosition, eq(bpmj.positionId, bpmjPosition.id))
    .where(combinedFilter)
    .limit(limitNum)
    .offset(offset)
    .orderBy(asc(bpmj.displayOrder)),

    db.select({ count: sql<number>`count(*)` })
      .from(bpmj)
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
})

router.get("/admin/bpmj/:id", authMiddleware, requirePermission("organization.manage"), async (c) => {
  const id = parseInt(c.req.param("id"))

  const [data] = await db.select({
      id: bpmj.id,
      name: bpmj.name,
      positionId: bpmj.positionId,
      positionName: bpmjPosition.name,
      photoUrl: bpmj.photoUrl,
    })
    .from(bpmj)
    .leftJoin(bpmjPosition, eq(bpmj.positionId, bpmjPosition.id))
    .where(eq(bpmj.id, id))
    .limit(1)
  
  if(!data) return c.json({ error: "Data BPMJ tidak ditemukan" }, 404)

  return c.json(data);
})

router.post("/admin/bpmj", authMiddleware, requirePermission("organization.manage"), zValidator("json", bpmjSchema), async (c) => {
  const data = c.req.valid("json");
  const [{ maxOrder } = { maxOrder: 0 }] = await db
    .select({ maxOrder: sql<number>`max("display_order")` })
    .from(bpmj);
  const displayOrder = data.displayOrder ?? ((maxOrder ?? 0) + 1);
  
  const [item] = await db.insert(bpmj).values({
    ...data,
    displayOrder,
  }).returning();
  return c.json(item, 201);
})

router.put("/admin/bpmj/:id", authMiddleware, requirePermission("organization.manage"), zValidator("json", bpmjSchema), async (c) => {
  const id = parseInt(c.req.param("id"));
  const data = c.req.valid("json");

  const [item] = await db
    .update(bpmj)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(bpmj.id, id))
    .returning();

  if (!item) return c.json({ error: "Data BPMJ tidak ditemukan" }, 404);
  return c.json(item);
});

router.delete("/admin/bpmj/:id", authMiddleware, requirePermission("organization.manage"), async (c) => {
  const id = parseInt(c.req.param("id"));
  const [deleted] = await db.delete(bpmj).where(eq(bpmj.id, id)).returning();
  if(!deleted) return c.json({ error: "Data BPMJ tidak ditemukan" }, 404);
  return c.json({ message: "Data BPMJ berhasil dihapus" })
})

// Admin Pelsus Routes
router.get("/admin/pelsus", authMiddleware, requirePermission("organization.manage"), async (c) => {
  const { search, isActive, page = "1", limit = "20" } = c.req.query();
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const offset = (pageNum - 1) * limitNum;

  // Build filters
  const filters = [];
  if (search) {
    filters.push(
      ilike(pelsus.name, `%${search}%`)
    );
  }
  if (isActive !== undefined) {
    filters.push(eq(pelsus.isActive, isActive === "true"));
  }

  const combinedFilter = filters.length === 0
    ? undefined
    : filters.length === 1 ? filters[0]! : and(...filters)!;

  const [data, [{ count }]] = await Promise.all([
    db.select({
      id: pelsus.id,
      name: pelsus.name,
      positionId: pelsus.positionId,
      positionName: pelsusPosition.name,
      pelsus: pelsus.pelsus,
      pelayanan: pelsus.pelayanan,
      photoUrl: pelsus.photoUrl,
      isActive: pelsus.isActive,
    })
    .from(pelsus)
    .leftJoin(pelsusPosition, eq(pelsus.positionId, pelsusPosition.id))
    .where(combinedFilter)
    .limit(limitNum)
    .offset(offset)
    .orderBy(asc(pelsus.positionId), asc(pelsus.pelsus), asc(pelsus.pelayanan)),

    db.select({ count: sql<number>`count(*)` })
      .from(pelsus)
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
})

router.get("/admin/pelsus/:id", authMiddleware, requirePermission("organization.manage"), async (c) => {
  const id = parseInt(c.req.param("id"))
  const [data] = await db.select({
    id: pelsus.id,
    name:pelsus.name,
    positionId: pelsus.positionId,
    positionName: pelsusPosition.name,
    pelsus: pelsus.pelsus,
    pelayanan: pelsus.pelayanan,
    photoUrl: pelsus.photoUrl,
  })
  .from(pelsus)
  .leftJoin(pelsusPosition, eq(pelsus.positionId, pelsusPosition.id))
  .where(eq(pelsus.id, id))
  .limit(1)

  if(!data) return c.json ({ error: "Data Pelsus tidak ditemukan" }, 404)

  return c.json(data);
})

router.post("/admin/pelsus", authMiddleware, requirePermission("organization.manage"), zValidator("json", pelsusSchema), async (c) => {
  const data = c.req.valid("json");

  const [item] = await db.insert(pelsus).values({
    ...data,
  }).returning();
  return c.json(item, 201);
})

router.put("/admin/pelsus/:id", authMiddleware, requirePermission("organization.manage"), zValidator("json", pelsusSchema), async (c) => {
  const id = parseInt(c.req.param("id"));
  const data = c.req.valid("json");

  const [item] = await db
    .update(pelsus)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(pelsus.id, id))
    .returning();

  if (!item) return c.json({ error: "Data Pelsus tidak ditemukan" }, 404);
  return c.json(item);
});

router.delete("/admin/pelsus/:id", authMiddleware, requirePermission("organization.manage"), async (c) => {
  const id = parseInt(c.req.param("id"));
  const [deleted] = await db.delete(pelsus).where(eq(pelsus.id, id)).returning();
  if(!deleted) return c.json({ error: "Data Pelsus tidak ditemukan" }, 404);
  return c.json({ message: "Data Pelsus berhasil dihapus" })
})

export default router;
