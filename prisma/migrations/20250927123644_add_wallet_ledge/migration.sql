/*
  Warnings:

  - You are about to alter the column `tokensAwarded` on the `prayerresponse` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Decimal(10,2)`.

*/
-- AlterTable
ALTER TABLE `home_prayer_card` ADD COLUMN `isSettled` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `settledAmount` DECIMAL(10, 2) NULL;

-- AlterTable
ALTER TABLE `prayerresponse` ADD COLUMN `isSettled` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `tokensAwarded` DECIMAL(10, 2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `bscAddress` VARCHAR(191) NULL,
    ADD COLUMN `isAddressVerified` BOOLEAN NOT NULL DEFAULT false;

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

-- AddForeignKey
ALTER TABLE `token_transaction` ADD CONSTRAINT `token_transaction_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `token_transaction` ADD CONSTRAINT `token_transaction_relatedHomeCardId_fkey` FOREIGN KEY (`relatedHomeCardId`) REFERENCES `home_prayer_card`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `token_transaction` ADD CONSTRAINT `token_transaction_relatedResponseId_fkey` FOREIGN KEY (`relatedResponseId`) REFERENCES `PrayerResponse`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
