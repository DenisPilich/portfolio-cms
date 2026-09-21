"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { assertUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CACHE_TAGS } from "@/lib/queries";
import { skillSchema } from "@/lib/validation";
import type { ActionState } from "@/lib/action-state";

/**
 * Server Actions для навыков.
 *
 * Как и везде в админке, каждая операция начинается с assertUser():
 * действие можно вызвать напрямую, минуя страницы, поэтому проверка
 * в layout защищает интерфейс, а не данные.
 */

function validateSkillForm(formData: FormData) {
  return skillSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") ?? "",
    category: formData.get("category"),
    icon: formData.get("icon") ?? "",
    position: formData.get("position") || 0,
  });
}

function validationError(error: z.ZodError): ActionState {
  return {
    status: "error",
    message: "Проверьте правильность заполнения полей",
    fieldErrors: z.flattenError(error).fieldErrors,
  };
}

/**
 * Навыки выводятся на главной, поэтому после любой правки сбрасываем
 * их тег — иначе раздел останется в прежнем виде до пересборки.
 */
function revalidateSkills() {
  updateTag(CACHE_TAGS.skills);
}

export async function createSkillAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertUser();

  const parsed = validateSkillForm(formData);

  if (!parsed.success) {
    return validationError(parsed.error);
  }

  await prisma.skill.create({ data: parsed.data });

  revalidateSkills();
  redirect("/admin/skills");
}

export async function updateSkillAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertUser();

  const id = String(formData.get("id") ?? "");

  if (!id) {
    return { status: "error", message: "Не передан идентификатор навыка" };
  }

  const parsed = validateSkillForm(formData);

  if (!parsed.success) {
    return validationError(parsed.error);
  }

  const exists = await prisma.skill.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!exists) {
    return { status: "error", message: "Навык не найден" };
  }

  await prisma.skill.update({ where: { id }, data: parsed.data });

  revalidateSkills();
  redirect("/admin/skills");
}

export async function deleteSkillAction(formData: FormData): Promise<void> {
  await assertUser();

  const id = String(formData.get("id") ?? "");

  if (!id) {
    return;
  }

  await prisma.skill.delete({ where: { id } });

  revalidateSkills();
}
