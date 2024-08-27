/*
  Warnings:

  - You are about to drop the column `redeemedById` on the `ReferralCode` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[generatedById]` on the table `ReferralCode` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "ReferralCode" DROP CONSTRAINT "ReferralCode_redeemedById_fkey";

-- AlterTable
ALTER TABLE "ReferralCode" DROP COLUMN "redeemedById";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "generatedReferralCodeId" TEXT,
ADD COLUMN     "redeemedReferralCodeId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ReferralCode_generatedById_key" ON "ReferralCode"("generatedById");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_redeemedReferralCodeId_fkey" FOREIGN KEY ("redeemedReferralCodeId") REFERENCES "ReferralCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;
