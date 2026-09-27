import { z } from "zod";

/**
 * Схемы валидации.
 *
 * TypeScript защищает код от ошибок разработчика, но не от данных, пришедших
 * из формы: с точки зрения компилятора тело запроса — это строка, в которой
 * может лежать что угодно. Zod проверяет данные в рантайме и заодно выводит
 * из схемы тип, поэтому описание проверки и тип — один источник правды.
 *
 * Тексты сообщений на английском: их видит посетитель рядом с полем формы.
 */

export const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(8, "The password must be at least 8 characters"),
});

/**
 * Slug формируется из заголовка, но его можно поправить руками.
 * Разрешены только строчные латинские буквы, цифры и дефис — такой slug
 * безопасно вставлять в адрес страницы.
 */
const slugSchema = z
  .string()
  .trim()
  .min(3, "At least 3 characters")
  .max(80, "At most 80 characters")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Use lowercase Latin letters, digits and hyphens only",
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
    "Enter a full address, for example https://example.com",
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
  title: z
    .string()
    .trim()
    .min(3, "At least 3 characters")
    .max(120, "At most 120 characters"),
  slug: slugSchema,
  summary: z
    .string()
    .trim()
    .min(10, "Describe the project briefly — at least 10 characters")
    .max(300, "At most 300 characters"),
  content: z.string().trim().min(20, "The content must be at least 20 characters"),
  /** Ссылка на обложку. Загружается в хранилище или вставляется вручную. */
  coverImage: optionalUrlSchema,
  techStack: techStackSchema,
  repoUrl: optionalUrlSchema,
  liveUrl: optionalUrlSchema,
  featured: checkboxSchema,
  published: checkboxSchema,
  position: z.coerce
    .number()
    .int("Whole numbers only")
    .min(0, "Cannot be negative")
    .max(999, "At most 999"),
});

/** Категория навыка. Значения совпадают с enum в схеме базы. */
const skillCategorySchema = z.enum(["HARD", "SOFT"], {
  message: "Choose a category",
});

/**
 * Уровень владения. Показывается только у hard-навыков: у soft-качеств
 * градация «знаю основы» звучала бы странно.
 */
const skillLevelSchema = z.enum(
  ["LEARNING", "BASIC", "PRACTICAL", "EXPERT"],
  { message: "Choose a level" },
);

/** Пустая строка превращается в null: в базе поле необязательное. */
const optionalTextSchema = z
  .string()
  .trim()
  .max(300, "At most 300 characters")
  .transform((value) => (value === "" ? null : value));

export const skillSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "At least 2 characters")
    .max(60, "At most 60 characters"),
  description: optionalTextSchema,
  category: skillCategorySchema,
  level: skillLevelSchema,
  /**
   * Ключ иконки из набора Simple Icons: «react», «nextdotjs».
   * Свободный текст, а не список значений: набор пополняется, и жёсткий
   * перечень пришлось бы править при каждой новой технологии.
   */
  icon: z
    .string()
    .trim()
    .max(60, "At most 60 characters")
    .transform((value) => (value === "" ? null : value)),
  position: z.coerce
    .number()
    .int("Whole numbers only")
    .min(0, "Cannot be negative")
    .max(999, "At most 999"),
});

/**
 * Сообщение из формы обратной связи.
 *
 * Поле company — ловушка для автоматических сборщиков: человек его не видит
 * и не заполняет, а бот заполняет все поля подряд. Если оно не пустое,
 * сообщение отбрасывается, а отправителю всё равно показывается успех:
 * иначе бот поймёт, что его раскусили, и попробует иначе.
 */
export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "What should I call you?")
    .max(80, "At most 80 characters"),
  email: z.email("Enter a valid email address"),
  message: z
    .string()
    .trim()
    .min(10, "The message must be at least 10 characters")
    .max(2000, "At most 2000 characters"),
  company: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type SkillInput = z.infer<typeof skillSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
