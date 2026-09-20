import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

/**
 * Конфигурация тестов.
 *
 * Проверяются чистые функции: преобразование slug, форматирование дат,
 * схемы валидации. Они не обращаются ни к базе, ни к сети, поэтому тесты
 * быстрые и не требуют поднятого окружения.
 *
 * Расширение .mts, а не .ts: конфиг написан на ESM-синтаксисе, и Vite
 * иначе предупреждает, что файл загружается как CommonJS и в следующей
 * мажорной версии это перестанет работать.
 *
 * Алиас @ повторяет заданный в tsconfig, иначе импорты вида "@/lib/slug"
 * в тестах не разрешились бы.
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
