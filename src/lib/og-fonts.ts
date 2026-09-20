import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Шрифты для генерации OG-картинок.
 *
 * Встроенный в генератор шрифт не содержит кириллицы, поэтому заголовки
 * на русском превратились бы в пустые прямоугольники. Inter с поддержкой
 * кириллицы лежит в репозитории (лицензия SIL OFL), а не скачивается
 * по сети: генерация картинки не должна зависеть от внешнего запроса.
 */
const FONT_DIRECTORY = join(process.cwd(), "src", "assets", "fonts");

async function loadFont(fileName: string): Promise<ArrayBuffer> {
  const buffer = await readFile(join(FONT_DIRECTORY, fileName));

  // Buffer — это представление над общим участком памяти, поэтому
  // в Satori нужно передать именно срез нужной длины.
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  ) as ArrayBuffer;
}

export async function loadOgFonts() {
  const [cyrillicRegular, cyrillicBold, latinRegular, latinBold] =
    await Promise.all([
      loadFont("inter-cyrillic-400.woff"),
      loadFont("inter-cyrillic-700.woff"),
      loadFont("inter-latin-400.woff"),
      loadFont("inter-latin-700.woff"),
    ]);

  // Все начертания идут под одним именем: Satori сам подставит тот набор,
  // в котором есть нужный глиф, — латиница и кириллица смешиваются
  // в одной строке без ручного разбиения.
  return [
    { name: "Inter", data: cyrillicRegular, weight: 400 as const, style: "normal" as const },
    { name: "Inter", data: cyrillicBold, weight: 700 as const, style: "normal" as const },
    { name: "Inter", data: latinRegular, weight: 400 as const, style: "normal" as const },
    { name: "Inter", data: latinBold, weight: 700 as const, style: "normal" as const },
  ];
}

/** Общие размеры картинки для соцсетей. */
export const OG_SIZE = { width: 1200, height: 630 };
