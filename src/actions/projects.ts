"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { assertUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CACHE_TAGS } from "@/lib/queries";
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
    coverImage: formData.get("coverImage") ?? "",
    gallery: formData.get("gallery") ?? "",
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
    message: "Please check the form fields",
    fieldErrors: z.flattenError(error).fieldErrors,
  };
}

/**
 * Сброс кэша после изменения проекта.
 *
 * Публичные страницы собираются статически, поэтому без этого шага правка
 * в админке не была бы видна посетителям до следующей пересборки.
 *
 * Используется updateTag, а не revalidateTag. Разница принципиальная:
 * revalidateTag помечает данные устаревшими и обновляет их в фоне, поэтому
 * сразу после сохранения на странице ещё может показываться старая версия.
 * updateTag истекает немедленно и доступен только внутри Server Action —
 * ровно наш случай: администратор сохранил и тут же видит результат.
 *
 * Инвалидация точечная: сбрасывается всё, что построено на данных с этим
 * тегом, — главная, список проектов и детальные страницы. Перечислять
 * адреса по отдельности не нужно, и страницы, добавленные позже, тоже
 * попадут под инвалидацию автоматически.
 */
function revalidateProjectViews() {
  updateTag(CACHE_TAGS.projects);

  // Карта сайта — отдельный обработчик, с данными через теги он не связан,
  // поэтому его адрес сбрасываем явно.
  revalidatePath("/sitemap.xml");
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
      message: "A project with this slug already exists",
      fieldErrors: { slug: ["This slug is already taken"] },
    };
  }

  // Проект и его галерея записываются одной транзакцией: если снимки
  // по какой-то причине не сохранятся, проект без них оставаться не должен.
  await prisma.$transaction(async (tx) => {
    const project = await tx.project.create({
      data: {
        title: data.title,
        slug: data.slug,
        summary: data.summary,
        content: data.content,
        coverImage: data.coverImage,
        techStack: data.techStack,
        repoUrl: data.repoUrl,
        liveUrl: data.liveUrl,
        featured: data.featured,
        published: data.published,
        position: data.position,
        publishedAt: data.published ? new Date() : null,
      },
      select: { id: true },
    });

    if (data.gallery.length > 0) {
      await tx.projectImage.createMany({
        data: data.gallery.map((image, index) => ({
          url: image.url,
          alt: image.alt ?? null,
          // Порядок берём из позиции в списке: отдельное поле в форме
          // не нужно, администратор расставляет снимки перетаскиванием.
          position: index,
          projectId: project.id,
        })),
      });
    }
  });

  revalidateProjectViews();
  redirect("/admin/projects");
}

export async function updateProjectAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertUser();

  const id = String(formData.get("id") ?? "");

  if (!id) {
    return { status: "error", message: "Project id is missing" };
  }

  const parsed = validateProjectForm(formData);

  if (!parsed.success) {
    return validationError(parsed.error);
  }

  const data = parsed.data;
  const current = await prisma.project.findUnique({ where: { id } });

  if (!current) {
    return { status: "error", message: "Project not found" };
  }

  // Slug мог измениться, и тогда его должен занять кто-то другой.
  const slugTaken = await prisma.project.findFirst({
    where: { slug: data.slug, NOT: { id } },
    select: { id: true },
  });

  if (slugTaken) {
    return {
      status: "error",
      message: "A project with this slug already exists",
      fieldErrors: { slug: ["This slug is already taken"] },
    };
  }

  await prisma.$transaction(async (tx) => {
    await tx.project.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        summary: data.summary,
        content: data.content,
        coverImage: data.coverImage,
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

    // Галерею проще пересобрать целиком, чем вычислять, что добавили, что
    // убрали и что переставили местами: снимков немного, а разница между
    // «обновить» и «пересоздать» здесь незаметна.
    await tx.projectImage.deleteMany({ where: { projectId: id } });

    if (data.gallery.length > 0) {
      await tx.projectImage.createMany({
        data: data.gallery.map((image, index) => ({
          url: image.url,
          alt: image.alt ?? null,
          position: index,
          projectId: id,
        })),
      });
    }
  });

  revalidateProjectViews();
  redirect("/admin/projects");
}

export async function deleteProjectAction(formData: FormData): Promise<void> {
  await assertUser();

  const id = String(formData.get("id") ?? "");

  if (!id) {
    return;
  }

  await prisma.project.delete({ where: { id } });

  revalidateProjectViews();
}
