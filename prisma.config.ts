import "dotenv/config";
import { defineConfig, env } from "prisma/config";

/**
 * Конфигурация Prisma CLI (миграции, генерация, studio).
 *
 * В Prisma 7 строка подключения живёт здесь, а не в schema.prisma.
 * Файл читается только инструментами CLI — само приложение берёт
 * DATABASE_URL из окружения напрямую (см. src/lib/prisma.ts).
 *
 * `import "dotenv/config"` обязателен: CLI не подхватывает .env сам,
 * в отличие от Next.js.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
