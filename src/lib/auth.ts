import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";

/**
 * Сессии админки.
 *
 * Как это устроено: после успешного входа сервер подписывает компактный
 * JWT своим секретом и кладёт его в cookie. Cookie помечена httpOnly —
 * JavaScript в браузере её не видит, поэтому украсть токен через XSS
 * и утащить в localStorage не получится. Флаг sameSite=lax не даёт
 * отправлять её с чужих сайтов, что закрывает CSRF для переходов.
 *
 * Подпись проверяется на сервере при каждом обращении: содержимое cookie
 * клиент может прочитать (JWT не шифрует данные), но изменить — нет,
 * потому что для валидной подписи нужен AUTH_SECRET.
 *
 * Данные в токене минимальны — идентификатор, имя и роль. Пароль и хеш
 * туда не попадают никогда.
 */

const SESSION_COOKIE_NAME = "portfolio_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // неделя доступа
const JWT_ALGORITHM = "HS256";

export type SessionUser = {
  userId: string;
  email: string;
  name: string;
  role: "ADMIN" | "EDITOR";
};

function getSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;

  if (!secret || secret === "replace-me") {
    throw new Error(
      "Не задан AUTH_SECRET. Сгенерируйте его командой node -e \"console.log(require('crypto').randomBytes(32).toString('base64url'))\" и добавьте в .env",
    );
  }

  return new TextEncoder().encode(secret);
}

export async function createSession(user: SessionUser): Promise<void> {
  const token = await new SignJWT({
    userId: user.userId,
    email: user.email,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: JWT_ALGORITHM })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSecretKey());

  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    // В продакшене cookie передаётся только по HTTPS.
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    // algorithms указывается явно: иначе токен, подписанный другим способом,
    // мог бы быть принят за валидный.
    const { payload } = await jwtVerify(token, getSecretKey(), {
      algorithms: [JWT_ALGORITHM],
    });

    return {
      userId: String(payload.userId),
      email: String(payload.email),
      name: String(payload.name),
      role: payload.role === "EDITOR" ? "EDITOR" : "ADMIN",
    };
  } catch {
    // Подпись не сошлась или срок истёк — считаем, что сессии нет.
    return null;
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Для страниц админки: если сессии нет, отправляем на форму входа.
 */
export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

/**
 * Для Server Actions: бросаем ошибку вместо редиректа.
 *
 * Это не дублирование requireUser, а необходимая защита. Server Action —
 * это отдельная точка входа: её можно вызвать HTTP-запросом, минуя страницы
 * админки. Проверка в layout защищает интерфейс, но не саму мутацию,
 * поэтому каждая action проверяет сессию самостоятельно.
 */
export async function assertUser(): Promise<SessionUser> {
  const user = await getSessionUser();

  if (!user) {
    throw new Error("Требуется авторизация");
  }

  return user;
}
