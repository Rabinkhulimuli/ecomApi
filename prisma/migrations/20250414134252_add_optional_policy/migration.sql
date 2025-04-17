/*
  Warnings:

  - You are about to drop the column `productsId` on the `Image` table. All the data in the column will be lost.
  - Added the required column `productId` to the `Image` table without a default value. This is not possible if the table is not empty.
  - Added the required column `brand` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `discount` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Image" DROP CONSTRAINT "Image_productsId_fkey";

-- AlterTable
ALTER TABLE "Image" DROP COLUMN "productsId",
ADD COLUMN     "productId" TEXT NOT NULL,
ALTER COLUMN "publicId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "brand" TEXT NOT NULL,
ADD COLUMN     "discount" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "returnPolicy" TEXT;

-- CreateTable
CREATE TABLE "Dimension" (
    "id" TEXT NOT NULL,
    "depth" DECIMAL(65,30) NOT NULL,
    "height" DECIMAL(65,30) NOT NULL,
    "width" DECIMAL(65,30) NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "Dimension_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Dimension_productId_key" ON "Dimension"("productId");

-- AddForeignKey
ALTER TABLE "Dimension" ADD CONSTRAINT "Dimension_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
