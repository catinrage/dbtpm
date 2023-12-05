/*
  Warnings:

  - You are about to drop the column `number` on the `Stage` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Schedule" DROP CONSTRAINT "Schedule_stageId_fkey";

-- DropIndex
DROP INDEX "Stage_projectId_number_key";

-- AlterTable
ALTER TABLE "Stage" DROP COLUMN "number";

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "Stage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
