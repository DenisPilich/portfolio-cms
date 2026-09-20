"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSession, destroySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validation";
import type { ActionState } from "@/lib/action-state";

/**
 * Вход в админку.
 *
 * Server Action — это функция, которая физически выполняется на сервере,
 * но вызывается из формы напрямую, без ручного fetch и без API-маршрута.
 * Next.js сам создаёт служебную конечную точку и передаёт туда FormData.
 */
export async function loginAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Проверьте правильность заполнения полей",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });

  const passwordMatches = user
    ? await bcrypt.compare(parsed.data.password, user.passwordHash)
    : false;

  // Сообщение одинаково для «пользователя нет» и «пароль неверный»:
  // иначе форма превращается в инструмент перебора существующих адресов.
  if (!user || !passwordMatches) {
    return { status: "error", message: "Неверный email или пароль" };
  }

  await createSession({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  // redirect выбрасывает служебное исключение, поэтому его нельзя
  // оборачивать в try/catch — иначе переход не сработает.
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/login");
}
