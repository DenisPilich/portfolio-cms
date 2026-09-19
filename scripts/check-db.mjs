import "dotenv/config";
import pg from "pg";

/**
 * Проверка состояния базы: подключение и количество записей в таблицах.
 * Полезно после миграций и сидирования. Запуск: node scripts/check-db.mjs
 */
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL не задана. Проверьте файл .env");
  process.exit(1);
}

const TABLES = [
  "users",
  "projects",
  "posts",
  "tags",
  "contact_messages",
  "site_settings",
];

const client = new pg.Client({
  connectionString,
  connectionTimeoutMillis: 15000,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();

  const { rows } = await client.query("select current_database() as db");
  console.log(`Подключение установлено: база "${rows[0].db}"\n`);

  for (const table of TABLES) {
    const result = await client.query(
      `select count(*)::int as count from "${table}"`,
    );
    console.log(`  ${table.padEnd(18)} ${result.rows[0].count}`);
  }
} catch (error) {
  console.error(`Ошибка: ${error.message}`);
  process.exitCode = 1;
} finally {
  await client.end();
}
