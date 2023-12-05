/*
  Warnings:

  - You are about to drop the column `efficiency` on the `Stage` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Schedule" ADD COLUMN     "efficiency" DOUBLE PRECISION NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Stage" DROP COLUMN "efficiency";
