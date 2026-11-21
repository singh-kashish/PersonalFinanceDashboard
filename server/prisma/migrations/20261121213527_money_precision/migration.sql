/*
  Warnings:

  - You are about to alter the column `amount` on the `Transaction` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(19,2)`.

*/
-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(19,2);

-- Add CHECK constraint for positive amounts
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_amount_positive" CHECK (amount > 0);