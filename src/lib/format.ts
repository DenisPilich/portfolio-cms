/**
 * Форматирование дат.
 *
 * Intl.DateTimeFormat — тяжёлый объект: его создание заметно дороже самого
 * форматирования. Поэтому форматтеры создаются один раз на уровне модуля,
 * а не внутри функции, которая вызывается для каждой карточки в списке.
 *
 * Функции принимают и Date, и строку. Это не перестраховка: данные приходят
 * из unstable_cache, а кэш сохраняет значения в сериализованном виде, поэтому
 * после чтения с диска дата может оказаться строкой. Без нормализации
 * Intl бросил бы RangeError «Invalid time value».
 */
type DateLike = Date | string | null | undefined;

const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const shortDateFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

function toDate(value: DateLike): Date | null {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value: DateLike): string {
  const date = toDate(value);

  return date ? dateFormatter.format(date) : "без даты";
}

export function formatShortDate(value: DateLike): string {
  const date = toDate(value);

  return date ? shortDateFormatter.format(date) : "—";
}

/**
 * Приводит дату к строке для атрибута datetime и структурированных данных.
 * Возвращает undefined, если даты нет: это лучше, чем «Invalid Date» в разметке.
 */
export function toIsoDate(value: DateLike): string | undefined {
  return toDate(value)?.toISOString();
}

/**
 * Грубая оценка времени чтения: 180 слов в минуту — средний темп
 * для технических текстов на русском.
 */
export function estimateReadingTime(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 180));
}
