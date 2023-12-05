/*
  Warnings:

  - You are about to drop the column `scheduleId` on the `Schedule` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Schedule" DROP CONSTRAINT "Schedule_scheduleId_fkey";

-- DropIndex
DROP INDEX "Schedule_scheduleId_key";

-- DropIndex
DROP INDEX "Schedule_stageId_scheduleId_key";

-- AlterTable
ALTER TABLE "Schedule" DROP COLUMN "scheduleId",
ADD COLUMN     "order" SERIAL NOT NULL;
