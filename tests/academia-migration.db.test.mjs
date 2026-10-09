import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { createRequire } from "node:module";
import { test } from "node:test";

test("la migración traslada entregas y retira la tabla auxiliar sin perder estado", {
  skip: process.env.ACADEMIA_MIGRATION_DB_TEST !== "1",
}, async () => {
  const load = createRequire(import.meta.url);
  load("dotenv").config({ quiet: true });
  const url = new URL(process.env.DATABASE_URL);
  assert.ok(["localhost", "127.0.0.1"].includes(url.hostname), "Esta prueba solo se ejecuta contra MySQL local.");
  const connection = await load("mariadb").createConnection({
    host: url.hostname, port: Number(url.port) || 3306, user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password), database: url.pathname.slice(1),
  });
  const suffix = randomUUID().replaceAll("-", "");
  const orders = `qa_pedido_${suffix}`, deliveries = `qa_entrega_${suffix}`;
  try {
    // Nombres exclusivos y tablas temporales de esta conexión: nunca se toca
    // la tabla real de pedidos, incluso al ejecutar el DROP de la migración.
    await connection.query(`CREATE TEMPORARY TABLE \`${orders}\` (id VARCHAR(191) PRIMARY KEY)`);
    await connection.query(`CREATE TEMPORARY TABLE \`${deliveries}\` (
      orderId VARCHAR(191), estado VARCHAR(191), cursos TEXT,
      email VARCHAR(191), nombre VARCHAR(191), apellidos VARCHAR(191),
      intentos INT, token VARCHAR(191), bloqueoHasta DATETIME(3),
      error TEXT, completadaAt DATETIME(3))`);
    for (const [id, estado, cursos, error] of [
      ["pagado", "COMPLETADA", '["principal","adicional"]', null],
      ["error", "ERROR", '["principal"]', "HTTP 401"],
      ["procesando", "PROCESANDO", '["principal"]', null],
      ["incompleto", "ERROR", "[]", "Sin cursos"],
    ]) {
      await connection.query(`INSERT INTO \`${orders}\` (id) VALUES (?)`, [id]);
      await connection.query(`INSERT INTO \`${deliveries}\` VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, estado, cursos, "qa@example.com", "Ana", "Pérez", 3, estado === "PROCESANDO" ? "token-qa" : null,
          estado === "PROCESANDO" ? new Date("2026-10-09T18:00:00Z") : null, error,
          estado === "COMPLETADA" ? new Date("2026-10-09T17:00:00Z") : null]);
    }
    await connection.query(`INSERT INTO \`${orders}\` (id) VALUES ('sin-entrega')`);
    const migration = (await readFile(new URL("../prisma/migrations/20261009150000_academia_en_pedido/migration.sql", import.meta.url), "utf8"))
      .replaceAll("`Order`", `\`${orders}\``).replaceAll("`InscripcionAcademia`", `\`${deliveries}\``);
    for (const statement of migration.split(";").filter((sql) => sql.trim())) await connection.query(statement);
    const rows = await connection.query(`SELECT * FROM \`${orders}\``);
    const completed = rows.find((row) => row.id === "pagado");
    assert.equal(completed.academiaEstado, "COMPLETADA");
    assert.equal(completed.academiaIntentos, 3);
    assert.ok(completed.academiaCompletadaAt instanceof Date);
    assert.deepEqual(JSON.parse(completed.academiaSolicitud), {
      email: "qa@example.com", firstName: "Ana", lastName: "Pérez", courseSlugs: ["principal", "adicional"],
    });
    assert.equal(rows.find((row) => row.id === "error").academiaError, "HTTP 401");
    assert.equal(rows.find((row) => row.id === "procesando").academiaToken, "token-qa");
    assert.ok(rows.find((row) => row.id === "procesando").academiaBloqueoHasta instanceof Date);
    assert.equal(rows.find((row) => row.id === "incompleto").academiaSolicitud, null);
    assert.equal(rows.find((row) => row.id === "sin-entrega").academiaEstado, "PENDIENTE");
    await assert.rejects(connection.query(`SELECT * FROM \`${deliveries}\``), (error) => error.code === "ER_NO_SUCH_TABLE");
  } finally { await connection.end(); }
});
