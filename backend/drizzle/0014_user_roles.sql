CREATE TABLE IF NOT EXISTS "user_roles" (
	"user_id" integer NOT NULL,
	"role_id" integer NOT NULL,
	CONSTRAINT "user_roles_user_id_role_id_pk" PRIMARY KEY("user_id","role_id")
);
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
-- Pindahkan role tunggal yang sudah ada ke user_roles sebelum kolomnya dihapus
INSERT INTO "user_roles" ("user_id", "role_id")
SELECT u.id, r.id FROM "users" u JOIN "roles" r ON r.name = u.role
ON CONFLICT DO NOTHING;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "role";