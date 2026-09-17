DROP INDEX `Product_slug_key` ON `Product`;
DROP INDEX `Product_slug_idx` ON `Product`;
ALTER TABLE `Product` DROP COLUMN `slug`;
