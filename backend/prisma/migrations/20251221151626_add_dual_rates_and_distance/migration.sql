-- CreateEnum
CREATE TYPE "ExpenseType" AS ENUM ('MAINTENANCE', 'DRIVER_AMOUNT', 'MUKADAM_AMOUNT');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "otp" TEXT,
    "otpExpires" TIMESTAMP(3),
    "defaultDieselRate" DOUBLE PRECISION NOT NULL DEFAULT 72.0,
    "defaultVahatukRateShort" DOUBLE PRECISION NOT NULL DEFAULT 200.0,
    "defaultVahatukRateLong" DOUBLE PRECISION NOT NULL DEFAULT 300.0,
    "defaultTodniRate" DOUBLE PRECISION NOT NULL DEFAULT 365.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tractor" (
    "id" SERIAL NOT NULL,
    "plateNumber" TEXT NOT NULL,
    "modelName" TEXT,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tractor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Driver" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "userId" INTEGER,
    "tractorId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Driver_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mukadam" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "userId" INTEGER,
    "tractorId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Mukadam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trip" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "slipNumber" TEXT NOT NULL,
    "netWeight" DOUBLE PRECISION NOT NULL,
    "distance" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "appliedRate" DOUBLE PRECISION NOT NULL,
    "dieselLiters" DOUBLE PRECISION NOT NULL,
    "cuttingIncome" DOUBLE PRECISION NOT NULL,
    "transportIncome" DOUBLE PRECISION NOT NULL,
    "commission" DOUBLE PRECISION NOT NULL DEFAULT 2000.0,
    "dieselCost" DOUBLE PRECISION NOT NULL,
    "netTripProfit" DOUBLE PRECISION NOT NULL,
    "tractorId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "driverId" INTEGER,
    "mukadamId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Trip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount" DOUBLE PRECISION NOT NULL,
    "type" "ExpenseType" NOT NULL,
    "description" TEXT,
    "tractorId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "driverId" INTEGER,
    "mukadamId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Tractor_plateNumber_key" ON "Tractor"("plateNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Driver_tractorId_key" ON "Driver"("tractorId");

-- CreateIndex
CREATE UNIQUE INDEX "Mukadam_tractorId_key" ON "Mukadam"("tractorId");

-- AddForeignKey
ALTER TABLE "Tractor" ADD CONSTRAINT "Tractor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Driver" ADD CONSTRAINT "Driver_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Driver" ADD CONSTRAINT "Driver_tractorId_fkey" FOREIGN KEY ("tractorId") REFERENCES "Tractor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mukadam" ADD CONSTRAINT "Mukadam_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mukadam" ADD CONSTRAINT "Mukadam_tractorId_fkey" FOREIGN KEY ("tractorId") REFERENCES "Tractor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_tractorId_fkey" FOREIGN KEY ("tractorId") REFERENCES "Tractor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_tractorId_fkey" FOREIGN KEY ("tractorId") REFERENCES "Tractor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_mukadamId_fkey" FOREIGN KEY ("mukadamId") REFERENCES "Mukadam"("id") ON DELETE SET NULL ON UPDATE CASCADE;
