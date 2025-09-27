-- AlterTable
ALTER TABLE `home_prayer_card` ADD COLUMN `categoryId` INTEGER NULL;

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

-- CreateIndex
CREATE INDEX `home_prayer_card_categoryId_idx` ON `home_prayer_card`(`categoryId`);

-- AddForeignKey
ALTER TABLE `home_prayer_card` ADD CONSTRAINT `home_prayer_card_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `home_prayer_category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
