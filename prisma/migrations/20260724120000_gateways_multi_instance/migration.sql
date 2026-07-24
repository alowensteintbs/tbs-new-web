-- Allow multiple instances per provider (e.g. a Stripe account per region,
-- each with its own credentials, selected at checkout by currency).
-- Replaces the unique constraint on `provider` with a plain index.
DROP INDEX `PaymentGateway_provider_key` ON `PaymentGateway`;

CREATE INDEX `PaymentGateway_provider_idx` ON `PaymentGateway`(`provider`);
