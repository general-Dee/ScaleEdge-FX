-- CreateTable
CREATE TABLE "DedicatedAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "paystackCustomerCode" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "bankId" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DedicatedAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DedicatedAccount_userId_key" ON "DedicatedAccount"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DedicatedAccount_accountNumber_key" ON "DedicatedAccount"("accountNumber");

-- AddForeignKey
ALTER TABLE "DedicatedAccount" ADD CONSTRAINT "DedicatedAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
