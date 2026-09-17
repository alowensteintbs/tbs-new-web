-- Add the code-backed landing association as nullable so existing products can
-- be matched before the required constraint is applied.
ALTER TABLE `Product` ADD COLUMN `landingSlug` VARCHAR(191) NULL;

-- Existing products whose catalog slug already names a known landing keep that
-- route. Any unmatched real product intentionally makes the NOT NULL step fail
-- instead of receiving an incorrect landing.
UPDATE `Product`
SET `landingSlug` = `slug`
WHERE `slug` IN (
  'acciones',
  'cripto',
  'efa',
  'eia',
  'eip',
  'finanzas-personales',
  'inversor-inteligente',
  'pack-premium',
  'trading',
  'trading-algoritmico'
);

-- Confirmed development-only fixture. Related prices are deleted by cascade;
-- OrderItem snapshots intentionally remain independent from Product.
DELETE FROM `Product` WHERE `slug` = 'test';

ALTER TABLE `Product` MODIFY `landingSlug` VARCHAR(191) NOT NULL;
CREATE UNIQUE INDEX `Product_landingSlug_key` ON `Product`(`landingSlug`);

DROP TABLE `Page`;
