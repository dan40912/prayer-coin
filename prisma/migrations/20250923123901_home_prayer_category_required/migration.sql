/*
  Warnings:

  - Made the column `categoryId` on table `home_prayer_card` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `home_prayer_card` DROP FOREIGN KEY `home_prayer_card_categoryId_fkey`;

-- AlterTable
ALTER TABLE `home_prayer_card` MODIFY `categoryId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `home_prayer_card` ADD CONSTRAINT `home_prayer_card_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `home_prayer_category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
