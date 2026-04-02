ALTER TABLE `user`
  ADD COLUMN `sessionVersion` INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN `publicProfileEnabled` BOOLEAN NOT NULL DEFAULT true;

CREATE TABLE `overcomer_user_report` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `targetUserId` VARCHAR(191) NOT NULL,
  `reporterId` VARCHAR(191) NOT NULL,
  `reason` VARCHAR(191) NOT NULL,
  `remarks` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  UNIQUE INDEX `overcomer_user_report_targetUserId_reporterId_key`(`targetUserId`, `reporterId`),
  INDEX `overcomer_user_report_targetUserId_idx`(`targetUserId`),
  INDEX `overcomer_user_report_reporterId_idx`(`reporterId`),
  INDEX `overcomer_user_report_createdAt_idx`(`createdAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `overcomer_user_report`
  ADD CONSTRAINT `overcomer_user_report_targetUserId_fkey`
    FOREIGN KEY (`targetUserId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `overcomer_user_report_reporterId_fkey`
    FOREIGN KEY (`reporterId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
