import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Пагинация строится на обычных ссылках, а не на кнопках с JavaScript.
 * Так страницу можно открыть с нужной страницей списка по прямой ссылке,
 * а поисковик обходит весь архив.
 */
function buildHref(basePath: string, page: number, tagSlug?: string): string {
  const params = new URLSearchParams();

  if (tagSlug) {
    params.set("tag", tagSlug);
  }
  if (page > 1) {
    params.set("page", String(page));
  }

  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export function Pagination({
  page,
  totalPages,
  basePath,
  tagSlug,
}: {
  page: number;
  totalPages: number;
  basePath: string;
  tagSlug?: string;
}) {
  if (totalPages <= 1) {
    return null;
  }

  const hasPrevious = page > 1;
  const hasNext = page < totalPages;

  return (
    <nav
      aria-label="Постраничная навигация"
      className="mt-10 flex items-center justify-between border-t border-border pt-6"
    >
      {hasPrevious ? (
        <Link
          href={buildHref(basePath, page - 1, tagSlug)}
          rel="prev"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="size-4" aria-hidden />
          Назад
        </Link>
      ) : (
        <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground/40">
          <ChevronLeft className="size-4" aria-hidden />
          Назад
        </span>
      )}

      <span className="font-mono text-sm text-muted-foreground">
        {page} / {totalPages}
      </span>

      {hasNext ? (
        <Link
          href={buildHref(basePath, page + 1, tagSlug)}
          rel="next"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Вперёд
          <ChevronRight className="size-4" aria-hidden />
        </Link>
      ) : (
        <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground/40">
          Вперёд
          <ChevronRight className="size-4" aria-hidden />
        </span>
      )}
    </nav>
  );
}
