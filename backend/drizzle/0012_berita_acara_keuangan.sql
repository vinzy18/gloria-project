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
