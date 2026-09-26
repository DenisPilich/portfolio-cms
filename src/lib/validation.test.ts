import { describe, expect, it } from "vitest";
import { z } from "zod";
import { loginSchema, contactSchema, projectSchema } from "@/lib/validation";

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

describe("contactSchema", () => {
  const validMessage = {
    name: "Иван",
    email: "ivan@example.com",
    message: "Здравствуйте! Хочу обсудить проект.",
    company: "",
  };

  it("принимает корректное сообщение", () => {
    expect(contactSchema.safeParse(validMessage).success).toBe(true);
  });

  it("требует осмысленную длину сообщения", () => {
    expect(
      contactSchema.safeParse({ ...validMessage, message: "привет" }).success,
    ).toBe(false);
  });

  it("требует корректный email", () => {
    expect(
      contactSchema.safeParse({ ...validMessage, email: "не-почта" }).success,
    ).toBe(false);
  });

  it("пропускает скрытое поле-ловушку", () => {
    // Поле необязательное: человек его не заполняет, поэтому в схеме
    // оно должно спокойно проходить проверку.
    const result = contactSchema.safeParse({
      ...validMessage,
      company: undefined,
    });
    expect(result.success).toBe(true);
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
