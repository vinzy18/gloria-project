import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { eq, ilike, or, and, sql, asc, desc, inArray } from "drizzle-orm";
import { db } from "../db/index";
import {
  users,
  masterPemasukanLain,
  masterPengeluaran,
  beritaAcaraKeuangan,
  beritaAcaraPemasukanLain,
  beritaAcaraPengeluaran,
} from "../db/schema";
import { authMiddleware, requirePermission } from "../middleware/auth";
import { terbilang } from "../lib/terbilang";

const router = new Hono();

router.use("*", authMiddleware);

const canRead = requirePermission("berita_acara.view");
const canManage = requirePermission("berita_acara.manage");
const canApprove = requirePermission("berita_acara.approve");

const EDITABLE_STATUS = ["draft", "rejected"];

const rupiah = z.number().int().min(0);

const pemasukanLainSchema = z.object({
  masterId: z.number().int(),
  jumlah: rupiah,
  keterangan: z.string().nullish(),
});

const pengeluaranSchema = z.object({
  masterId: z.number().int(),
  nama: z.string().max(255).nullish(),
  jumlah: rupiah,
  signature: z
    .string()
    .startsWith("data:image/png;base64,")
    .max(500_000)
    .nullish(),
  signedAt: z.string().datetime().nullish(),
  status: z.enum(["pending", "confirmed", "dikembalikan"]),
  statusAt: z.string().datetime().nullish(),
});

const beritaAcaraSchema = z.object({
  jenisIbadah: z.string().trim().min(1).max(100),
  tanggalIbadah: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  khadim: z.string().trim().min(1).max(255),
  kantongPersembahan: rupiah,
  kotakPersembahan: rupiah,
  kotakPembangunan: rupiah,
  keteranganPemasukan: z.string().nullish(),
  keteranganPengeluaran: z.string().nullish(),
  pemasukanLain: z.array(pemasukanLainSchema),
  pengeluaran: z.array(pengeluaranSchema),
  // true = submit ke bendahara, false = simpan draft
  submit: z.boolean().default(false),
});

type BeritaAcaraInput = z.infer<typeof beritaAcaraSchema>;

// Hitung ulang di server supaya angka yang tersimpan selalu konsisten
function hitung(data: BeritaAcaraInput) {
  const jumlahPemasukan =
    data.kantongPersembahan +
    data.kotakPersembahan +
    data.kotakPembangunan +
    data.pemasukanLain.reduce((sum, p) => sum + p.jumlah, 0);
  const jumlahPengeluaran = data.pengeluaran
    .filter((p) => p.status !== "dikembalikan")
    .reduce((sum, p) => sum + p.jumlah, 0);
  return {
    jumlahPemasukan,
    terbilangPemasukan: terbilang(jumlahPemasukan).slice(0, 255),
    jumlahPengeluaran,
    totalSaldo: jumlahPemasukan - jumlahPengeluaran,
  };
}

async function validasiSubmit(data: BeritaAcaraInput): Promise<string | null> {
  const required = await db
    .select({ id: masterPengeluaran.id, name: masterPengeluaran.name })
    .from(masterPengeluaran)
    .where(and(eq(masterPengeluaran.isRequired, true), eq(masterPengeluaran.isActive, true)));

  const missing = required.filter((m) => !data.pengeluaran.some((p) => p.masterId === m.id));
  if (missing.length) return `Pengeluaran wajib belum ada: ${missing.map((m) => m.name).join(", ")}`;

  if (data.pengeluaran.some((p) => !p.nama?.trim())) return "Semua nama petugas pengeluaran wajib diisi";
  if (data.pengeluaran.some((p) => !p.signature)) return "Semua point pengeluaran wajib ditandatangani";
  if (data.pengeluaran.some((p) => p.status === "pending"))
    return "Semua point pengeluaran wajib di-Confirm atau Dikembalikan";
  return null;
}

