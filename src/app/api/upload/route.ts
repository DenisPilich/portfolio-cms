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
 * Достаточно одного из двух: статического токена BLOB_READ_WRITE_TOKEN
 * или идентификатора store BLOB_STORE_ID. Во втором случае токен добирает
 * сам SDK — в том числе через OIDC.
 *
 * Требовать ещё и VERCEL_OIDC_TOKEN нельзя, и это не придирка. На деплоях
 * Vercel выдаёт OIDC-токен не как обычную переменную окружения, поэтому
 * проверка «есть ли он в process.env» отказывала раньше, чем SDK успевал
 * что-либо предпринять: загрузка сообщала «хранилище не настроено» там,
 * где всё было настроено. Пусть решает SDK — он для этого и написан.
 */
function isBlobConfigured(): boolean {
  return Boolean(
    process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID,
  );
}

/**
 * Подсказка администратору, что именно сделать.
 *
 * Сообщение видит только вошедший пользователь: это админка, а не публичная
 * страница. Значения переменных не раскрываются — только имена.
 */
function blobSetupHint(): string {
  const missing = ["BLOB_READ_WRITE_TOKEN", "BLOB_STORE_ID"].filter(
    (name) => !process.env[name],
  );

  return `Storage is not configured (missing: ${missing.join(", ")}). Connect a Vercel Blob store to the project, or copy the read/write token from Storage → your store → Settings into the project environment variables, then redeploy.`;
}

export async function POST(request: Request) {
  const user = await getSessionUser();

  if (!user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return Response.json({ error: "No file provided" }, { status: 400 });
  }

  // Тип проверяем по заголовку от браузера. Для учебного проекта этого
  // достаточно, но по-хорошему содержимое стоило бы проверить по сигнатуре:
  // заголовок подделывается тривиально.
  if (!ALLOWED_TYPES.has(file.type)) {
    return Response.json(
      { error: "Only JPEG, PNG, WebP, AVIF and GIF are supported" },
      { status: 415 },
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return Response.json(
      { error: "The file is larger than 5 MB. Compress it and try again." },
      { status: 413 },
    );
  }

  // Настройки окружения проверяем после входных данных: сначала убеждаемся,
  // что запрос корректен, и только потом выясняем, готово ли хранилище.
  if (!isBlobConfigured()) {
    return Response.json({ error: blobSetupHint() }, { status: 503 });
  }

  try {
    const blob = await put(
      `covers/${Date.now()}-${sanitizeFileName(file.name)}`,
      file,
      { access: "public" },
    );

    return Response.json({ url: blob.url });
  } catch (error) {
    // Полный текст уходит в лог сервера, а администратору показываем причину
    // коротко: иначе при отказе хранилища остаётся только гадать, дело
    // в правах, в адресе или в самом файле.
    console.error("Не удалось загрузить файл в хранилище:", error);

    const reason = error instanceof Error ? error.message : String(error);

    return Response.json(
      { error: `Storage is unavailable: ${reason.slice(0, 300)}` },
      { status: 502 },
    );
  }
}
