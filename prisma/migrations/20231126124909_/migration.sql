/*
  Warnings:

  - You are about to drop the column `efficiency` on the `Schedule` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "StageStateEnum" ADD VALUE 'PAUSED';

-- AlterTable
ALTER TABLE "Schedule" DROP COLUMN "efficiency";

-- AlterTable
ALTER TABLE "Stage" ADD COLUMN     "efficiency" DOUBLE PRECISION NOT NULL DEFAULT 1;
