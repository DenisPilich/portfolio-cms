import { put } from "@vercel/blob";
import { getSessionUser } from "@/lib/auth";

/**
 * Загрузка обложек.
 *
 * Это Route Handler, а не Server Action: файл удобнее отправить обычным
 * POST-запросом из браузера, а в ответ получить адрес. Форма при этом
 * остаётся формой — компонент кладёт полученную ссылку в скрытое поле.
 *
 * Проверка сессии обязательна: адрес обработчика известен, и без неё
 * любой желающий мог бы заливать файлы в хранилище за наш счёт.
 */
export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
]);

/**
 * Имя файла приходит от пользователя, поэтому в путь его пускать нельзя:
 * «../../» в имени позволил бы записать файл куда угодно. Оставляем только
 * латиницу, цифры и точки, остальное заменяем дефисом.
 */
function sanitizeFileName(name: string): string {
  const cleaned = name
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  return cleaned.length > 0 ? cleaned : "image";
}

/**
 * Проверяет, что хранилище вообще подключено.
 *
 * Способов два, и оба законные. Статический токен BLOB_READ_WRITE_TOKEN
 * удобен вне Vercel — например, в CI или на своём сервере. Но на самой
 * Vercel по умолчанию используется OIDC: вместо долгоживущего секрета
 * выдаются BLOB_STORE_ID и короткоживущий VERCEL_OIDC_TOKEN, который
 * SDK обновляет сам.
 *
 * Проверять только токен было бы ошибкой: при подключении через OIDC
 * его в окружении нет, и загрузка отвечала бы «хранилище не настроено»,
 * хотя всё работает.
 */
function isBlobConfigured(): boolean {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    return true;
  }

  return Boolean(process.env.BLOB_STORE_ID && process.env.VERCEL_OIDC_TOKEN);
}

export async function POST(request: Request) {
  const user = await getSessionUser();

  if (!user) {
    return Response.json({ error: "Требуется авторизация" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return Response.json({ error: "Файл не передан" }, { status: 400 });
  }

  // Тип проверяем по заголовку от браузера. Для учебного проекта этого
  // достаточно, но по-хорошему содержимое стоило бы проверить по сигнатуре:
  // заголовок подделывается тривиально.
  if (!ALLOWED_TYPES.has(file.type)) {
    return Response.json(
      { error: "Поддерживаются только JPEG, PNG, WebP, AVIF и GIF" },
      { status: 415 },
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return Response.json(
      { error: "Файл больше 5 МБ. Сожмите изображение и попробуйте снова." },
      { status: 413 },
    );
  }

  // Настройки окружения проверяем после входных данных: сначала убеждаемся,
  // что запрос корректен, и только потом выясняем, готово ли хранилище.
  if (!isBlobConfigured()) {
    return Response.json(
      {
        error:
          "Хранилище не настроено. Подключите Vercel Blob к проекту или добавьте BLOB_READ_WRITE_TOKEN в переменные окружения.",
      },
      { status: 503 },
    );
  }

  try {
    const blob = await put(
      `covers/${Date.now()}-${sanitizeFileName(file.name)}`,
      file,
      { access: "public" },
    );

    return Response.json({ url: blob.url });
  } catch (error) {
    console.error("Не удалось загрузить файл в хранилище:", error);

    return Response.json(
      { error: "Хранилище недоступно, попробуйте позже" },
      { status: 502 },
    );
  }
}
