/*
  Warnings:

  - A unique constraint covering the columns `[stageId,startDate]` on the table `Schedule` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Schedule_stageId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Schedule_stageId_startDate_key" ON "Schedule"("stageId", "startDate");
