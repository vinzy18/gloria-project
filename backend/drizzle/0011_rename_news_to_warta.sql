ALTER TABLE "news" RENAME TO "warta";--> statement-breakpoint
ALTER SEQUENCE IF EXISTS "news_id_seq" RENAME TO "warta_id_seq";--> statement-breakpoint
ALTER TABLE "warta" RENAME CONSTRAINT "news_pkey" TO "warta_pkey";--> statement-breakpoint
ALTER TABLE "warta" RENAME CONSTRAINT "news_slug_unique" TO "warta_slug_unique";--> statement-breakpoint
ALTER TABLE "warta" RENAME CONSTRAINT "news_author_id_users_id_fk" TO "warta_author_id_users_id_fk";--> statement-breakpoint
ALTER TABLE "warta" RENAME CONSTRAINT "news_created_by_users_id_fk" TO "warta_created_by_users_id_fk";--> statement-breakpoint
ALTER TABLE "warta" RENAME CONSTRAINT "news_updated_by_users_id_fk" TO "warta_updated_by_users_id_fk";
--> statement-breakpoint
DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT conname FROM pg_constraint WHERE conrelid = 'warta'::regclass AND conname LIKE 'news\_%' LOOP
    EXECUTE format('ALTER TABLE "warta" RENAME CONSTRAINT %I TO %I', r.conname, 'warta_' || substr(r.conname, 6));
  END LOOP;
END $$;
