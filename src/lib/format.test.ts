import { describe, expect, it } from "vitest";
import { formatDate, formatShortDate, toIsoDate } from "@/lib/format";

describe("formatDate", () => {
  it("форматирует дату в английском формате", () => {
    // Месяцы нумеруются с нуля: 8 — это сентябрь.
    expect(formatDate(new Date(2026, 8, 13))).toBe("September 13, 2026");
  });

  it("принимает строку — так дата приходит из кэша после сериализации", () => {
    expect(formatDate(new Date(2026, 8, 13).toISOString())).toBe(
      "September 13, 2026",
    );
  });

  it("возвращает заглушку вместо падения на пустом значении", () => {
    expect(formatDate(null)).toBe("no date");
    expect(formatDate(undefined)).toBe("no date");
  });

  it("не падает на некорректной дате", () => {
    expect(formatDate("это не дата")).toBe("no date");
  });
});

describe("formatShortDate", () => {
  it("выводит дату в коротком виде", () => {
    expect(formatShortDate(new Date(2026, 8, 13))).toBe("09/13/2026");
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