async function simpanDetail(tx: Parameters<Parameters<typeof db.transaction>[0]>[0], id: number, data: BeritaAcaraInput) {
  await tx.delete(beritaAcaraPemasukanLain).where(eq(beritaAcaraPemasukanLain.beritaAcaraId, id));
  await tx.delete(beritaAcaraPengeluaran).where(eq(beritaAcaraPengeluaran.beritaAcaraId, id));

  if (data.pemasukanLain.length) {
    await tx.insert(beritaAcaraPemasukanLain).values(
      data.pemasukanLain.map((p, i) => ({
        beritaAcaraId: id,
        masterId: p.masterId,
        jumlah: p.jumlah,
        keterangan: p.keterangan?.trim() || null,
        urutan: i,
      }))
    );
  }

  if (data.pengeluaran.length) {
    // Nomor urut per master: Pemusik 1, Pemusik 2, ...
    const counter = new Map<number, number>();
    await tx.insert(beritaAcaraPengeluaran).values(
      data.pengeluaran.map((p, i) => {
        const nomor = (counter.get(p.masterId) ?? 0) + 1;
        counter.set(p.masterId, nomor);
        const signed = !!p.signature;
        return {
          beritaAcaraId: id,
          masterId: p.masterId,
          nomor,
          nama: p.nama?.trim() || null,
          jumlah: p.jumlah,
          signature: p.signature ?? null,
          signedAt: signed ? (p.signedAt ? new Date(p.signedAt) : new Date()) : null,
          // Status hanya bermakna kalau sudah ditandatangani
          status: signed ? p.status : "pending",
          statusAt: signed && p.status !== "pending" ? (p.statusAt ? new Date(p.statusAt) : new Date()) : null,
          urutan: i,
        };
      })
    );
  }
}

function headerValues(data: BeritaAcaraInput) {
  return {
    jenisIbadah: data.jenisIbadah,
    tanggalIbadah: data.tanggalIbadah,
    khadim: data.khadim,
    kantongPersembahan: data.kantongPersembahan,
    kotakPersembahan: data.kotakPersembahan,
    kotakPembangunan: data.kotakPembangunan,
    keteranganPemasukan: data.keteranganPemasukan?.trim() || null,
    keteranganPengeluaran: data.keteranganPengeluaran?.trim() || null,
    ...hitung(data),
  };
}

// ─── Master data ─────────────────────────────────────────────────────────────

router.get("/master/pemasukan-lain", canRead, async (c) => {
  const data = await db
    .select({ id: masterPemasukanLain.id, name: masterPemasukanLain.name })
    .from(masterPemasukanLain)
    .where(eq(masterPemasukanLain.isActive, true))
    .orderBy(asc(masterPemasukanLain.displayOrder), asc(masterPemasukanLain.id));
  return c.json(data);
});

router.get("/master/pengeluaran", canRead, async (c) => {
  const data = await db
    .select({
      id: masterPengeluaran.id,
      name: masterPengeluaran.name,
      isRequired: masterPengeluaran.isRequired,
      isMultiple: masterPengeluaran.isMultiple,
      displayOrder: masterPengeluaran.displayOrder,
    })
    .from(masterPengeluaran)
    .where(eq(masterPengeluaran.isActive, true))
    .orderBy(asc(masterPengeluaran.displayOrder), asc(masterPengeluaran.id));
  return c.json(data);
});

// ─── Berita acara keuangan ───────────────────────────────────────────────────

