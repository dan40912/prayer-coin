ALTER TABLE `home_prayer_card`
  ADD COLUMN `locationCity` VARCHAR(120) NULL,
  ADD COLUMN `locationCountry` VARCHAR(120) NULL,
  ADD COLUMN `locationLat` DECIMAL(9,6) NULL,
  ADD COLUMN `locationLng` DECIMAL(9,6) NULL;
