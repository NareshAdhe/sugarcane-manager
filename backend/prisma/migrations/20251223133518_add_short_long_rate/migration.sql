/*
  Warnings:

  - You are about to drop the column `vahatukRate` on the `Karkhana` table. All the data in the column will be lost.
  - Added the required column `vahatukRateLong` to the `Karkhana` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vahatukRateShort` to the `Karkhana` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Karkhana" DROP COLUMN "vahatukRate",
ADD COLUMN     "distanceThreshold" DOUBLE PRECISION NOT NULL DEFAULT 25,
ADD COLUMN     "vahatukRateLong" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "vahatukRateShort" DOUBLE PRECISION NOT NULL;
