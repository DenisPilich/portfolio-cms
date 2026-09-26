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
    level?: "LEARNING" | "BASIC" | "CONFIDENT";
    position: number;
  };

  /**
   * Уровни расставлены честно, а не «всё уверенно».
   *
   * Для начинающего специалиста длинный список технологий без градации
   * выглядит неубедительно: читающий понимает, что всё это на одном уровне
   * за короткий срок освоить нельзя. Указание уровня работает наоборот
   * в плюс — видно, что человек оценивает себя трезво. Логотипа Zustand
   * в наборе Simple Icons нет, поэтому у него иконка не задана: на сайте
   * покажется монограмма «Zu».
   */
  const skills: SeedSkill[] = [
    { name: "TypeScript", icon: "typescript", category: "HARD", level: "CONFIDENT", position: 1 },
    { name: "React", icon: "react", category: "HARD", level: "CONFIDENT", position: 2 },
    { name: "Next.js", icon: "nextdotjs", category: "HARD", level: "CONFIDENT", position: 3 },
    { name: "Tailwind CSS", icon: "tailwindcss", category: "HARD", level: "CONFIDENT", position: 4 },
    { name: "Prisma", icon: "prisma", category: "HARD", level: "CONFIDENT", position: 5 },
    { name: "Git", icon: "git", category: "HARD", level: "CONFIDENT", position: 6 },
    { name: "Node.js", icon: "nodedotjs", category: "HARD", level: "BASIC", position: 7 },
    { name: "PostgreSQL", icon: "postgresql", category: "HARD", level: "BASIC", position: 8 },
    { name: "Redux", icon: "redux", category: "HARD", level: "BASIC", position: 9 },
    { name: "Zustand", category: "HARD", level: "BASIC", position: 10 },
    { name: "Vite", icon: "vite", category: "HARD", level: "BASIC", position: 11 },
    { name: "Docker", icon: "docker", category: "HARD", level: "LEARNING", position: 12 },
    { name: "Laravel", icon: "laravel", category: "HARD", level: "LEARNING", position: 13 },
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
    `Готово: пользователь ${admin.email}, проектов ${projects.length}, навыков ${skills.length}.`,
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
