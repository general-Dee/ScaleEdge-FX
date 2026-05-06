-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CUSTOMER', 'ADMIN', 'SUPERADMIN');

-- CreateEnum
CREATE TYPE "Tier" AS ENUM ('TIER1', 'TIER2', 'TIER3');

-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('BUY', 'SELL');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'MATCHED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TxType" AS ENUM ('DEPOSIT', 'WITHDRAWAL', 'ESCROW_HOLD', 'ESCROW_RELEASE');

-- CreateEnum
CREATE TYPE "TxStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "password" TEXT NOT NULL,
    "fullName" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'CUSTOMER',
    "bvnVerified" BOOLEAN NOT NULL DEFAULT false,
    "ninVerified" BOOLEAN NOT NULL DEFAULT false,
    "bvnNumber" TEXT,
    "ninNumber" TEXT,
    "tier" "Tier" NOT NULL DEFAULT 'TIER1',
    "dailyLimitUsd" INTEGER NOT NULL DEFAULT 200,
    "walletBalance" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "OrderType" NOT NULL,
    "amountUsd" INTEGER NOT NULL,
    "rateNgn" INTEGER NOT NULL,
    "status" "OrderStatus" NOT NULL,
    "matchedBy" TEXT,
    "matchedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "TxType" NOT NULL,
    "amountNgn" INTEGER NOT NULL,
    "reference" TEXT NOT NULL,
    "status" "TxStatus" NOT NULL,
    "paystackRef" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_reference_key" ON "Transaction"("reference");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
