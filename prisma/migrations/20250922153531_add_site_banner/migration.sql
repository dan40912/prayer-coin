-- CreateTable
CREATE TABLE `site_banner` (
    `id` INTEGER NOT NULL DEFAULT 1,
    `eyebrow` VARCHAR(191) NULL,
    `headline` VARCHAR(191) NOT NULL,
    `subheadline` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `primaryCtaLabel` VARCHAR(191) NOT NULL,
    `primaryCtaHref` VARCHAR(191) NOT NULL,
    `secondaryCtaLabel` VARCHAR(191) NULL,
    `secondaryCtaHref` VARCHAR(191) NULL,
    `heroImage` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
