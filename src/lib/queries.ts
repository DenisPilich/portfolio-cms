import { cache } from "react";
import { prisma } from "@/lib/prisma";

/**
 * Слой доступа к данным.
 *
 * Все страницы обращаются к базе только через эти функции. Так запросы
 * не расползаются по компонентам, а условия вида «только опубликованное»
 * заданы в одном месте и не забываются на новой странице.
 *
 * Обёртка cache() из React запоминает результат на время одного рендера:
 * если два разных компонента запросят одни и те же данные, запрос к базе
 * уйдёт один раз. Это не кэш между запросами пользователей — только
 * дедупликация внутри одного прохода отрисовки.
 */

export const POSTS_PER_PAGE = 6;

export const getFeaturedProjects = cache(async (limit = 3) => {
  return prisma.project.findMany({
    where: { published: true, featured: true },
    orderBy: { position: "asc" },
    take: limit,
  });
});

export const getPublishedProjects = cache(async () => {
  return prisma.project.findMany({
    where: { published: true },
    orderBy: [{ position: "asc" }, { createdAt: "desc" }],
  });
});

export const getProjectBySlug = cache(async (slug: string) => {
  // Наружу отдаём только опубликованное: черновик не должен открываться
  // по прямой ссылке.
  return prisma.project.findFirst({
    where: { slug, published: true },
  });
});

export const getRecentPosts = cache(async (limit = 3) => {
  return prisma.post.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
    take: limit,
    include: { tags: true },
  });
});

export const getPostBySlug = cache(async (slug: string) => {
  return prisma.post.findFirst({
    where: { slug, published: true },
    include: { tags: true },
  });
});

export const getTagsWithCounts = cache(async () => {
  return prisma.tag.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        // Считаем только опубликованные статьи, иначе тег показывает
        // число, которого пользователь не увидит.
        select: { posts: { where: { published: true } } },
      },
    },
  });
});

/**
 * Страница списка статей с фильтром по тегу.
 *
 * Запросы выборки и подсчёта объединены в $transaction: они логически
 * связаны, и выполнять их одним обращением к базе дешевле, чем двумя.
 */
export async function getPostsPage(options: {
  page?: number;
  tagSlug?: string;
}) {
  const page = Math.max(1, options.page ?? 1);
  const tagSlug = options.tagSlug;

  const where = {
    published: true,
    ...(tagSlug ? { tags: { some: { slug: tagSlug } } } : {}),
  };

  const [posts, total] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * POSTS_PER_PAGE,
      take: POSTS_PER_PAGE,
      include: { tags: true },
    }),
    prisma.post.count({ where }),
  ]);

  return {
    posts,
    total,
    totalPages: Math.max(1, Math.ceil(total / POSTS_PER_PAGE)),
    page,
  };
}

export const getSiteSettings = cache(async () => {
  const settings = await prisma.siteSetting.findMany();
  return new Map(settings.map((setting) => [setting.key, setting.value]));
});
