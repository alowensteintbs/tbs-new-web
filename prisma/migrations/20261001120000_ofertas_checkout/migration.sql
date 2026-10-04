-- AlterTable
ALTER TABLE `OrderItem` ADD COLUMN `discountAmount` DECIMAL(12, 2) NULL,
    ADD COLUMN `ofertaId` VARCHAR(191) NULL,
    ADD COLUMN `origen` ENUM('PRINCIPAL', 'ORDER_BUMP') NOT NULL DEFAULT 'PRINCIPAL';

-- CreateTable
CREATE TABLE `OfertaCheckout` (
    `id` VARCHAR(191) NOT NULL,
    `productoPrincipalId` VARCHAR(191) NOT NULL,
    `productoOfrecidoId` VARCHAR(191) NOT NULL,
    `titulo` VARCHAR(191) NOT NULL,
    `descripcion` TEXT NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT false,
    `posicion` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `OfertaCheckout_productoPrincipalId_activo_posicion_idx`(`productoPrincipalId`, `activo`, `posicion`),
    INDEX `OfertaCheckout_productoOfrecidoId_idx`(`productoOfrecidoId`),
    UNIQUE INDEX `OfertaCheckout_productoPrincipalId_productoOfrecidoId_key`(`productoPrincipalId`, `productoOfrecidoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OfertaCheckoutPrice` (
    `id` VARCHAR(191) NOT NULL,
    `ofertaId` VARCHAR(191) NOT NULL,
    `currencyId` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(12, 2) NOT NULL,

    INDEX `OfertaCheckoutPrice_currencyId_idx`(`currencyId`),
    UNIQUE INDEX `OfertaCheckoutPrice_ofertaId_currencyId_key`(`ofertaId`, `currencyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_ofertaId_fkey` FOREIGN KEY (`ofertaId`) REFERENCES `OfertaCheckout`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OfertaCheckout` ADD CONSTRAINT `OfertaCheckout_productoPrincipalId_fkey` FOREIGN KEY (`productoPrincipalId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OfertaCheckout` ADD CONSTRAINT `OfertaCheckout_productoOfrecidoId_fkey` FOREIGN KEY (`productoOfrecidoId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OfertaCheckoutPrice` ADD CONSTRAINT `OfertaCheckoutPrice_ofertaId_fkey` FOREIGN KEY (`ofertaId`) REFERENCES `OfertaCheckout`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OfertaCheckoutPrice` ADD CONSTRAINT `OfertaCheckoutPrice_currencyId_fkey` FOREIGN KEY (`currencyId`) REFERENCES `Currency`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

