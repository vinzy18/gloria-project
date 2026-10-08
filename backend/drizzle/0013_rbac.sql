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
ALTER TABLE "users" ADD COLUMN "full_name" varchar(100);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
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
