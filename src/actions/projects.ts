"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { assertUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { projectSchema } from "@/lib/validation";
import type { ActionState } from "@/lib/action-state";

/**
 * Server Actions для проектов.
 *
 * Каждая функция начинается с assertUser(): действие можно вызвать напрямую
 * HTTP-запросом, минуя страницы админки, поэтому проверка в layout интерфейс
 * защищает, а данные — только такая проверка внутри самой операции.
 */

function validateProjectForm(formData: FormData) {
  return projectSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    summary: formData.get("summary"),
    content: formData.get("content"),
    techStack: formData.get("techStack") ?? "",
    repoUrl: formData.get("repoUrl") ?? "",
    liveUrl: formData.get("liveUrl") ?? "",
    featured: formData.get("featured"),
    published: formData.get("published"),
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
 * После изменения данных нужно сбросить кэш затронутых страниц.
 * Публичные страницы собираются статически, поэтому без этого шага
 * правка в админке не была бы видна посетителям до пересборки.
 */
function revalidateProjectViews(slug?: string) {
  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath("/admin/projects");

  if (slug) {
    revalidatePath(`/projects/${slug}`);
  }
}

export async function createProjectAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertUser();

  const parsed = validateProjectForm(formData);

  if (!parsed.success) {
    return validationError(parsed.error);
  }

  const data = parsed.data;

  // Проверяем заранее, чтобы показать понятную ошибку у поля,
  // а не отдать наружу сообщение о нарушении уникальности из базы.
  const slugTaken = await prisma.project.findUnique({
    where: { slug: data.slug },
    select: { id: true },
  });

  if (slugTaken) {
    return {
      status: "error",
      message: "Проект с таким адресом уже существует",
      fieldErrors: { slug: ["Этот slug уже занят"] },
    };
  }

  await prisma.project.create({
    data: {
      title: data.title,
      slug: data.slug,
      summary: data.summary,
      content: data.content,
      techStack: data.techStack,
      repoUrl: data.repoUrl,
      liveUrl: data.liveUrl,
      featured: data.featured,
      published: data.published,
      position: data.position,
      publishedAt: data.published ? new Date() : null,
    },
  });

  revalidateProjectViews(data.slug);
  redirect("/admin/projects");
}

export async function updateProjectAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertUser();

  const id = String(formData.get("id") ?? "");

  if (!id) {
    return { status: "error", message: "Не передан идентификатор проекта" };
  }

  const parsed = validateProjectForm(formData);

  if (!parsed.success) {
    return validationError(parsed.error);
  }

  const data = parsed.data;
  const current = await prisma.project.findUnique({ where: { id } });

  if (!current) {
    return { status: "error", message: "Проект не найден" };
  }

  // Slug мог измениться, и тогда его должен занять кто-то другой.
  const slugTaken = await prisma.project.findFirst({
    where: { slug: data.slug, NOT: { id } },
    select: { id: true },
  });

  if (slugTaken) {
    return {
      status: "error",
      message: "Проект с таким адресом уже существует",
      fieldErrors: { slug: ["Этот slug уже занят"] },
    };
  }

  await prisma.project.update({
    where: { id },
    data: {
      title: data.title,
      slug: data.slug,
      summary: data.summary,
      content: data.content,
      techStack: data.techStack,
      repoUrl: data.repoUrl,
      liveUrl: data.liveUrl,
      featured: data.featured,
      published: data.published,
      position: data.position,
      // Дату первой публикации сохраняем: повторное сохранение не должно
      // переставлять проект в начало списка.
      publishedAt: data.published
        ? (current.publishedAt ?? new Date())
        : null,
    },
  });

  revalidateProjectViews(current.slug);
  revalidateProjectViews(data.slug);
  redirect("/admin/projects");
}

export async function deleteProjectAction(formData: FormData): Promise<void> {
  await assertUser();

  const id = String(formData.get("id") ?? "");
  const slug = String(formData.get("slug") ?? "");

  if (!id) {
    return;
  }

  await prisma.project.delete({ where: { id } });

  revalidateProjectViews(slug);
  revalidatePath("/admin/projects");
}
