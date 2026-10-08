import { pgTable, serial, varchar, text, timestamp, boolean, date, integer, primaryKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  fullName: varchar("full_name", { length: 100 }),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── RBAC ────────────────────────────────────────────────────────────────────

export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  // Kode role (dipakai sebagai kunci di API & filter), tidak bisa diubah setelah dibuat
  name: varchar("name", { length: 20 }).notNull().unique(),
  label: varchar("label", { length: 100 }).notNull(),
  description: text("description"),
  // Role bawaan sistem tidak bisa dihapus
  isSystem: boolean("is_system").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Daftar permission yang valid ada di src/shared/permissions.ts
export const rolePermissions = pgTable(
  "role_permissions",
  {
    roleId: integer("role_id").notNull().references(() => roles.id, { onDelete: "cascade" }),
    permission: varchar("permission", { length: 100 }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.roleId, t.permission] })]
);

// Satu user bisa punya banyak role; permission user = gabungan permission semua role-nya
export const userRoles = pgTable(
  "user_roles",
  {
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    roleId: integer("role_id").notNull().references(() => roles.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.userId, t.roleId] })]
);

export const jemaat = pgTable("jemaat", {
  id: serial("id").primaryKey(),
  idJemaat: varchar("id_jemaat", { length: 20 }).unique(),
  nama: varchar("nama", { length: 100 }).notNull(),
  nik: varchar("nik", { length: 20 }),
  gender: varchar("gender", { length: 10 }),
  tempatLahir: varchar("tempat_lahir", { length: 100 }),
  tanggalLahir: date("tanggal_lahir"),
  alamat: text("alamat"),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 100 }),
  statusPernikahan: varchar("status_pernikahan", { length: 20 }),
  tanggalPernikahan: date("tanggal_pernikahan"),
  tanggalBaptis: date("tanggal_baptis"),
  kolom: varchar("kolom", { length: 100 }),
  pekerjaan: varchar("pekerjaan", { length: 100 }),
  keluarga: varchar("keluarga", { length: 255 }),
  bipra: varchar("bipra", { length: 10 }),
  joinDate: date("join_date"),
  photoUrl: varchar("photo_url", { length: 255 }),
  isActive: boolean("is_active").notNull().default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  updatedBy: integer("updated_by").references(() => users.id),
});

export const warta = pgTable("warta", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  coverImage: varchar("cover_image", { length: 255 }),
  authorId: integer("author_id").references(() => users.id),
  isPublished: boolean("is_published").notNull().default(false),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  updatedBy: integer("updated_by").references(() => users.id),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  location: varchar("location", { length: 255 }),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  coverImage: varchar("cover_image", { length: 255 }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  updatedBy: integer("updated_by").references(() => users.id),
});

export const pelsus = pgTable("pelsus", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  positionId: integer("position_id").references(() => pelsusPosition.id),
  pelsus: varchar("pelsus", { length: 30 }),
  pelayanan: varchar("pelayanan", { length: 30 }),
  photoUrl: varchar("photo_url", { length: 255 }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  updatedBy: integer("updated_by").references(() => users.id),
});

export const bpmj = pgTable("bpmj", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  positionId: integer("position_id").references(() => bpmjPosition.id),
  photoUrl: varchar("photo_url", { length: 255 }),
  displayOrder: integer("display_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  updatedBy: integer("updated_by").references(() => users.id),
});

export const masterPelayanan = pgTable("master_pelayanan", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  updatedBy: integer("updated_by").references(() => users.id),
})

export const bpmjPosition = pgTable("bpmj_position", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  updatedBy: integer("updated_by").references(() => users.id),
})

export const pelsusPosition = pgTable("pelsus_position", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  updatedBy: integer("updated_by").references(() => users.id),
})

export const bpmjRelations = relations(bpmj, ({ one }) => ({
  position: one(bpmjPosition, {
    fields: [bpmj.positionId],
    references: [bpmjPosition.id],
  }),
}));

export const pelsusRelations = relations(pelsus, ({ one }) => ({
  position: one(pelsusPosition, {
    fields: [pelsus.positionId],
    references: [pelsusPosition.id],
  }),
}));

