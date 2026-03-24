/*
  Warnings:

  - You are about to drop the column `email` on the `companies` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `companies` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "applications" ADD COLUMN     "interviewDate" TIMESTAMP(3),
ADD COLUMN     "interviewMessage" TEXT;

-- AlterTable
ALTER TABLE "companies" DROP COLUMN "email",
DROP COLUMN "phone";
