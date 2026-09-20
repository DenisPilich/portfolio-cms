"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { assertUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CACHE_TAGS } from "@/lib/queries";
import { slugify } from "@/lib/slug";
import { estimateReadingTime } from "@/lib/format";
import { postSchema } from "@/lib/validation";
import type { ActionState } from "@/lib/action-state";

function validatePostForm(formData: FormData) {
  return postSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    excerpt: formData.get("excerpt"),
    content: formData.get("content"),
    coverImage: formData.get("coverImage") ?? "",
    tags: formData.get("tags") ?? "",
    published: formData.get("published"),
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
 * Превращает список названий тегов в связи.
 *
 * Тег создаётся при первом упоминании: отдельная страница управления тегами
 * для блога была бы лишней — теги естественно рождаются из текста статьи.
 * upsert делает операцию повторяемой и защищает от гонки, когда два
 * сохранения приходят одновременно.
 */
async function resolveTags(names: string[]) {
  const uniqueSlugs = Array.from(
    new Set(names.map((name) => slugify(name)).filter((slug) => slug.length > 0)),
  );

  const tags = await Promise.all(
    uniqueSlugs.map((slug) => {
      const name = names.find((item) => slugify(item) === slug) ?? slug;

      return prisma.tag.upsert({
        where: { slug },
        update: {},
        create: { slug, name },
        select: { id: true },
      });
    }),
  );

  return tags.map((tag) => ({ id: tag.id }));
}

/**
 * Сброс кэша после изменения статьи.
 *
 * updateTag, а не revalidateTag: правка должна быть видна сразу после
 * сохранения, а revalidateTag лишь помечает данные устаревшими и обновляет
 * их в фоне. Подробнее — в комментарии к действиям с проектами.
 *
 * Помимо самих статей сбрасываем теги: список тегов с количеством статей
 * строится на этих же данных, и без второго вызова счётчики у тегов
 * остались бы прежними.
 */
function revalidatePostViews() {
  updateTag(CACHE_TAGS.posts);
  updateTag(CACHE_TAGS.tags);

  revalidatePath("/sitemap.xml");
  revalidatePath("/rss.xml");
}

export async function createPostAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertUser();

  const parsed = validatePostForm(formData);

  if (!parsed.success) {
    return validationError(parsed.error);
  }

  const data = parsed.data;

  const slugTaken = await prisma.post.findUnique({
    where: { slug: data.slug },
    select: { id: true },
  });

  if (slugTaken) {
    return {
      status: "error",
      message: "Статья с таким адресом уже существует",
      fieldErrors: { slug: ["Этот slug уже занят"] },
    };
  }

  const tags = await resolveTags(data.tags);

  await prisma.post.create({
    data: {
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt,
      content: data.content,
      coverImage: data.coverImage,
      published: data.published,
      // Время чтения считаем из текста, а не спрашиваем у автора:
      // это одна и та же величина, и считать её должен код.
      readingTime: estimateReadingTime(data.content),
      publishedAt: data.published ? new Date() : null,
      tags: { connect: tags },
    },
  });

  revalidatePostViews();
  redirect("/admin/posts");
}

export async function updatePostAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertUser();

  const id = String(formData.get("id") ?? "");

  if (!id) {
    return { status: "error", message: "Не передан идентификатор статьи" };
  }

  const parsed = validatePostForm(formData);

  if (!parsed.success) {
    return validationError(parsed.error);
  }

  const data = parsed.data;
  const current = await prisma.post.findUnique({ where: { id } });

  if (!current) {
    return { status: "error", message: "Статья не найдена" };
  }

  const slugTaken = await prisma.post.findFirst({
    where: { slug: data.slug, NOT: { id } },
    select: { id: true },
  });

  if (slugTaken) {
    return {
      status: "error",
      message: "Статья с таким адресом уже существует",
      fieldErrors: { slug: ["Этот slug уже занят"] },
    };
  }

  const tags = await resolveTags(data.tags);

  await prisma.post.update({
    where: { id },
    data: {
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt,
      content: data.content,
      coverImage: data.coverImage,
      published: data.published,
      readingTime: estimateReadingTime(data.content),
      publishedAt: data.published ? (current.publishedAt ?? new Date()) : null,
      // set заменяет весь набор связей, а не добавляет к нему.
      tags: { set: tags },
    },
  });

  revalidatePostViews();
  redirect("/admin/posts");
}

export async function deletePostAction(formData: FormData): Promise<void> {
  await assertUser();

  const id = String(formData.get("id") ?? "");

  if (!id) {
    return;
  }

  await prisma.post.delete({ where: { id } });

  revalidatePostViews();
}
