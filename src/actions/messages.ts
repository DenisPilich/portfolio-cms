"use server";

import { revalidatePath } from "next/cache";
import { assertUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Действия над сообщениями обратной связи.
 *
 * Обе операции начинаются с assertUser: их можно вызвать напрямую,
 * а читать чужие письма посторонним незачем.
 */
export async function toggleMessageReadAction(
  formData: FormData,
): Promise<void> {
  await assertUser();

  const id = String(formData.get("id") ?? "");
  const markAsRead = formData.get("read") === "true";

  if (!id) {
    return;
  }

  await prisma.contactMessage.update({
    where: { id },
    data: { read: markAsRead },
  });

  revalidatePath("/admin/messages");
  revalidatePath("/admin");
}

export async function deleteMessageAction(formData: FormData): Promise<void> {
  await assertUser();

  const id = String(formData.get("id") ?? "");

  if (!id) {
    return;
  }

  await prisma.contactMessage.delete({ where: { id } });

  revalidatePath("/admin/messages");
  revalidatePath("/admin");
}
