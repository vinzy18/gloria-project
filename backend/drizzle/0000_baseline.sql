CREATE TABLE IF NOT EXISTS "berita_acara_keuangan" (
	"id" serial PRIMARY KEY NOT NULL,
	"jenis_ibadah" varchar(100) NOT NULL,
	"tanggal_ibadah" date NOT NULL,
	"khadim" varchar(255) NOT NULL,
	"kantong_persembahan" integer DEFAULT 0 NOT NULL,
	"kotak_persembahan" integer DEFAULT 0 NOT NULL,
	"kotak_pembangunan" integer DEFAULT 0 NOT NULL,
	"keterangan_pemasukan" text,
	"jumlah_pemasukan" integer DEFAULT 0 NOT NULL,
	"terbilang_pemasukan" varchar(255),
	"jumlah_pengeluaran" integer DEFAULT 0 NOT NULL,
	"total_saldo" integer DEFAULT 0 NOT NULL,
	"keterangan_pengeluaran" text,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"submitted_at" timestamp,
	"submitted_by" integer,
	"approved_at" timestamp,
	"approved_by" integer,
	"rejected_at" timestamp,
	"rejected_by" integer,
	"catatan_bendahara" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" integer,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "berita_acara_pemasukan_lain" (
	"id" serial PRIMARY KEY NOT NULL,
	"berita_acara_id" integer NOT NULL,
	"master_id" integer NOT NULL,
	"jumlah" integer DEFAULT 0 NOT NULL,
	"keterangan" text,
	"urutan" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "berita_acara_pengeluaran" (
	"id" serial PRIMARY KEY NOT NULL,
	"berita_acara_id" integer NOT NULL,
	"master_id" integer NOT NULL,
	"nomor" integer DEFAULT 1 NOT NULL,
	"nama" varchar(255),
	"jumlah" integer DEFAULT 0 NOT NULL,
	"signature" text,
	"signed_at" timestamp,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"status_at" timestamp,
	"urutan" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bpmj" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"position_id" integer,
	"photo_url" varchar(255),
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" integer,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bpmj_position" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" integer,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"location" varchar(255),
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"cover_image" varchar(255),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" integer,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "jemaat" (
	"id" serial PRIMARY KEY NOT NULL,
	"id_jemaat" varchar(20),
	"nama" varchar(100) NOT NULL,
	"nik" varchar(20),
	"gender" varchar(10),
	"tempat_lahir" varchar(100),
	"tanggal_lahir" date,
	"alamat" text,
	"phone" varchar(20),
	"email" varchar(100),
	"status_pernikahan" varchar(20),
	"tanggal_pernikahan" date,
	"tanggal_baptis" date,
	"kolom" varchar(100),
	"pekerjaan" varchar(100),
	"keluarga" varchar(255),
	"bipra" varchar(10),
	"join_date" date,
	"photo_url" varchar(255),
	"is_active" boolean DEFAULT true NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" integer,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" integer,
	CONSTRAINT "jemaat_id_jemaat_unique" UNIQUE("id_jemaat")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "master_pelayanan" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" integer,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "master_pemasukan_lain" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" integer,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" integer,
	CONSTRAINT "master_pemasukan_lain_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "master_pengeluaran" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"is_required" boolean DEFAULT false NOT NULL,
	"is_multiple" boolean DEFAULT false NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" integer,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" integer,
	CONSTRAINT "master_pengeluaran_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pelsus" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"position_id" integer,
	"pelsus" varchar(30),
	"pelayanan" varchar(30),
	"photo_url" varchar(255),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" integer,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pelsus_position" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" integer,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "role_permissions" (
	"role_id" integer NOT NULL,
	"permission" varchar(100) NOT NULL,
	CONSTRAINT "role_permissions_role_id_permission_pk" PRIMARY KEY("role_id","permission")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(20) NOT NULL,
	"label" varchar(100) NOT NULL,
	"description" text,
	"is_system" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_roles" (
	"user_id" integer NOT NULL,
	"role_id" integer NOT NULL,
	CONSTRAINT "user_roles_user_id_role_id_pk" PRIMARY KEY("user_id","role_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(50) NOT NULL,
	"full_name" varchar(100),
	"password_hash" varchar(255) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "warta" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"excerpt" text,
	"content" text NOT NULL,
	"cover_image" varchar(255),
	"author_id" integer,
	"is_published" boolean DEFAULT false NOT NULL,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" integer,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" integer,
	CONSTRAINT "warta_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "berita_acara_keuangan" ADD CONSTRAINT "berita_acara_keuangan_submitted_by_users_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "berita_acara_keuangan" ADD CONSTRAINT "berita_acara_keuangan_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "berita_acara_keuangan" ADD CONSTRAINT "berita_acara_keuangan_rejected_by_users_id_fk" FOREIGN KEY ("rejected_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "berita_acara_keuangan" ADD CONSTRAINT "berita_acara_keuangan_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "berita_acara_keuangan" ADD CONSTRAINT "berita_acara_keuangan_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "berita_acara_pemasukan_lain" ADD CONSTRAINT "berita_acara_pemasukan_lain_berita_acara_id_berita_acara_keuangan_id_fk" FOREIGN KEY ("berita_acara_id") REFERENCES "public"."berita_acara_keuangan"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "berita_acara_pemasukan_lain" ADD CONSTRAINT "berita_acara_pemasukan_lain_master_id_master_pemasukan_lain_id_fk" FOREIGN KEY ("master_id") REFERENCES "public"."master_pemasukan_lain"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "berita_acara_pengeluaran" ADD CONSTRAINT "berita_acara_pengeluaran_berita_acara_id_berita_acara_keuangan_id_fk" FOREIGN KEY ("berita_acara_id") REFERENCES "public"."berita_acara_keuangan"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "berita_acara_pengeluaran" ADD CONSTRAINT "berita_acara_pengeluaran_master_id_master_pengeluaran_id_fk" FOREIGN KEY ("master_id") REFERENCES "public"."master_pengeluaran"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bpmj" ADD CONSTRAINT "bpmj_position_id_bpmj_position_id_fk" FOREIGN KEY ("position_id") REFERENCES "public"."bpmj_position"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bpmj" ADD CONSTRAINT "bpmj_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bpmj" ADD CONSTRAINT "bpmj_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bpmj_position" ADD CONSTRAINT "bpmj_position_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bpmj_position" ADD CONSTRAINT "bpmj_position_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "events" ADD CONSTRAINT "events_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "events" ADD CONSTRAINT "events_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "jemaat" ADD CONSTRAINT "jemaat_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "jemaat" ADD CONSTRAINT "jemaat_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "master_pelayanan" ADD CONSTRAINT "master_pelayanan_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "master_pelayanan" ADD CONSTRAINT "master_pelayanan_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "master_pemasukan_lain" ADD CONSTRAINT "master_pemasukan_lain_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "master_pemasukan_lain" ADD CONSTRAINT "master_pemasukan_lain_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "master_pengeluaran" ADD CONSTRAINT "master_pengeluaran_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "master_pengeluaran" ADD CONSTRAINT "master_pengeluaran_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pelsus" ADD CONSTRAINT "pelsus_position_id_pelsus_position_id_fk" FOREIGN KEY ("position_id") REFERENCES "public"."pelsus_position"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pelsus" ADD CONSTRAINT "pelsus_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pelsus" ADD CONSTRAINT "pelsus_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pelsus_position" ADD CONSTRAINT "pelsus_position_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pelsus_position" ADD CONSTRAINT "pelsus_position_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "warta" ADD CONSTRAINT "warta_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "warta" ADD CONSTRAINT "warta_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "warta" ADD CONSTRAINT "warta_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

--> statement-breakpoint
-- Data awal RBAC: role sistem + permission default (dipakai seed & panel admin)
INSERT INTO "roles" ("name", "label", "description", "is_system") VALUES
	('admin', 'Administrator', 'Akses penuh ke panel admin', true),
	('bendahara', 'Bendahara', 'Approve / tolak berita acara keuangan', true)
ON CONFLICT ("name") DO NOTHING;--> statement-breakpoint
INSERT INTO "role_permissions" ("role_id", "permission")
SELECT r.id, p.permission FROM "roles" r
CROSS JOIN (VALUES
	('jemaat.view'), ('jemaat.manage'), ('organization.manage'), ('warta.manage'), ('events.manage'),
	('berita_acara.view'), ('berita_acara.manage'), ('users.manage'), ('roles.manage')
) AS p(permission)
WHERE r.name = 'admin'
ON CONFLICT DO NOTHING;--> statement-breakpoint
INSERT INTO "role_permissions" ("role_id", "permission")
SELECT r.id, p.permission FROM "roles" r
CROSS JOIN (VALUES ('berita_acara.view'), ('berita_acara.approve')) AS p(permission)
WHERE r.name = 'bendahara'
ON CONFLICT DO NOTHING;