router.get("/keuangan", canRead, async (c) => {
  const { search, status, page = "1", limit = "20" } = c.req.query();
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const offset = (pageNum - 1) * limitNum;

  const filters = [];
  if (search) {
    filters.push(
      or(
        ilike(beritaAcaraKeuangan.jenisIbadah, `%${search}%`),
        ilike(beritaAcaraKeuangan.khadim, `%${search}%`)
      )!
    );
  }
  if (status) filters.push(eq(beritaAcaraKeuangan.status, status));

  const combinedFilter = filters.length === 0 ? undefined : and(...filters);

  const [data, [{ count }]] = await Promise.all([
    db
      .select({
        id: beritaAcaraKeuangan.id,
        jenisIbadah: beritaAcaraKeuangan.jenisIbadah,
        tanggalIbadah: beritaAcaraKeuangan.tanggalIbadah,
        khadim: beritaAcaraKeuangan.khadim,
        jumlahPemasukan: beritaAcaraKeuangan.jumlahPemasukan,
        jumlahPengeluaran: beritaAcaraKeuangan.jumlahPengeluaran,
        totalSaldo: beritaAcaraKeuangan.totalSaldo,
        status: beritaAcaraKeuangan.status,
        submittedAt: beritaAcaraKeuangan.submittedAt,
        approvedAt: beritaAcaraKeuangan.approvedAt,
        updatedAt: beritaAcaraKeuangan.updatedAt,
      })
      .from(beritaAcaraKeuangan)
      .where(combinedFilter)
      .orderBy(desc(beritaAcaraKeuangan.tanggalIbadah), desc(beritaAcaraKeuangan.id))
      .limit(limitNum)
      .offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(beritaAcaraKeuangan).where(combinedFilter),
  ]);
  const total = Number(count);

  return c.json({
    data,
    pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
  });
});

router.get("/keuangan/:id", canRead, async (c) => {
  const id = parseInt(c.req.param("id"));
  const [header] = await db.select().from(beritaAcaraKeuangan).where(eq(beritaAcaraKeuangan.id, id)).limit(1);
  if (!header) return c.json({ error: "Berita acara tidak ditemukan" }, 404);

  const [pemasukanLain, pengeluaran] = await Promise.all([
    db
      .select({
        id: beritaAcaraPemasukanLain.id,
        masterId: beritaAcaraPemasukanLain.masterId,
        masterName: masterPemasukanLain.name,
        jumlah: beritaAcaraPemasukanLain.jumlah,
        keterangan: beritaAcaraPemasukanLain.keterangan,
      })
      .from(beritaAcaraPemasukanLain)
      .innerJoin(masterPemasukanLain, eq(beritaAcaraPemasukanLain.masterId, masterPemasukanLain.id))
      .where(eq(beritaAcaraPemasukanLain.beritaAcaraId, id))
      .orderBy(asc(beritaAcaraPemasukanLain.urutan)),
    db
      .select({
        id: beritaAcaraPengeluaran.id,
        masterId: beritaAcaraPengeluaran.masterId,
        masterName: masterPengeluaran.name,
        isMultiple: masterPengeluaran.isMultiple,
        nomor: beritaAcaraPengeluaran.nomor,
        nama: beritaAcaraPengeluaran.nama,
        jumlah: beritaAcaraPengeluaran.jumlah,
        signature: beritaAcaraPengeluaran.signature,
        signedAt: beritaAcaraPengeluaran.signedAt,
        status: beritaAcaraPengeluaran.status,
        statusAt: beritaAcaraPengeluaran.statusAt,
      })
      .from(beritaAcaraPengeluaran)
      .innerJoin(masterPengeluaran, eq(beritaAcaraPengeluaran.masterId, masterPengeluaran.id))
      .where(eq(beritaAcaraPengeluaran.beritaAcaraId, id))
      .orderBy(asc(beritaAcaraPengeluaran.urutan)),
  ]);

  const userIds = [header.createdBy, header.submittedBy, header.approvedBy, header.rejectedBy].filter(
    (v): v is number => v != null
  );
  const userRows = userIds.length
    ? await db.select({ id: users.id, username: users.username }).from(users).where(inArray(users.id, userIds))
    : [];
  const username = (uid: number | null) => userRows.find((u) => u.id === uid)?.username ?? null;

  return c.json({
    ...header,
    createdByName: username(header.createdBy),
    submittedByName: username(header.submittedBy),
    approvedByName: username(header.approvedBy),
    rejectedByName: username(header.rejectedBy),
    pemasukanLain,
    pengeluaran,
  });
});

