-- AlterTable
ALTER TABLE "User" ADD COLUMN     "displayName" TEXT;

-- Backfill existing rows with their pseudo so the column can be made required
UPDATE "User" SET "displayName" = "pseudo" WHERE "displayName" IS NULL;

ALTER TABLE "User" ALTER COLUMN "displayName" SET NOT NULL;
