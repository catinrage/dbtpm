/*
  Warnings:

  - You are about to drop the column `stageNumber` on the `Schedule` table. All the data in the column will be lost.
  - The primary key for the `Stage` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[stageId,startDate]` on the table `Schedule` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `stageId` to the `Schedule` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Schedule" DROP CONSTRAINT "Schedule_stageNumber_fkey";

-- DropIndex
DROP INDEX "Schedule_stageNumber_startDate_key";

-- AlterTable
ALTER TABLE "Schedule" DROP COLUMN "stageNumber",
ADD COLUMN     "stageId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Stage" DROP CONSTRAINT "Stage_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Stage_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "Schedule_stageId_startDate_key" ON "Schedule"("stageId", "startDate");

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "Stage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
