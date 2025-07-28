/*
  Warnings:

  - Made the column `is_creator` on table `admin` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "admin" ALTER COLUMN "is_creator" SET NOT NULL;
