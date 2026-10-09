-- La migración anterior ya fue aplicada: conservar su historial y trasladar
-- las entregas al pedido antes de retirar la tabla auxiliar.
ALTER TABLE `Order`
    ADD COLUMN `academiaEstado` VARCHAR(191) NOT NULL DEFAULT 'PENDIENTE',
    ADD COLUMN `academiaSolicitud` TEXT NULL,
    ADD COLUMN `academiaIntentos` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `academiaToken` VARCHAR(191) NULL,
    ADD COLUMN `academiaBloqueoHasta` DATETIME(3) NULL,
    ADD COLUMN `academiaError` TEXT NULL,
    ADD COLUMN `academiaCompletadaAt` DATETIME(3) NULL;

UPDATE `Order` AS o
INNER JOIN `InscripcionAcademia` AS i ON i.`orderId` = o.`id`
SET o.`academiaEstado` = i.`estado`,
    o.`academiaSolicitud` = CASE WHEN i.`cursos` = '[]' THEN NULL ELSE
      JSON_OBJECT('email', i.`email`, 'firstName', i.`nombre`,
        'lastName', i.`apellidos`, 'courseSlugs', JSON_EXTRACT(i.`cursos`, '$')) END,
    o.`academiaIntentos` = i.`intentos`,
    o.`academiaToken` = i.`token`,
    o.`academiaBloqueoHasta` = i.`bloqueoHasta`,
    o.`academiaError` = i.`error`,
    o.`academiaCompletadaAt` = i.`completadaAt`;

DROP TABLE `InscripcionAcademia`;
