/*
  Warnings:

  - You are about to drop the column `requestId` on the `prayerresponse` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `prayerresponse` DROP FOREIGN KEY `PrayerResponse_requestId_fkey`;

-- DropIndex
DROP INDEX `PrayerResponse_requestId_fkey` ON `prayerresponse`;

-- AlterTable
ALTER TABLE `prayerresponse` DROP COLUMN `requestId`,
    ADD COLUMN `homeCardId` INTEGER NULL,
    ADD COLUMN `prayerRequestId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `PrayerResponse` ADD CONSTRAINT `PrayerResponse_prayerRequestId_fkey` FOREIGN KEY (`prayerRequestId`) REFERENCES `PrayerRequest`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PrayerResponse` ADD CONSTRAINT `PrayerResponse_homeCardId_fkey` FOREIGN KEY (`homeCardId`) REFERENCES `home_prayer_card`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
