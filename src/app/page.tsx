import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { siteConfig } from "@/lib/site";

/**
 * Главная страница. Пока это серверный компонент без данных:
 * секции с избранными проектами и свежими заметками появятся здесь
 * после того, как подключим базу.
 */
export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-6">
      <section className="py-20 sm:py-28">
        <p className="font-mono text-sm text-primary">{siteConfig.role}</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          {siteConfig.name}
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-pretty text-muted-foreground">
          {siteConfig.tagline}
        </p>

        <div className="mt-9 flex flex-wrap gap-3">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Смотреть проекты
            <ArrowRight className="size-4" aria-hidden />
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center rounded-md border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
          >
            Связаться
          </Link>
        </div>
      </section>
    </div>
  );
}
