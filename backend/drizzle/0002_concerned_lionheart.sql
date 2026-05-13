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
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "jemaat_id_jemaat_unique" UNIQUE("id_jemaat")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pelsus" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"position" varchar(100) NOT NULL,
	"pelsus" varchar(30),
	"pelayanan" varchar(30),
	"photo_url" varchar(255),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP TABLE "members" CASCADE;--> statement-breakpoint
DROP TABLE "organization" CASCADE;--> statement-breakpoint
ALTER TABLE "bpmj" DROP COLUMN IF EXISTS "department";