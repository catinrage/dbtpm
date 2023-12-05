/*
  Warnings:

  - You are about to drop the column `startDate` on the `Schedule` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[scheduleId]` on the table `Schedule` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stageId,scheduleId]` on the table `Schedule` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Schedule_stageId_startDate_key";

-- AlterTable
ALTER TABLE "Schedule" DROP COLUMN "startDate",
ADD COLUMN     "scheduleId" INTEGER,
ADD COLUMN     "staticStartDate" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Schedule_scheduleId_key" ON "Schedule"("scheduleId");

-- CreateIndex
CREATE UNIQUE INDEX "Schedule_stageId_scheduleId_key" ON "Schedule"("stageId", "scheduleId");

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "Schedule"("id") ON DELETE SET NULL ON UPDATE CASCADE;
