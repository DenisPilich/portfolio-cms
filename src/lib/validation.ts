import { z } from "zod";

/**
 * Схемы валидации.
 *
 * TypeScript защищает код от ошибок разработчика, но не от данных, пришедших
 * из формы: с точки зрения компилятора тело запроса — это строка, в которой
 * может лежать что угодно. Zod проверяет данные в рантайме и заодно выводит
 * из схемы тип, поэтому описание проверки и тип — один источник правды.
 */

export const loginSchema = z.object({
  email: z.email("Введите корректный email"),
  password: z.string().min(8, "Пароль не короче 8 символов"),
});

/**
 * Slug формируется из заголовка, но его можно поправить руками.
 * Разрешены только строчные латинские буквы, цифры и дефис — такой slug
 * безопасно вставлять в адрес страницы.
 */
const slugSchema = z
  .string()
  .trim()
  .min(3, "Минимум 3 символа")
  .max(80, "Максимум 80 символов")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Только строчные латинские буквы, цифры и дефис",
  );

/**
 * Пустая строка или корректный URL.
 * Поле необязательное, но если его заполнили — значение должно быть ссылкой.
 */
const optionalUrlSchema = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || z.url().safeParse(value).success,
    "Укажите полный адрес, например https://example.com",
  )
  .transform((value) => (value === "" ? null : value));

/** Строка «Next.js, Prisma» превращается в массив технологий. */
const techStackSchema = z
  .string()
  .trim()
  .transform((value) =>
    value
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0),
  );

/** Чекбокс: отмечен — приходит "on", не отмечен — поля нет вовсе. */
const checkboxSchema = z
  .union([z.literal("on"), z.literal("true"), z.undefined(), z.null()])
  .transform((value) => value === "on" || value === "true");

export const projectSchema = z.object({
  title: z.string().trim().min(3, "Минимум 3 символа").max(120),
  slug: slugSchema,
  summary: z
    .string()
    .trim()
    .min(10, "Коротко опишите проект — хотя бы 10 символов")
    .max(300, "Не больше 300 символов"),
  content: z.string().trim().min(20, "Содержимое не короче 20 символов"),
  techStack: techStackSchema,
  repoUrl: optionalUrlSchema,
  liveUrl: optionalUrlSchema,
  featured: checkboxSchema,
  published: checkboxSchema,
  position: z.coerce
    .number()
    .int("Целое число")
    .min(0, "Не может быть отрицательным")
    .max(999),
});

export const postSchema = z.object({
  title: z.string().trim().min(3, "Минимум 3 символа").max(160),
  slug: slugSchema,
  excerpt: z
    .string()
    .trim()
    .min(10, "Краткое описание — хотя бы 10 символов")
    .max(400, "Не больше 400 символов"),
  content: z.string().trim().min(20, "Содержимое не короче 20 символов"),
  coverImage: optionalUrlSchema,
  /** Теги приходят строкой через запятую: «Next.js, Prisma». */
  tags: z
    .string()
    .trim()
    .transform((value) =>
      value
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item.length > 0),
    ),
  published: checkboxSchema,
});

/** Категория навыка. Значения совпадают с enum в схеме базы. */
const skillCategorySchema = z.enum(["HARD", "SOFT"], {
  message: "Выберите категорию",
});

/** Пустая строка превращается в null: в базе поле необязательное. */
const optionalTextSchema = z
  .string()
  .trim()
  .max(300, "Не больше 300 символов")
  .transform((value) => (value === "" ? null : value));

export const skillSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Минимум 2 символа")
    .max(60, "Не больше 60 символов"),
  description: optionalTextSchema,
  category: skillCategorySchema,
  /**
   * Ключ иконки из набора Simple Icons: «react», «nextdotjs».
   * Свободный текст, а не список значений: набор пополняется, и жёсткий
   * перечень пришлось бы править при каждой новой технологии.
   */
  icon: z
    .string()
    .trim()
    .max(60, "Не больше 60 символов")
    .transform((value) => (value === "" ? null : value)),
  position: z.coerce
    .number()
    .int("Целое число")
    .min(0, "Не может быть отрицательным")
    .max(999),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type PostInput = z.infer<typeof postSchema>;
export type SkillInput = z.infer<typeof skillSchema>;
