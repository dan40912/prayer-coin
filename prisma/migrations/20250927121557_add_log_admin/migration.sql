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
