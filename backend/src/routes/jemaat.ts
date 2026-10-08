import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { and, eq, ilike, like, ne, or, sql } from "drizzle-orm";
import { db } from "../db/index";
import { jemaat } from "../db/schema";
import { authMiddleware, requirePermission } from "../middleware/auth";

const router = new Hono();

// All jemaat routes require auth
router.use("*", authMiddleware);

const jemaatSchema = z.object({
  idJemaat: z.string().nullish(),
  nama: z.string().min(1, "Nama Lengkap wajib diisi"),
  nik: z.string().regex(/^\d{16}$/, "NIK wajib diisi dan harus 16 digit angka"),
  gender: z.enum(["Laki-laki", "Perempuan"], { errorMap: () => ({ message: "Jenis Kelamin wajib diisi" }) }),
  tempatLahir: z.string().nullish(),
  tanggalLahir: z.string().nullish(),
  alamat: z.string().nullish(),
  phone: z.string().nullish(),
  email: z.string().email().nullish().or(z.literal("")),
  statusPernikahan: z.enum(["Belum Menikah", "Menikah", "Duda", "Janda", "Cerai"]).nullish(),
  tanggalPernikahan: z.string().nullish(),
  tanggalBaptis: z.string().nullish(),
  kolom: z.string().nullish(),
  pekerjaan: z.string().nullish(),
  keluarga: z.string().nullish(),
  bipra: z.string().min(1, "BIPRA wajib diisi"),
  joinDate: z.string().min(1, "Tanggal Bergabung wajib diisi"),
  photoUrl: z.string().nullish(),
  isActive: z.boolean().optional(),
  notes: z.string().nullish(),
});

// GET /api/jemaat
router.get("/", requirePermission("jemaat.view"), async (c) => {
  const { search, isActive, page = "1", limit = "20" } = c.req.query();
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const offset = (pageNum - 1) * limitNum;

  let query = db.select().from(jemaat);

  // Build filters
  const filters = [];
  if (search) {
    filters.push(
      or(
        ilike(jemaat.nama, `%${search}%`),
        ilike(jemaat.idJemaat, `%${search}%`),
        ilike(jemaat.nik, `%${search}%`),
        ilike(jemaat.phone, `%${search}%`),
        ilike(jemaat.email, `%${search}%`)
      )
    );
  }
  if (isActive !== undefined) {
    filters.push(eq(jemaat.isActive, isActive === "true"));
  }

  const countQuery = db
    .select({ count: sql<number>`count(*)` })
    .from(jemaat);

  let data, total;
  if (filters.length > 0) {
    const combinedFilter = filters.length === 1 ? filters[0]! : filters[0];
    data = await db.select().from(jemaat).where(combinedFilter).limit(limitNum).offset(offset).orderBy(jemaat.nama);
    const [{ count }] = await countQuery.where(combinedFilter);
    total = Number(count);
  } else {
    data = await db.select().from(jemaat).limit(limitNum).offset(offset).orderBy(jemaat.nama);
    const [{ count }] = await countQuery;
    total = Number(count);
  }

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

// GET /api/jemaat/:id
router.get("/:id", requirePermission("jemaat.view"), async (c) => {
  const id = parseInt(c.req.param("id"));
  const [jmt] = await db.select().from(jemaat).where(eq(jemaat.id, id)).limit(1);
  if (!jmt) return c.json({ error: "Anggota tidak ditemukan" }, 404);
  return c.json(jmt);
});

// POST /api/jemaat
router.post("/", requirePermission("jemaat.manage"), zValidator("json", jemaatSchema), async (c) => {
  const data = c.req.valid("json");

  if (data.nik) {
    const [existing] = await db.select().from(jemaat).where(eq(jemaat.nik, data.nik)).limit(1);
    if (existing) {
      return c.json({ error: `NIK ${data.nik} sudah terdaftar atas nama ${existing.nama}` }, 409);
    }
  }

  const baseDate = new Date();
  const yy = String(baseDate.getFullYear()).slice(-2);
  const mm = String(baseDate.getMonth() + 1).padStart(2, "0");
  const prefix = `${yy}${mm}`;

  const [maxRow] = await db
    .select({ maxId: sql<string | null>`MAX(${jemaat.idJemaat})` })
    .from(jemaat)
    .where(like(jemaat.idJemaat, `${prefix}%`));

  const lastNum = maxRow?.maxId ? parseInt(maxRow.maxId.slice(4)) : 0;
  const idJemaat = `${prefix}${String((isNaN(lastNum) ? 0 : lastNum) + 1).padStart(3, "0")}`;

  const [jmt] = await db.insert(jemaat).values({
    ...data,
    idJemaat,
    nik: data.nik || undefined,
    email: data.email || undefined,
    updatedAt: new Date(),
  }).returning();
  return c.json(jmt, 201);
});

// PUT /api/jemaat/:id
router.put("/:id", requirePermission("jemaat.manage"), zValidator("json", jemaatSchema), async (c) => {
  const id = parseInt(c.req.param("id"));
  const data = c.req.valid("json");

  if (data.nik) {
    const [existing] = await db
      .select()
      .from(jemaat)
      .where(and(eq(jemaat.nik, data.nik), ne(jemaat.id, id)))
      .limit(1);
    if (existing) {
      return c.json({ error: `NIK ${data.nik} sudah terdaftar atas nama ${existing.nama}` }, 409);
    }
  }

  const [jmt] = await db
    .update(jemaat)
    .set({ ...data, nik: data.nik || undefined, email: data.email || undefined, updatedAt: new Date() })
    .where(eq(jemaat.id, id))
    .returning();

  if (!jmt) return c.json({ error: "Data Jemaat tidak ditemukan" }, 404);
  return c.json(jmt);
});

// DELETE /api/jemaat/:id
router.delete("/:id", requirePermission("jemaat.manage"), async (c) => {
  const id = parseInt(c.req.param("id"));
  const [deleted] = await db.delete(jemaat).where(eq(jemaat.id, id)).returning();
  if (!deleted) return c.json({ error: "Data Jemaat tidak ditemukan" }, 404);
  return c.json({ message: "Data Jemaat berhasil dihapus" });
});

export default router;
