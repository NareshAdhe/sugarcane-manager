/*
  Warnings:

  - You are about to drop the column `commission` on the `Trip` table. All the data in the column will be lost.
  - Added the required column `karkhanaId` to the `Tractor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cuttingCommission` to the `Trip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transportCommission` to the `Trip` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Tractor" ADD COLUMN     "karkhanaId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Trip" DROP COLUMN "commission",
ADD COLUMN     "cuttingCommission" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "transportCommission" DOUBLE PRECISION NOT NULL;

-- CreateTable
CREATE TABLE "Karkhana" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "todniCommRate" DOUBLE PRECISION NOT NULL,
    "vahatukCommRate" DOUBLE PRECISION NOT NULL,
    "todniRate" DOUBLE PRECISION NOT NULL,
    "vahatukRate" DOUBLE PRECISION NOT NULL,
    "dieselRate" DOUBLE PRECISION NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Karkhana_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Karkhana" ADD CONSTRAINT "Karkhana_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tractor" ADD CONSTRAINT "Tractor_karkhanaId_fkey" FOREIGN KEY ("karkhanaId") REFERENCES "Karkhana"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
