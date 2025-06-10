-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailVerified" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "VerificationToken" (
    "id" SERIAL NOT NULL,
    "userEmail" TEXT NOT NULL,
    "hashedToken" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_hashedToken_key" ON "VerificationToken"("hashedToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_userEmail_hashedToken_key" ON "VerificationToken"("userEmail", "hashedToken");
