import { describe, expect, it } from "vitest";
import { z } from "zod";
import { loginSchema, postSchema, projectSchema } from "@/lib/validation";

/**
 * Валидный набор полей проекта — от него отталкиваются проверки,
 * подменяя ровно одно поле, чтобы было видно, что именно сломало разбор.
 */
const validProject = {
  title: "Портфолио с CMS",
  slug: "portfolio-cms",
  summary: "Сайт с собственной админкой и базой данных.",
  content: "Достаточно длинное содержимое проекта для прохождения проверки.",
  techStack: "Next.js, Prisma",
  repoUrl: "",
  liveUrl: "",
  featured: "on",
  published: undefined,
  position: "3",
};

describe("projectSchema", () => {
  it("принимает корректные данные", () => {
    const result = projectSchema.safeParse(validProject);
    expect(result.success).toBe(true);
  });

  it("превращает строку технологий в массив и убирает лишние пробелы", () => {
    const result = projectSchema.parse(validProject);
    expect(result.techStack).toEqual(["Next.js", "Prisma"]);
  });

  it("приводит порядок к числу", () => {
    const result = projectSchema.parse(validProject);
    expect(result.position).toBe(3);
  });

  it("читает чекбокс: отмечен — true, отсутствует — false", () => {
    expect(projectSchema.parse(validProject).featured).toBe(true);
    expect(projectSchema.parse(validProject).published).toBe(false);
  });

  it("превращает пустые ссылки в null", () => {
    const result = projectSchema.parse(validProject);
    expect(result.repoUrl).toBeNull();
    expect(result.liveUrl).toBeNull();
  });

  it("принимает корректную ссылку", () => {
    const result = projectSchema.parse({
      ...validProject,
      repoUrl: "https://github.com/user/repo",
    });
    expect(result.repoUrl).toBe("https://github.com/user/repo");
  });

  it("отклоняет ссылку без протокола", () => {
    const result = projectSchema.safeParse({
      ...validProject,
      liveUrl: "example.com",
    });
    expect(result.success).toBe(false);
  });

  it("отклоняет slug с заглавными буквами и пробелами", () => {
    expect(
      projectSchema.safeParse({ ...validProject, slug: "Portfolio CMS" })
        .success,
    ).toBe(false);
  });

  it("отклоняет слишком короткое описание", () => {
    expect(
      projectSchema.safeParse({ ...validProject, summary: "мало" }).success,
    ).toBe(false);
  });

  it("отклоняет нечисловой порядок", () => {
    expect(
      projectSchema.safeParse({ ...validProject, position: "первый" }).success,
    ).toBe(false);
  });

  it("сообщает, какие именно поля не прошли проверку", () => {
    const result = projectSchema.safeParse({
      ...validProject,
      title: "ok",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      // z.flattenError раскладывает ошибки по именам полей — именно в таком
      // виде их получает форма и показывает рядом с конкретным полем.
      const flat = z.flattenError(result.error);
      expect(Object.keys(flat.fieldErrors)).toContain("title");
    }
  });
});

describe("postSchema", () => {
  const validPost = {
    title: "Как работает кэш",
    slug: "nextjs-cache",
    excerpt: "Разбираем слои кэширования в Next.js.",
    content: "Достаточно длинный текст статьи для прохождения проверки.",
    coverImage: "",
    tags: "Next.js, Prisma",
    published: "on",
  };

  it("принимает корректные данные", () => {
    expect(postSchema.safeParse(validPost).success).toBe(true);
  });

  it("разбирает теги и сохраняет исходное написание", () => {
    const result = postSchema.parse(validPost);
    // Регистр не приводится к нижнему: «Next.js» должно остаться читаемым
    // названием тега, а slug для него считается отдельно.
    expect(result.tags).toEqual(["Next.js", "Prisma"]);
  });

  it("пропускает пустой список тегов", () => {
    expect(postSchema.parse({ ...validPost, tags: "" }).tags).toEqual([]);
  });
});

describe("loginSchema", () => {
  it("требует корректный email", () => {
    expect(
      loginSchema.safeParse({ email: "не-почта", password: "12345678" }).success,
    ).toBe(false);
  });

  it("требует пароль не короче восьми символов", () => {
    expect(
      loginSchema.safeParse({ email: "a@b.ru", password: "кор" }).success,
    ).toBe(false);
  });

  it("принимает корректные данные", () => {
    expect(
      loginSchema.safeParse({ email: "a@b.ru", password: "admin12345" }).success,
    ).toBe(true);
  });
});
