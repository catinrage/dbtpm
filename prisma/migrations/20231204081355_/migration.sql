/*
  Warnings:

  - Made the column `startDate` on table `Schedule` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Schedule" ALTER COLUMN "startDate" SET NOT NULL;
