-- CreateTable
CREATE TABLE `prayer_response_report` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `responseId` VARCHAR(191) NOT NULL,
    `reporterId` VARCHAR(191) NOT NULL,
    `reason` VARCHAR(191) NOT NULL,
    `remarks` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `prayer_response_report_responseId_idx`(`responseId`),
    INDEX `prayer_response_report_reason_idx`(`reason`),
    INDEX `prayer_response_report_createdAt_idx`(`createdAt`),
    UNIQUE INDEX `prayer_response_report_responseId_reporterId_key`(`responseId`, `reporterId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `prayer_response_report` ADD CONSTRAINT `prayer_response_report_responseId_fkey` FOREIGN KEY (`responseId`) REFERENCES `PrayerResponse`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `prayer_response_report` ADD CONSTRAINT `prayer_response_report_reporterId_fkey` FOREIGN KEY (`reporterId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
