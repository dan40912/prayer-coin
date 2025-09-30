-- CreateTable
CREATE TABLE `home_prayer_card_report` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cardId` INTEGER NOT NULL,
    `reporterId` VARCHAR(191) NOT NULL,
    `reason` VARCHAR(191) NOT NULL,
    `remarks` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `home_prayer_card_report_cardId_idx`(`cardId`),
    INDEX `home_prayer_card_report_reason_idx`(`reason`),
    INDEX `home_prayer_card_report_createdAt_idx`(`createdAt`),
    UNIQUE INDEX `home_prayer_card_report_cardId_reporterId_key`(`cardId`, `reporterId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `home_prayer_card_report` ADD CONSTRAINT `home_prayer_card_report_cardId_fkey` FOREIGN KEY (`cardId`) REFERENCES `home_prayer_card`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `home_prayer_card_report` ADD CONSTRAINT `home_prayer_card_report_reporterId_fkey` FOREIGN KEY (`reporterId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