router.post("/keuangan", canManage, zValidator("json", beritaAcaraSchema), async (c) => {
  const data = c.req.valid("json");
  const user = c.get("user");

  if (data.submit) {
    const err = await validasiSubmit(data);
    if (err) return c.json({ error: err }, 400);
  }

  const now = new Date();
  const item = await db.transaction(async (tx) => {
    const [row] = await tx
      .insert(beritaAcaraKeuangan)
      .values({
        ...headerValues(data),
        status: data.submit ? "submitted" : "draft",
        submittedAt: data.submit ? now : null,
        submittedBy: data.submit ? user.id : null,
        createdBy: user.id,
        updatedBy: user.id,
      })
      .returning();
    await simpanDetail(tx, row.id, data);
    return row;
  });

  return c.json(item, 201);
});

router.put("/keuangan/:id", canManage, zValidator("json", beritaAcaraSchema), async (c) => {
  const id = parseInt(c.req.param("id"));
  const data = c.req.valid("json");
  const user = c.get("user");

  const [existing] = await db
    .select({ status: beritaAcaraKeuangan.status })
    .from(beritaAcaraKeuangan)
    .where(eq(beritaAcaraKeuangan.id, id))
    .limit(1);
  if (!existing) return c.json({ error: "Berita acara tidak ditemukan" }, 404);
  if (!EDITABLE_STATUS.includes(existing.status)) {
    return c.json({ error: "Berita acara yang sudah disubmit / posted tidak bisa diubah" }, 400);
  }

  if (data.submit) {
    const err = await validasiSubmit(data);
    if (err) return c.json({ error: err }, 400);
  }

  const now = new Date();
  const item = await db.transaction(async (tx) => {
    const [row] = await tx
      .update(beritaAcaraKeuangan)
      .set({
        ...headerValues(data),
        // Simpan draft tidak mengubah status "rejected" supaya catatan bendahara tetap terlihat
        ...(data.submit
          ? { status: "submitted", submittedAt: now, submittedBy: user.id }
          : {}),
        updatedAt: now,
        updatedBy: user.id,
      })
      .where(eq(beritaAcaraKeuangan.id, id))
      .returning();
    await simpanDetail(tx, id, data);
    return row;
  });

  return c.json(item);
});

router.post("/keuangan/:id/approve", canApprove, async (c) => {
  const id = parseInt(c.req.param("id"));
  const user = c.get("user");
  const now = new Date();

  const [item] = await db
    .update(beritaAcaraKeuangan)
    .set({ status: "posted", approvedAt: now, approvedBy: user.id, catatanBendahara: null, updatedAt: now, updatedBy: user.id })
    .where(and(eq(beritaAcaraKeuangan.id, id), eq(beritaAcaraKeuangan.status, "submitted")))
    .returning();

  if (!item) return c.json({ error: "Berita acara tidak ditemukan atau tidak sedang menunggu approval" }, 400);
  return c.json(item);
});

router.post(
  "/keuangan/:id/reject",
  canApprove,
  zValidator("json", z.object({ catatan: z.string().trim().min(1, "Catatan wajib diisi") })),
  async (c) => {
    const id = parseInt(c.req.param("id"));
    const { catatan } = c.req.valid("json");
    const user = c.get("user");
    const now = new Date();

    const [item] = await db
      .update(beritaAcaraKeuangan)
      .set({ status: "rejected", rejectedAt: now, rejectedBy: user.id, catatanBendahara: catatan, updatedAt: now, updatedBy: user.id })
      .where(and(eq(beritaAcaraKeuangan.id, id), eq(beritaAcaraKeuangan.status, "submitted")))
      .returning();

    if (!item) return c.json({ error: "Berita acara tidak ditemukan atau tidak sedang menunggu approval" }, 400);
    return c.json(item);
  }
);

router.delete("/keuangan/:id", canManage, async (c) => {
  const id = parseInt(c.req.param("id"));
  const [deleted] = await db
    .delete(beritaAcaraKeuangan)
    .where(and(eq(beritaAcaraKeuangan.id, id), inArray(beritaAcaraKeuangan.status, EDITABLE_STATUS)))
    .returning();
  if (!deleted) return c.json({ error: "Berita acara tidak ditemukan atau sudah disubmit" }, 400);
  return c.json({ message: "Berita acara berhasil dihapus" });
});

export default router;
