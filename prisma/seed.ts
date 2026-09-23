import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

/**
 * Наполнение базы демонстрационными данными.
 *
 * Скрипт идемпотентный: вместо create используется upsert, поэтому его можно
 * запускать повторно, и он не наплодит дубликатов. Это важно, потому что
 * `prisma migrate reset` вызывает seed автоматически после пересоздания схемы.
 *
 * Запуск: npm run db:seed
 */
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL ?? "",
});
const prisma = new PrismaClient({ adapter });

const ADMIN_EMAIL = "admin@example.com";
const ADMIN_PASSWORD = "admin12345";

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

async function main() {
  console.log("Наполняю базу демонстрационными данными...");

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {},
    create: {
      email: ADMIN_EMAIL,
      name: "Администратор",
      passwordHash,
      role: "ADMIN",
    },
  });

  const tagNames = [
    { name: "Next.js", slug: "nextjs" },
    { name: "TypeScript", slug: "typescript" },
    { name: "PostgreSQL", slug: "postgresql" },
    { name: "Prisma", slug: "prisma" },
    { name: "React", slug: "react" },
  ];

  const tags = await Promise.all(
    tagNames.map((tag) =>
      prisma.tag.upsert({
        where: { slug: tag.slug },
        update: {},
        create: tag,
      }),
    ),
  );

  const tagBySlug = new Map(tags.map((tag) => [tag.slug, tag]));

  const projects = [
    {
      slug: "portfolio-cms",
      title: "Портфолио с собственной CMS",
      summary:
        "Сайт, который вы сейчас читаете: публичная часть на серверных компонентах и закрытая админка с полным CRUD.",
      content: `## Задача

Сделать портфолио, которое не нужно пересобирать ради новой статьи,
и при этом не тащить готовую CMS.

## Решение

Публичные страницы рендерятся на сервере и читают данные напрямую из
PostgreSQL через Prisma. Контент редактируется в админке, доступ к ней
защищён сессией, а изменения применяются через Server Actions.

## Что внутри

- Серверные компоненты без промежуточного API
- Валидация входных данных схемами Zod
- Инвалидация кэша по тегу после каждой публикации`,
      techStack: ["Next.js", "TypeScript", "Prisma", "PostgreSQL"],
      featured: true,
      position: 1,
      repoUrl: "https://github.com/",
      liveUrl: "https://example.com",
    },
    {
      slug: "task-planner",
      title: "Планировщик задач",
      summary:
        "Канбан-доска с drag-and-drop, совместными проектами и историей изменений.",
      content: `## Задача

Разобраться с оптимистичными обновлениями интерфейса и совместной работой.

## Решение

Карточки перетаскиваются между колонками, интерфейс обновляется сразу,
а запрос уходит в фоне. При ошибке состояние откатывается.`,
      techStack: ["React", "TypeScript", "PostgreSQL"],
      featured: true,
      position: 2,
      repoUrl: "https://github.com/",
      liveUrl: null,
    },
    {
      slug: "expense-bot",
      title: "Telegram-бот для учёта расходов",
      summary:
        "Бот принимает траты текстом, раскладывает по категориям и строит отчёт за месяц.",
      content: `## Задача

Убрать трение: записывать расходы должно быть быстрее, чем открывать таблицу.

## Решение

Бот разбирает сообщение вида «кофе 300», сохраняет запись и по команде
отдаёт сводку по категориям за период.`,
      techStack: ["TypeScript", "PostgreSQL"],
      featured: false,
      position: 3,
      repoUrl: "https://github.com/",
      liveUrl: null,
    },
  ];

  for (const project of projects) {
    await prisma.project.upsert({
      where: { slug: project.slug },
      update: {},
      create: {
        ...project,
        published: true,
        publishedAt: daysAgo(project.position * 5),
        authorId: admin.id,
      },
    });
  }

  const posts = [
    {
      slug: "rsc-explained",
      title: "Как на самом деле работают серверные компоненты",
      excerpt:
        "Почему в Next.js больше не нужен useEffect для загрузки данных и где проходит граница между сервером и клиентом.",
      content: `## Компонент не всегда попадает в бандл

По умолчанию компонент в App Router выполняется на сервере.
В браузер уходит только разметка, а не код компонента.

## Где проходит граница

Директива "use client" не делает компонент клиентским целиком —
она помечает точку входа, за которой начинается клиентское дерево.`,
      tagSlugs: ["nextjs", "react"],
      views: 128,
      readingTime: 6,
    },
    {
      slug: "nextjs-cache",
      title: "Кэш в Next.js: что и когда сбрасывается",
      excerpt:
        "Разбираем revalidatePath, revalidateTag и то, почему после правки в админке страница может остаться старой.",
      content: `## Четыре разных кэша

В Next.js кэшируется не одно, а несколько слоёв: запросы, результаты рендера,
маршрутизатор на клиенте и полный ответ маршрута.

## Практический вывод

Если контент меняется из админки, недостаточно перезапросить данные —
нужно явно инвалидировать кэш по тегу.`,
      tagSlugs: ["nextjs", "typescript"],
      views: 94,
      readingTime: 8,
    },
    {
      slug: "prisma-7-adapter",
      title: "Зачем Prisma 7 понадобился драйвер-адаптер",
      excerpt:
        "Уход от Rust-движка, обязательный output у генератора и строка подключения в отдельном конфиге.",
      content: `## Что изменилось

Prisma 7 отказалась от Rust-движка запросов в пользу компилятора на TypeScript,
а соединение с базой отдала драйвер-адаптерам.

## Как это выглядит в коде

Клиент создаётся не сам по себе, а поверх адаптера, которому передаётся
строка подключения. Заодно это значит, что пул соединений настраивается
средствами самого драйвера.`,
      tagSlugs: ["prisma", "postgresql", "typescript"],
      views: 61,
      readingTime: 5,
    },
  ];

  for (const post of posts) {
    const { tagSlugs, ...data } = post;

    await prisma.post.upsert({
      where: { slug: post.slug },
      update: {},
      create: {
        ...data,
        published: true,
        publishedAt: daysAgo(post.readingTime),
        authorId: admin.id,
        tags: {
          connect: tagSlugs
            .map((slug) => tagBySlug.get(slug))
            .filter((tag) => tag !== undefined)
            .map((tag) => ({ id: tag.id })),
        },
      },
    });
  }

  /**
   * Навыки. Иконки заданы ключами Simple Icons — по ним на сайте
   * подставляется логотип технологии. Если ключ неизвестен, навык просто
   * выводится текстом, поэтому опечатка ничего не ломает.
   */
  /**
   * Явный тип нужен, чтобы строки «HARD» и «SOFT» сузились до литералов.
   * Без аннотации TypeScript выводит обычный string и не принимает его
   * вместо enum-поля.
   */
  type SeedSkill = {
    name: string;
    description?: string;
    icon?: string;
    category: "HARD" | "SOFT";
    position: number;
  };

  const skills: SeedSkill[] = [
    { name: "TypeScript", icon: "typescript", category: "HARD", position: 1 },
    { name: "React", icon: "react", category: "HARD", position: 2 },
    { name: "Next.js", icon: "nextdotjs", category: "HARD", position: 3 },
    { name: "Node.js", icon: "nodedotjs", category: "HARD", position: 4 },
    { name: "PostgreSQL", icon: "postgresql", category: "HARD", position: 5 },
    { name: "Prisma", icon: "prisma", category: "HARD", position: 6 },
    { name: "Tailwind CSS", icon: "tailwindcss", category: "HARD", position: 7 },
    { name: "Docker", icon: "docker", category: "HARD", position: 8 },
    { name: "Git", icon: "git", category: "HARD", position: 9 },
    // Логотипа Zustand в наборе Simple Icons нет, поэтому иконка не задана:
    // на сайте вместо неё покажется монограмма «Zu».
    { name: "Zustand", category: "HARD", position: 10 },
    { name: "Redux", icon: "redux", category: "HARD", position: 11 },
    { name: "Laravel", icon: "laravel", category: "HARD", position: 12 },
    { name: "Vite", icon: "vite", category: "HARD", position: 13 },
    {
      name: "Работа в команде",
      description:
        "Есть опыт общения с дизайнерами, менеджерами и другими разработчиками.",
      category: "SOFT",
      position: 1,
    },
    {
      name: "Ответственность за сроки",
      description: "Соблюдаю договорённости и предупреждаю о рисках заранее.",
      category: "SOFT",
      position: 2,
    },
    {
      name: "Внимание к деталям",
      description: "Читаю требования до конца и уточняю неясные места.",
      category: "SOFT",
      position: 3,
    },
    {
      name: "Требовательность к коду",
      description: "Слежу за единым стилем и читаемостью, пишу тесты.",
      category: "SOFT",
      position: 4,
    },
    {
      name: "Открытость к критике",
      description: "Спокойно воспринимаю замечания и делаю выводы.",
      category: "SOFT",
      position: 5,
    },
    {
      name: "Постоянное обучение",
      description: "Слежу за развитием стека и пробую новое на пет-проектах.",
      category: "SOFT",
      position: 6,
    },
  ];

  for (const skill of skills) {
    // Естественного уникального ключа у навыка нет, поэтому ищем по названию
    // и категории: так повторный запуск не наплодит дублей.
    const existing = await prisma.skill.findFirst({
      where: { name: skill.name, category: skill.category },
      select: { id: true },
    });

    if (existing) {
      await prisma.skill.update({ where: { id: existing.id }, data: skill });
    } else {
      await prisma.skill.create({ data: skill });
    }
  }

  const settings = [
    { key: "about", value: "Пишу веб-приложения на TypeScript и React." },
    { key: "github", value: "https://github.com/" },
    { key: "telegram", value: "https://t.me/" },
    { key: "email", value: "you@example.com" },
  ];

  for (const setting of settings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }

  console.log(
    `Готово: пользователь ${admin.email}, проектов ${projects.length}, статей ${posts.length}, навыков ${skills.length}.`,
  );
  console.log(`Логин в админку: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error("Не удалось наполнить базу:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
