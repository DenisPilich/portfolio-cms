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
 *
 * Тексты проектов и навыков на английском: сайт рассчитан на международный
 * рынок, и смесь языков в интерфейсе и данных выглядела бы небрежно.
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
  console.log("Seeding the database with demo content...");

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {},
    create: {
      email: ADMIN_EMAIL,
      name: "Administrator",
      passwordHash,
      role: "ADMIN",
    },
  });

  const projects = [
    {
      slug: "portfolio-cms",
      title: "Portfolio with a custom CMS",
      summary:
        "The site you are reading now: a public part built on server components and a private admin area with full CRUD.",
      content: `## The task

Build a portfolio that does not need a rebuild every time content changes,
without pulling in a ready-made CMS.

## The approach

Public pages render on the server and read from PostgreSQL through Prisma.
Content is edited in the admin area, access to it is protected by a session,
and changes are applied through Server Actions.

## What is inside

- Server components with no intermediate API layer
- Input validation with Zod schemas
- Cache invalidation by tag after every save`,
      techStack: ["Next.js", "TypeScript", "Prisma", "PostgreSQL"],
      featured: true,
      position: 1,
      repoUrl: "https://github.com/",
      liveUrl: "https://example.com",
    },
    {
      slug: "task-planner",
      title: "Task planner",
      summary:
        "A kanban board with drag and drop, shared projects and a change history.",
      content: `## The task

Get to grips with optimistic UI updates and collaborative editing.

## The approach

Cards move between columns, the interface updates immediately and the request
goes out in the background. If it fails, the state rolls back.`,
      techStack: ["React", "TypeScript", "PostgreSQL"],
      featured: true,
      position: 2,
      repoUrl: "https://github.com/",
      liveUrl: null,
    },
    {
      slug: "expense-bot",
      title: "Telegram bot for tracking expenses",
      summary:
        "The bot takes expenses as plain text, sorts them into categories and builds a monthly report.",
      content: `## The task

Remove the friction: logging an expense should be faster than opening a spreadsheet.

## The approach

The bot parses a message like "coffee 300", stores the entry and returns
a summary by category for the requested period.`,
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
      // Обновляем и существующие записи: иначе после смены языка
      // в базе остались бы старые тексты, и сайт выглядел бы наполовину
      // переведённым.
      update: {
        title: project.title,
        summary: project.summary,
        content: project.content,
        techStack: project.techStack,
        repoUrl: project.repoUrl,
        liveUrl: project.liveUrl,
        featured: project.featured,
        position: project.position,
      },
      create: {
        ...project,
        published: true,
        publishedAt: daysAgo(project.position * 5),
        authorId: admin.id,
      },
    });
  }

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
    level?: "LEARNING" | "BASIC" | "PRACTICAL" | "EXPERT";
    position: number;
  };

  /**
   * Уровни расставлены честно, а не «всё на максимум».
   *
   * Для начинающего специалиста длинный список технологий без градации
   * выглядит неубедительно: читающий понимает, что всё это на одном уровне
   * за короткий срок освоить нельзя. Указание уровня работает наоборот
   * в плюс — видно, что человек оценивает себя трезво.
   *
   * Логотипа Zustand в наборе Simple Icons нет, поэтому у него иконка
   * не задана: на сайте покажется монограмма «Zu».
   */
  const skills: SeedSkill[] = [
    { name: "TypeScript", icon: "typescript", category: "HARD", level: "EXPERT", position: 1 },
    { name: "React", icon: "react", category: "HARD", level: "EXPERT", position: 2 },
    { name: "Next.js", icon: "nextdotjs", category: "HARD", level: "PRACTICAL", position: 3 },
    { name: "Tailwind CSS", icon: "tailwindcss", category: "HARD", level: "PRACTICAL", position: 4 },
    { name: "Prisma", icon: "prisma", category: "HARD", level: "PRACTICAL", position: 5 },
    { name: "Git", icon: "git", category: "HARD", level: "PRACTICAL", position: 6 },
    { name: "Node.js", icon: "nodedotjs", category: "HARD", level: "BASIC", position: 7 },
    { name: "PostgreSQL", icon: "postgresql", category: "HARD", level: "BASIC", position: 8 },
    { name: "Redux", icon: "redux", category: "HARD", level: "BASIC", position: 9 },
    { name: "Zustand", category: "HARD", level: "BASIC", position: 10 },
    { name: "Vite", icon: "vite", category: "HARD", level: "BASIC", position: 11 },
    { name: "Docker", icon: "docker", category: "HARD", level: "LEARNING", position: 12 },
    { name: "Laravel", icon: "laravel", category: "HARD", level: "LEARNING", position: 13 },
    {
      name: "Teamwork",
      description:
        "Comfortable working alongside designers, managers and other developers.",
      category: "SOFT",
      position: 1,
    },
    {
      name: "Meeting deadlines",
      description: "I keep my commitments and flag risks early.",
      category: "SOFT",
      position: 2,
    },
    {
      name: "Attention to detail",
      description: "I read requirements to the end and ask about anything unclear.",
      category: "SOFT",
      position: 3,
    },
    {
      name: "Care about code quality",
      description: "I keep a consistent style, favour readability and write tests.",
      category: "SOFT",
      position: 4,
    },
    {
      name: "Open to feedback",
      description: "I take criticism calmly and act on it.",
      category: "SOFT",
      position: 5,
    },
    {
      name: "Continuous learning",
      description: "I follow the ecosystem and try new things on side projects.",
      category: "SOFT",
      position: 6,
    },
  ];

  // Навыки пересоздаём целиком: естественного уникального ключа у них нет,
  // поэтому после смены языка старые записи остались бы висеть рядом
  // с новыми и список разъехался бы на два языка.
  await prisma.skill.deleteMany();

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
    { key: "about", value: "I build web applications with TypeScript and React." },
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
    `Done: user ${admin.email}, projects ${projects.length}, skills ${skills.length}.`,
  );
  console.log(`Admin login: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
