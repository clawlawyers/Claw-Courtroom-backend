-- AlterTable
ALTER TABLE "User" ADD COLUMN     "tokenUsed" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "ReferralCode" (
    "id" TEXT NOT NULL,
    "redeemed" BOOLEAN NOT NULL DEFAULT false,
    "redeemedById" TEXT,
    "generatedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReferralCode_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ReferralCode" ADD CONSTRAINT "ReferralCode_redeemedById_fkey" FOREIGN KEY ("redeemedById") REFERENCES "User"("mongoId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferralCode" ADD CONSTRAINT "ReferralCode_generatedById_fkey" FOREIGN KEY ("generatedById") REFERENCES "User"("mongoId") ON DELETE RESTRICT ON UPDATE CASCADE;
