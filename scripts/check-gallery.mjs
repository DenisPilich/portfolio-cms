import "dotenv/config";
import pg from "pg";

/**
 * Проверка ссылок галереи: что записано в базе и отвечает ли каждая ссылка.
 * Запуск: node scripts/check-gallery.mjs
 */
const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 15000,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();

  const { rows } = await client.query(
    `select p.slug, p.title, i.position, i.url, i.alt
       from "project_images" i
       join "projects" p on p.id = i."projectId"
      order by p.position asc, i.position asc`,
  );

  console.log(`Снимков в базе: ${rows.length}\n`);

  for (const image of rows) {
    let status = "?";
    let detail = "";

    try {
      const response = await fetch(image.url, { method: "GET" });
      status = String(response.status);
      detail = `${response.headers.get("content-type") ?? "?"} · ${response.headers.get("content-length") ?? "?"} байт`;
    } catch (error) {
      status = "ошибка";
      detail = error.message;
    }

    console.log(`[${image.slug}] #${image.position} → ${status} ${detail}`);
    console.log(`   ${image.url}`);
  }
} catch (error) {
  console.error(`Ошибка: ${error.message}`);
  process.exitCode = 1;
} finally {
  await client.end();
}
