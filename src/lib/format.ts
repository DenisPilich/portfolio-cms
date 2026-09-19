/**
 * Форматирование дат.
 *
 * Intl.DateTimeFormat — тяжёлый объект: его создание заметно дороже самого
 * форматирования. Поэтому форматтеры создаются один раз на уровне модуля,
 * а не внутри функции, которая вызывается для каждой карточки в списке.
 */
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

export function formatDate(date: Date | null | undefined): string {
  if (!date) {
    return "без даты";
  }
  return dateFormatter.format(date);
}

export function formatShortDate(date: Date | null | undefined): string {
  if (!date) {
    return "—";
  }
  return shortDateFormatter.format(date);
}

/**
 * Грубая оценка времени чтения: 180 слов в минуту — средний темп
 * для технических текстов на русском.
 */
export function estimateReadingTime(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 180));
}
