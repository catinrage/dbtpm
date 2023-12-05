/*
  Warnings:

  - You are about to drop the column `staticStartDate` on the `Schedule` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Schedule" DROP COLUMN "staticStartDate",
ADD COLUMN     "startDate" TIMESTAMP(3);
