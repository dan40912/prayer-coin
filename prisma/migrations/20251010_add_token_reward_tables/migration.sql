-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `username` VARCHAR(191) NULL,
    `faithTradition` VARCHAR(191) NULL,
    `country` VARCHAR(191) NULL,
    `solanaAddress` VARCHAR(191) NULL,
    `passwordHash` VARCHAR(191) NULL,
    `acceptedTerms` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `avatarUrl` VARCHAR(191) NULL,
    `bio` VARCHAR(191) NULL,
    `isBlocked` BOOLEAN NOT NULL DEFAULT false,
    `reportCount` INTEGER NOT NULL DEFAULT 0,
    `walletBalance` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `bscAddress` VARCHAR(191) NULL,
    `isAddressVerified` BOOLEAN NOT NULL DEFAULT false,
    `resetToken` VARCHAR(255) NULL,
    `resetTokenExpiry` DATETIME(3) NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    UNIQUE INDEX `User_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PrayerRequest` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `status` ENUM('DRAFT', 'PUBLISHED', 'ANSWERED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `ownerId` VARCHAR(191) NULL,

    UNIQUE INDEX `PrayerRequest_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PrayerResponse` (
    `id` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `voiceUrl` VARCHAR(191) NULL,
    `tokensAwarded` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `isSettled` BOOLEAN NOT NULL DEFAULT false,
    `isAnonymous` BOOLEAN NOT NULL DEFAULT false,
    `isBlocked` BOOLEAN NOT NULL DEFAULT false,
    `reportCount` INTEGER NOT NULL DEFAULT 0,
    `rewardStatus` ENUM('PENDING', 'BLOCKED', 'REWARDED') NOT NULL DEFAULT 'PENDING',
    `rewardEligibleAt` DATETIME(3) NULL,
    `rewardEvaluatedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `prayerRequestId` VARCHAR(191) NULL,
    `homeCardId` INTEGER NULL,
    `responderId` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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

-- CreateTable
CREATE TABLE `site_banner` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `eyebrow` VARCHAR(191) NULL,
    `headline` VARCHAR(191) NOT NULL,
    `subheadline` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `primaryCtaLabel` VARCHAR(191) NOT NULL,
    `primaryCtaHref` VARCHAR(191) NOT NULL,
    `secondaryCtaLabel` VARCHAR(191) NULL,
    `secondaryCtaHref` VARCHAR(191) NULL,
    `heroImage` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `site_setting` (
    `id` INTEGER NOT NULL DEFAULT 1,
    `maintenanceMode` BOOLEAN NOT NULL DEFAULT false,
    `updatedAt` DATETIME(3) NOT NULL,
    `updatedBy` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `token_reward_rule` (
    `id` INTEGER NOT NULL DEFAULT 1,
    `rewardTokens` DECIMAL(10, 2) NOT NULL DEFAULT 10.00,
    `observationDays` INTEGER NOT NULL DEFAULT 3,
    `allowedReports` INTEGER NOT NULL DEFAULT 0,
    `updatedAt` DATETIME(3) NOT NULL,
    `updatedBy` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `home_prayer_category` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `home_prayer_category_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `home_prayer_card` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(191) NOT NULL,
    `image` VARCHAR(191) NOT NULL,
    `alt` VARCHAR(191) NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `tags` JSON NOT NULL,
    `meta` JSON NOT NULL,
    `detailsHref` VARCHAR(191) NOT NULL,
    `voiceHref` VARCHAR(191) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `categoryId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ownerId` VARCHAR(191) NULL,
    `isBlocked` BOOLEAN NOT NULL DEFAULT false,
    `reportCount` INTEGER NOT NULL DEFAULT 0,
    `isSettled` BOOLEAN NOT NULL DEFAULT false,
    `settledAmount` DECIMAL(10, 2) NULL,

    UNIQUE INDEX `home_prayer_card_slug_key`(`slug`),
    INDEX `home_prayer_card_categoryId_idx`(`categoryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AdminAccount` (
    `id` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `role` ENUM('SUPER', 'ADMIN') NOT NULL DEFAULT 'ADMIN',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `lastLoginAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `AdminAccount_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `token_transaction` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` ENUM('EARN_PRAYER', 'EARN_RESPONSE', 'WITHDRAW', 'DONATE') NOT NULL,
    `status` ENUM('PENDING', 'PROCESSING_CHAIN', 'COMPLETED', 'FAILED') NOT NULL DEFAULT 'PENDING',
    `amount` DECIMAL(10, 2) NOT NULL,
    `relatedHomeCardId` INTEGER NULL,
    `relatedResponseId` VARCHAR(191) NULL,
    `txHash` VARCHAR(191) NULL,
    `targetAddress` VARCHAR(191) NULL,
    `gasFee` DECIMAL(10, 8) NULL,
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `token_transaction_userId_createdAt_idx`(`userId`, `createdAt`),
    INDEX `token_transaction_type_status_idx`(`type`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `admin_log` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `category` ENUM('ACTION', 'SYSTEM') NOT NULL,
    `level` ENUM('INFO', 'WARNING', 'ERROR', 'CRITICAL') NOT NULL DEFAULT 'INFO',
    `message` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NULL,
    `actorId` VARCHAR(191) NULL,
    `actorEmail` VARCHAR(191) NULL,
    `targetType` VARCHAR(191) NULL,
    `targetId` VARCHAR(191) NULL,
    `requestPath` VARCHAR(191) NULL,
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `admin_log_category_createdAt_idx`(`category`, `createdAt`),
    INDEX `admin_log_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PrayerRequest` ADD CONSTRAINT `PrayerRequest_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PrayerResponse` ADD CONSTRAINT `PrayerResponse_prayerRequestId_fkey` FOREIGN KEY (`prayerRequestId`) REFERENCES `PrayerRequest`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PrayerResponse` ADD CONSTRAINT `PrayerResponse_homeCardId_fkey` FOREIGN KEY (`homeCardId`) REFERENCES `home_prayer_card`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PrayerResponse` ADD CONSTRAINT `PrayerResponse_responderId_fkey` FOREIGN KEY (`responderId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `home_prayer_card_report` ADD CONSTRAINT `home_prayer_card_report_cardId_fkey` FOREIGN KEY (`cardId`) REFERENCES `home_prayer_card`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `home_prayer_card_report` ADD CONSTRAINT `home_prayer_card_report_reporterId_fkey` FOREIGN KEY (`reporterId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `prayer_response_report` ADD CONSTRAINT `prayer_response_report_responseId_fkey` FOREIGN KEY (`responseId`) REFERENCES `PrayerResponse`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `prayer_response_report` ADD CONSTRAINT `prayer_response_report_reporterId_fkey` FOREIGN KEY (`reporterId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `home_prayer_card` ADD CONSTRAINT `home_prayer_card_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `home_prayer_category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `home_prayer_card` ADD CONSTRAINT `home_prayer_card_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `token_transaction` ADD CONSTRAINT `token_transaction_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `token_transaction` ADD CONSTRAINT `token_transaction_relatedHomeCardId_fkey` FOREIGN KEY (`relatedHomeCardId`) REFERENCES `home_prayer_card`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `token_transaction` ADD CONSTRAINT `token_transaction_relatedResponseId_fkey` FOREIGN KEY (`relatedResponseId`) REFERENCES `PrayerResponse`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

