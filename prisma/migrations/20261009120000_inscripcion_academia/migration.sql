CREATE TABLE `InscripcionAcademia` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `apellidos` VARCHAR(191) NOT NULL,
    `cursos` TEXT NOT NULL,
    `estado` VARCHAR(191) NOT NULL DEFAULT 'PENDIENTE',
    `intentos` INTEGER NOT NULL DEFAULT 0,
    `token` VARCHAR(191) NULL,
    `bloqueoHasta` DATETIME(3) NULL,
    `error` TEXT NULL,
    `completadaAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    UNIQUE INDEX `InscripcionAcademia_orderId_key` (`orderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `InscripcionAcademia` ADD CONSTRAINT `InscripcionAcademia_orderId_fkey`
    FOREIGN KEY (`orderId`) REFERENCES `Order` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
