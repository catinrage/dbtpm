-- AlterTable
ALTER TABLE "Schedule" ADD COLUMN     "interruption" JSONB NOT NULL DEFAULT '[]';
