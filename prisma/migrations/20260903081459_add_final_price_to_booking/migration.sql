/*
  Warnings:

  - Added the required column `final_price` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "final_price" DECIMAL(65,30) NOT NULL;