// ─── Berita Acara Ibadah — Keuangan ──────────────────────────────────────────

// Master jenis "Pemasukan Lainnya" (Sampul Perpuluhan, Sampul Syukur, dst)
export const masterPemasukanLain = pgTable("master_pemasukan_lain", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  displayOrder: integer("display_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  updatedBy: integer("updated_by").references(() => users.id),
});

// Master point pengeluaran (petugas: Khadim, Pemusik, Kantoria, dst)
export const masterPengeluaran = pgTable("master_pengeluaran", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  // Wajib selalu muncul di form pengeluaran
  isRequired: boolean("is_required").notNull().default(false),
  // Bisa ditambah lebih dari satu (Pemusik 1, Pemusik 2, ...)
  isMultiple: boolean("is_multiple").notNull().default(false),
  displayOrder: integer("display_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  updatedBy: integer("updated_by").references(() => users.id),
});

// Header berita acara keuangan: satu record = satu ibadah (pemasukan + pengeluaran)
// status: draft -> submitted -> posted (approve bendahara) | rejected (dikembalikan ke admin)
export const beritaAcaraKeuangan = pgTable("berita_acara_keuangan", {
  id: serial("id").primaryKey(),
  jenisIbadah: varchar("jenis_ibadah", { length: 100 }).notNull(),
  tanggalIbadah: date("tanggal_ibadah").notNull(),
  khadim: varchar("khadim", { length: 255 }).notNull(),

  // Rincian pemasukan
  kantongPersembahan: integer("kantong_persembahan").notNull().default(0),
  kotakPersembahan: integer("kotak_persembahan").notNull().default(0),
  kotakPembangunan: integer("kotak_pembangunan").notNull().default(0),
  keteranganPemasukan: text("keterangan_pemasukan"),
  jumlahPemasukan: integer("jumlah_pemasukan").notNull().default(0),
  terbilangPemasukan: varchar("terbilang_pemasukan", { length: 255 }),

  // Rekap pengeluaran
  jumlahPengeluaran: integer("jumlah_pengeluaran").notNull().default(0),
  totalSaldo: integer("total_saldo").notNull().default(0),
  keteranganPengeluaran: text("keterangan_pengeluaran"),

  status: varchar("status", { length: 20 }).notNull().default("draft"),
  submittedAt: timestamp("submitted_at"),
  submittedBy: integer("submitted_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  approvedBy: integer("approved_by").references(() => users.id),
  rejectedAt: timestamp("rejected_at"),
  rejectedBy: integer("rejected_by").references(() => users.id),
  catatanBendahara: text("catatan_bendahara"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  updatedBy: integer("updated_by").references(() => users.id),
});

export const beritaAcaraPemasukanLain = pgTable("berita_acara_pemasukan_lain", {
  id: serial("id").primaryKey(),
  beritaAcaraId: integer("berita_acara_id").notNull().references(() => beritaAcaraKeuangan.id, { onDelete: "cascade" }),
  masterId: integer("master_id").notNull().references(() => masterPemasukanLain.id),
  jumlah: integer("jumlah").notNull().default(0),
  keterangan: text("keterangan"),
  urutan: integer("urutan").notNull().default(0),
});

// status: pending (belum ttd/konfirmasi) | confirmed | dikembalikan (tidak dihitung ke pengeluaran)
export const beritaAcaraPengeluaran = pgTable("berita_acara_pengeluaran", {
  id: serial("id").primaryKey(),
  beritaAcaraId: integer("berita_acara_id").notNull().references(() => beritaAcaraKeuangan.id, { onDelete: "cascade" }),
  masterId: integer("master_id").notNull().references(() => masterPengeluaran.id),
  // Nomor urut dalam master yang sama (Pemusik 1, Pemusik 2, ...)
  nomor: integer("nomor").notNull().default(1),
  nama: varchar("nama", { length: 255 }),
  jumlah: integer("jumlah").notNull().default(0),
  // Tanda tangan disimpan sebagai data URL PNG (base64)
  signature: text("signature"),
  signedAt: timestamp("signed_at"),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  statusAt: timestamp("status_at"),
  urutan: integer("urutan").notNull().default(0),
});
