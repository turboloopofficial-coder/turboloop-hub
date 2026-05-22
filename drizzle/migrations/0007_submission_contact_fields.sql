-- Add structured contact fields to content_submissions so the
-- admin/support team can reach submitters via WhatsApp (the primary
-- channel for the global community), plus optional email + Telegram +
-- other-social fallbacks.
--
-- Why a new column for WhatsApp instead of reusing author_contact:
-- author_contact is a free-text "email or telegram handle" field that
-- existing rows have populated inconsistently. WhatsApp is the most
-- common channel for users in the target regions (Nigeria, Indonesia,
-- India, Philippines), so it deserves its own structured column for
-- reliable admin lookup.
--
-- All new columns are nullable so the migration doesn't break existing
-- 100+ submission rows. The form-level validation (router zod schema
-- + client form) is what makes whatsapp_number required for NEW
-- submissions going forward. The author_contact legacy column stays
-- in place — older submissions keep their value, new submissions can
-- still set it for back-compat.

ALTER TABLE "content_submissions" ADD COLUMN IF NOT EXISTS "whatsapp_number" varchar(50);
--> statement-breakpoint
ALTER TABLE "content_submissions" ADD COLUMN IF NOT EXISTS "email" varchar(320);
--> statement-breakpoint
ALTER TABLE "content_submissions" ADD COLUMN IF NOT EXISTS "telegram_handle" varchar(100);
--> statement-breakpoint
ALTER TABLE "content_submissions" ADD COLUMN IF NOT EXISTS "other_social" varchar(300);
