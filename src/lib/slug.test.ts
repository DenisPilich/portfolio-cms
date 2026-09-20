import { describe, expect, it } from "vitest";
import { slugify } from "@/lib/slug";

describe("slugify", () => {
  it("убирает точку, а не заменяет её дефисом", () => {
    // Именно из-за этого правила «Next.js» даёт «nextjs», а не «next-js»,
    // и тег не расходится с уже существующим в базе.
    expect(slugify("Next.js")).toBe("nextjs");
  });

  it("транслитерирует кириллицу", () => {
    expect(slugify("Как работает кэш")).toBe("kak-rabotaet-kesh");
  });

  it("обрабатывает буквы, которых нет в латинице один в один", () => {
    expect(slugify("Ёж")).toBe("ezh");
    expect(slugify("Щука")).toBe("schuka");
    expect(slugify("Яблоко")).toBe("yabloko");
  });

  it("схлопывает повторяющиеся разделители", () => {
    expect(slugify("Много    пробелов")).toBe("mnogo-probelov");
    expect(slugify("тире --- подряд")).toBe("tire-podryad");
  });

  it("не оставляет дефисов по краям", () => {
    expect(slugify("  привет  ")).toBe("privet");
    expect(slugify("!!!важно!!!")).toBe("vazhno");
  });

  it("сохраняет цифры", () => {
    expect(slugify("Проект 2026")).toBe("proekt-2026");
  });

  it("возвращает пустую строку, если не осталось допустимых символов", () => {
    expect(slugify("!!! ???")).toBe("");
    expect(slugify("")).toBe("");
  });

  it("ограничивает длину восемьюдесятью символами", () => {
    expect(slugify("a".repeat(200)).length).toBe(80);
  });
});
