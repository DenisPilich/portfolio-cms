import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/**
 * Страница 404.
 *
 * Next.js показывает её автоматически для несуществующих адресов
 * и при вызове notFound() из компонента.
 */
export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-start px-6 py-24">
      <p className="font-mono text-sm text-primary">404</p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">
        Страница не найдена
      </h1>
      <p className="mt-4 max-w-xl text-pretty text-muted-foreground">
        Возможно, адрес изменился или запись снята с публикации. Попробуйте
        начать с главной или посмотреть список проектов.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          <ArrowLeft className="size-4" aria-hidden />
          На главную
        </Link>
        <Link
          href="/projects"
          className="inline-flex items-center rounded-md border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
        >
          Проекты
        </Link>
      </div>
    </div>
  );
}
