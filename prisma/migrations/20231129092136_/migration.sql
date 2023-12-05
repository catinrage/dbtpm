/*
  Warnings:

  - You are about to drop the column `interruption` on the `Schedule` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Schedule" DROP COLUMN "interruption",
ADD COLUMN     "interruptions" JSONB NOT NULL DEFAULT '[]';
