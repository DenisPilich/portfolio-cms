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
 * Server Action вызывает updateTag("projects"), и Next.js сбрасывает ровно
 * те страницы, которые использовали эти данные, а не весь сайт.
 *
 * Теги собраны в один объект, чтобы имя не разошлось между запросом
 * и инвалидацией: опечатка в строковом литерале ломала бы кэш молча.
 */
export const CACHE_TAGS = {
  projects: "projects",
  settings: "settings",
  skills: "skills",
} as const;

const CACHE_SECONDS = 3600;

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
 * Поиск по проектам.
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
export async function searchProjects(rawQuery: string) {
  const query = rawQuery.trim();

  if (query.length < MIN_SEARCH_LENGTH) {
    return { query, projects: [] };
  }

  const projects = await prisma.project.findMany({
    where: {
      published: true,
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { summary: { contains: query, mode: "insensitive" } },
        { content: { contains: query, mode: "insensitive" } },
        { techStack: { has: query } },
      ],
    },
    orderBy: [{ position: "asc" }],
    take: 20,
  });

  return { query, projects };
}
