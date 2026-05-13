import { pgTable, serial, varchar, text, timestamp, boolean, date, integer } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  role: varchar("role", { length: 20 }).notNull().default("admin"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

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
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const news = pgTable("news", {
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
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
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
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const pelsus = pgTable("pelsus", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  position: varchar("position", { length: 100 }).notNull(),
  pelsus: varchar("pelsus", { length: 30 }),
  pelayanan: varchar("pelayanan", { length: 30 }),
  photoUrl: varchar("photo_url", { length: 255 }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const bpmj = pgTable("bpmj", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  position: varchar("position", { length: 100 }).notNull(),
  photoUrl: varchar("photo_url", { length: 255 }),
  displayOrder: integer("display_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
