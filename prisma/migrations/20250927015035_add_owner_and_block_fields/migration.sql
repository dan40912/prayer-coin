/*
  Warnings:

  - You are about to drop the column `category` on the `prayerrequest` table. All the data in the column will be lost.
  - You are about to drop the column `isBlocked` on the `prayerrequest` table. All the data in the column will be lost.
  - You are about to drop the column `reportCount` on the `prayerrequest` table. All the data in the column will be lost.
  - You are about to drop the column `tokensTarget` on the `prayerrequest` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `home_prayer_card` ADD COLUMN `ownerId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `prayerrequest` DROP COLUMN `category`,
    DROP COLUMN `isBlocked`,
    DROP COLUMN `reportCount`,
    DROP COLUMN `tokensTarget`;

-- AddForeignKey
ALTER TABLE `home_prayer_card` ADD CONSTRAINT `home_prayer_card_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
