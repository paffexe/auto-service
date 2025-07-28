/*
  Warnings:

  - Made the column `is_activated` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "users" ALTER COLUMN "is_activated" SET NOT NULL;
