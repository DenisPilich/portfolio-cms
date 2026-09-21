import Link from "next/link";
import { Code2, ExternalLink } from "lucide-react";
import { formatMonthYear } from "@/lib/format";
import { TechIcon } from "@/components/tech-icon";
import { ProjectImage } from "@/components/project-image";
import type { Project } from "@/generated/prisma/client";

/**
 * Карточка проекта для раздела «Портфолио».
 *
 * Слева снимок проекта, справа — дата, название, описание и стек.
 * Логотипы технологий выводятся иконками с подсказкой при наведении:
 * так список из десятка технологий остаётся компактным.
 */
export function ProjectShowcase({ project }: { project: Project }) {
  return (
    <article className="grid gap-6 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/60 sm:grid-cols-[220px_1fr] sm:p-6">
      <ProjectImage src={project.coverImage} alt={project.title} />

      <div className="flex flex-col">
        <time
          dateTime={project.publishedAt?.toISOString?.() ?? undefined}
          className="font-mono text-xs text-muted-foreground"
        >
          {formatMonthYear(project.publishedAt)}
        </time>

        <h3 className="mt-2 text-lg font-semibold tracking-tight">
          <Link
            href={`/projects/${project.slug}`}
            className="transition-colors hover:text-primary"
          >
            {project.title}
          </Link>
        </h3>

        <p className="mt-3 flex-1 text-sm text-pretty text-muted-foreground">
          {project.summary}
        </p>

        {project.techStack.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2">
            {project.techStack.map((tech) => (
              <li
                key={tech}
                title={tech}
                className="flex size-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground"
              >
                <TechIcon name={tech} className="size-4" />
                <span className="sr-only">{tech}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
          <Link
            href={`/projects/${project.slug}`}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Подробнее →
          </Link>

          {project.repoUrl && (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
            >
              <Code2 className="size-4" aria-hidden />
              Код
            </a>
          )}

          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
            >
              <ExternalLink className="size-4" aria-hidden />
              Демо
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
