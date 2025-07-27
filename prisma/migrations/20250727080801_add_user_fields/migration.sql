/*
  Warnings:

  - You are about to drop the column `name` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `courses` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `orders` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `student_courses` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `students` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `full_name` to the `users` table without a default value. This is not possible if the table is not empty.
  - Made the column `phone` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('worker', 'client', 'owner');

-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_userId_fkey";

-- DropForeignKey
ALTER TABLE "student_courses" DROP CONSTRAINT "student_courses_courseId_fkey";

-- DropForeignKey
ALTER TABLE "student_courses" DROP CONSTRAINT "student_courses_studentId_fkey";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "name",
ADD COLUMN     "activation_link" TEXT,
ADD COLUMN     "full_name" VARCHAR(40) NOT NULL,
ADD COLUMN     "is_activated" BOOLEAN DEFAULT false,
ADD COLUMN     "is_approved" BOOLEAN DEFAULT false,
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'client',
ALTER COLUMN "phone" SET NOT NULL,
ALTER COLUMN "createdAt" DROP NOT NULL,
ALTER COLUMN "updatedAt" DROP NOT NULL;

-- DropTable
DROP TABLE "courses";

-- DropTable
DROP TABLE "orders";

-- DropTable
DROP TABLE "student_courses";

-- DropTable
DROP TABLE "students";
