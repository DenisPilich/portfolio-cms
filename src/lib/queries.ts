import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

/**
 * Слой доступа к данным.
 *
 * Все страницы обращаются к базе только через эти функции. Так запросы
 * не расползаются по компонентам, а условие «только опубликованное»
 * задано в одном месте и не забывается на новой странице.
 *
 * Про кэш. Публичные страницы собираются статически, поэтому без управления
 * кэшем правка в админке не была бы видна посетителям. Функции обёрнуты
 * в unstable_cache и помечены тегами: когда администратор сохраняет проект,
 * Server Action вызывает revalidateTag("projects"), и Next.js сбрасывает
 * ровно те страницы, которые использовали эти данные, а не весь сайт.
 *
 * Теги собраны в один объект, чтобы имя не разошлось между запросом
 * и инвалидацией: опечатка в строковом литерале ломала бы кэш молча.
 */
export const CACHE_TAGS = {
  projects: "projects",
  posts: "posts",
  tags: "tags",
  settings: "settings",
  skills: "skills",
} as const;

const CACHE_SECONDS = 3600;

export const POSTS_PER_PAGE = 6;

export const getFeaturedProjects = unstable_cache(
  async (limit = 3) =>
    prisma.project.findMany({
      where: { published: true, featured: true },
      orderBy: { position: "asc" },
      take: limit,
    }),
  ["featured-projects"],
  { tags: [CACHE_TAGS.projects], revalidate: CACHE_SECONDS },
);

export const getPublishedProjects = unstable_cache(
  async () =>
    prisma.project.findMany({
      where: { published: true },
      orderBy: [{ position: "asc" }, { createdAt: "desc" }],
    }),
  ["published-projects"],
  { tags: [CACHE_TAGS.projects], revalidate: CACHE_SECONDS },
);

export const getProjectBySlug = unstable_cache(
  // Наружу отдаём только опубликованное: черновик не должен открываться
  // по прямой ссылке.
  async (slug: string) =>
    prisma.project.findFirst({
      where: { slug, published: true },
    }),
  ["project-by-slug"],
  { tags: [CACHE_TAGS.projects], revalidate: CACHE_SECONDS },
);

export const getRecentPosts = unstable_cache(
  async (limit = 3) =>
    prisma.post.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
      take: limit,
      include: { tags: true },
    }),
  ["recent-posts"],
  { tags: [CACHE_TAGS.posts], revalidate: CACHE_SECONDS },
);

export const getPostBySlug = unstable_cache(
  async (slug: string) =>
    prisma.post.findFirst({
      where: { slug, published: true },
      include: { tags: true },
    }),
  ["post-by-slug"],
  { tags: [CACHE_TAGS.posts], revalidate: CACHE_SECONDS },
);

export const getTagsWithCounts = unstable_cache(
  async () =>
    prisma.tag.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          // Считаем только опубликованные статьи, иначе тег показывал бы
          // число, которого пользователь не увидит.
          select: { posts: { where: { published: true } } },
        },
      },
    }),
  ["tags-with-counts"],
  { tags: [CACHE_TAGS.tags, CACHE_TAGS.posts], revalidate: CACHE_SECONDS },
);

/**
 * Страница списка статей с фильтром по тегу.
 *
 * Запросы выборки и подсчёта объединены в $transaction: они логически
 * связаны, и выполнить их одним обращением дешевле, чем двумя.
 */
export const getPostsPage = unstable_cache(
  async (options: { page?: number; tagSlug?: string }) => {
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
  },
  ["posts-page"],
  { tags: [CACHE_TAGS.posts, CACHE_TAGS.tags], revalidate: CACHE_SECONDS },
);

export const getSiteSettings = unstable_cache(
  async () => {
    const settings = await prisma.siteSetting.findMany();

    // Возвращаем обычный объект, а не Map: unstable_cache хранит результат
    // в сериализованном виде, и Map при чтении из кэша превратился бы
    // в пустой объект без метода get. По той же причине здесь не стоит
    // рассчитывать на сохранение типов Date.
    return Object.fromEntries(
      settings.map((setting) => [setting.key, setting.value]),
    ) as Record<string, string>;
  },
  ["site-settings"],
  { tags: [CACHE_TAGS.settings], revalidate: CACHE_SECONDS },
);

/** Минимальная длина запроса: по одному символу искать бессмысленно. */
export const MIN_SEARCH_LENGTH = 2;

/**
 * Навыки для раздела «Что я умею».
 *
 * Сортируем по категории, затем по ручному порядку: администратор задаёт
 * последовательность сам, а алфавит работает только как запасной вариант.
 */
export const getSkills = unstable_cache(
  async () =>
    prisma.skill.findMany({
      orderBy: [{ category: "asc" }, { position: "asc" }, { name: "asc" }],
    }),
  ["skills"],
  { tags: [CACHE_TAGS.skills], revalidate: CACHE_SECONDS },
);

/**
 * Поиск по проектам и статьям.
 *
 * Функция намеренно НЕ обёрнута в unstable_cache: количество возможных
 * запросов неограниченно, и кэш превратился бы в свалку одноразовых
 * записей. Страница поиска и так динамическая, потому что зависит
 * от параметра в адресе.
 *
 * Сравнение регистронезависимое (mode: "insensitive" превращается
 * в ILIKE). Для портфолио этого достаточно; на большом объёме текста
 * следующим шагом был бы полнотекстовый поиск средствами PostgreSQL.
 */
export async function searchContent(rawQuery: string) {
  const query = rawQuery.trim();

  if (query.length < MIN_SEARCH_LENGTH) {
    return { query, projects: [], posts: [] };
  }

  const [projects, posts] = await Promise.all([
    prisma.project.findMany({
      where: {
        published: true,
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { summary: { contains: query, mode: "insensitive" } },
          { content: { contains: query, mode: "insensitive" } },
        ],
      },
      orderBy: [{ position: "asc" }],
      take: 10,
    }),
    prisma.post.findMany({
      where: {
        published: true,
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { excerpt: { contains: query, mode: "insensitive" } },
          { content: { contains: query, mode: "insensitive" } },
        ],
      },
      orderBy: { publishedAt: "desc" },
      take: 10,
      include: { tags: true },
    }),
  ]);

  return { query, projects, posts };
}
