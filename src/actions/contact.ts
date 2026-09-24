"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { contactSchema } from "@/lib/validation";
import type { ActionState } from "@/lib/action-state";

/**
 * Приём сообщений из формы обратной связи.
 *
 * Это единственное действие в проекте, доступное без авторизации: любой
 * посетитель может оставить сообщение. Поэтому здесь нет assertUser,
 * зато есть защита от автоматических отправок.
 *
 * Ловушка (honeypot): в форме есть поле company, скрытое от человека.
 * Бот заполняет все поля подряд и выдаёт себя. Отвечаем ему тем же текстом,
 * что и человеку, — иначе он поймёт, что его распознали, и попробует иначе.
 *
 * Настоящий ограничитель частоты потребовал бы хранилища вроде Redis:
 * в памяти процесса счётчик не работает, потому что серверных экземпляров
 * может быть несколько. Для портфолио ловушки достаточно.
 */
export async function submitContactAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
    company: formData.get("company") ?? "",
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Проверьте правильность заполнения полей",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const success: ActionState = {
    status: "success",
    message: "Спасибо! Сообщение отправлено — отвечу на указанную почту.",
  };

  if (parsed.data.company) {
    return success;
  }

  await prisma.contactMessage.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      message: parsed.data.message,
    },
  });

  // Счётчик непрочитанных на дашборде должен обновиться
  revalidatePath("/admin");

  return success;
}
