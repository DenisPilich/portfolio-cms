import { describe, expect, it } from "vitest";
import {
  estimateReadingTime,
  formatDate,
  formatShortDate,
  toIsoDate,
} from "@/lib/format";

describe("formatDate", () => {
  it("форматирует дату по-русски", () => {
    // Месяцы нумеруются с нуля: 8 — это сентябрь.
    expect(formatDate(new Date(2026, 8, 13))).toBe("13 сентября 2026 г.");
  });

  it("принимает строку — так дата приходит из кэша после сериализации", () => {
    expect(formatDate(new Date(2026, 8, 13).toISOString())).toBe(
      "13 сентября 2026 г.",
    );
  });

  it("возвращает заглушку вместо падения на пустом значении", () => {
    expect(formatDate(null)).toBe("без даты");
    expect(formatDate(undefined)).toBe("без даты");
  });

  it("не падает на некорректной дате", () => {
    expect(formatDate("это не дата")).toBe("без даты");
  });
});

describe("formatShortDate", () => {
  it("выводит дату в коротком виде", () => {
    expect(formatShortDate(new Date(2026, 8, 13))).toBe("13.09.2026");
  });

  it("возвращает прочерк вместо пустого значения", () => {
    expect(formatShortDate(null)).toBe("—");
  });
});

describe("toIsoDate", () => {
  it("приводит значение к строке стандарта ISO", () => {
    const date = new Date(Date.UTC(2026, 8, 13, 12));
    expect(toIsoDate(date)).toBe("2026-09-13T12:00:00.000Z");
  });

  it("возвращает undefined, если даты нет или она некорректна", () => {
    expect(toIsoDate(null)).toBeUndefined();
    expect(toIsoDate("мусор")).toBeUndefined();
  });
});

describe("estimateReadingTime", () => {
  it("считает минимум одну минуту даже для короткого текста", () => {
    expect(estimateReadingTime("пара слов")).toBe(1);
  });

  it("округляет до целых минут", () => {
    // 360 слов при 180 словах в минуту — ровно две минуты.
    const text = Array.from({ length: 360 }, () => "слово").join(" ");
    expect(estimateReadingTime(text)).toBe(2);
  });
});
