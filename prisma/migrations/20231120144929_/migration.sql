/*
  Warnings:

  - You are about to drop the column `stageId` on the `Schedule` table. All the data in the column will be lost.
  - The primary key for the `Stage` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Stage` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `Stage` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[code]` on the table `Project` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stageNumber,startDate]` on the table `Schedule` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stageNumber` to the `Schedule` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Schedule" DROP CONSTRAINT "Schedule_stageId_fkey";

-- DropIndex
DROP INDEX "Schedule_stageId_startDate_key";

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "code" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Schedule" DROP COLUMN "stageId",
ADD COLUMN     "stageNumber" INTEGER NOT NULL,
ADD COLUMN     "state" "StageStateEnum" NOT NULL DEFAULT 'NOT_STARTED';

-- AlterTable
ALTER TABLE "Stage" DROP CONSTRAINT "Stage_pkey",
DROP COLUMN "id",
DROP COLUMN "state",
ADD CONSTRAINT "Stage_pkey" PRIMARY KEY ("number");

-- CreateIndex
CREATE UNIQUE INDEX "Project_code_key" ON "Project"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Schedule_stageNumber_startDate_key" ON "Schedule"("stageNumber", "startDate");

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_stageNumber_fkey" FOREIGN KEY ("stageNumber") REFERENCES "Stage"("number") ON DELETE RESTRICT ON UPDATE CASCADE;
