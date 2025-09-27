-- AlterTable
ALTER TABLE `home_prayer_card` ADD COLUMN `isBlocked` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `reportCount` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `prayerrequest` ADD COLUMN `isBlocked` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `reportCount` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `prayerresponse` ADD COLUMN `isBlocked` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `reportCount` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `reportCount` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `walletBalance` DECIMAL(10, 2) NOT NULL DEFAULT 0.00;
