-- Drop the non-unique provider index and replace with a unique constraint
-- (WooCommerce-style fixed list: one row per provider).
DROP INDEX `PaymentGateway_provider_idx` ON `PaymentGateway`;

CREATE UNIQUE INDEX `PaymentGateway_provider_key` ON `PaymentGateway`(`provider`);
