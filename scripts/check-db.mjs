import "dotenv/config";
import pg from "pg";

/**
 * Проверка состояния базы: подключение, количество записей в таблицах
 * и последние сообщения из формы обратной связи.
 * Полезно после миграций и сидирования. Запуск: node scripts/check-db.mjs
 *
 * Сообщения показываются затем, чтобы не лезть в админку ради проверки:
 * форма их не пересылает на почту, а складывает в базу.
 */
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL не задана. Проверьте файл .env");
  process.exit(1);
}

const TABLES = [
  "users",
  "projects",
  "skills",
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

  const messages = await client.query(
    `select name, email, read, "createdAt"
       from "contact_messages"
      order by "createdAt" desc
      limit 5`,
  );

  console.log("\nПоследние сообщения:");

  if (messages.rows.length === 0) {
    console.log("  (пусто)");
  }

  for (const message of messages.rows) {
    const when = new Date(message.createdAt).toISOString().slice(0, 16);
    const state = message.read ? "прочитано" : "новое";
    console.log(
      `  ${when}  ${message.name} <${message.email}>  [${state}]`,
    );
  }
} catch (error) {
  console.error(`Ошибка: ${error.message}`);
  process.exitCode = 1;
} finally {
  await client.end();
}
