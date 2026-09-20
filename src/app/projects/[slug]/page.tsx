import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Code2, ExternalLink } from "lucide-react";
import { Markdown } from "@/components/markdown";
import { formatDate, toIsoDate } from "@/lib/format";
import { getProjectBySlug, getPublishedProjects } from "@/lib/queries";

/**
 * Список slug'ов, которые Next.js отрендерит заранее, на этапе сборки.
 * Остальные слаги (например, добавленные позже через админку) будут
 * отрендерены по запросу — это поведение задаёт dynamicParams по умолчанию.
 */
export async function generateStaticParams() {
  const projects = await getPublishedProjects();
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    return { title: "Проект не найден" };
  }

  return {
    title: project.title,
    description: project.summary,
  };
}

export default async function ProjectPage({
  params,
}: PageProps<"/projects/[slug]">) {
  const { slug } = await params;

  // Тот же запрос уже выполнялся в generateMetadata, но повторного обращения
  // к базе не будет: функция обёрнута в cache() из React и в пределах одного
  // запроса пользователя возвращает готовый результат.
  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  return (
    <article className="mx-auto w-full max-w-3xl px-6 py-16">
      <Link
        href="/projects"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Все проекты
      </Link>

      <header className="mt-8">
        <h1 className="text-3xl font-semibold tracking-tight text-balance">
          {project.title}
        </h1>
        <p className="mt-4 text-lg text-pretty text-muted-foreground">
          {project.summary}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
          <time dateTime={toIsoDate(project.publishedAt)}>
            {formatDate(project.publishedAt)}
          </time>

          {project.repoUrl && (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
            >
              <Code2 className="size-4" aria-hidden />
              Исходный код
            </a>
          )}

          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
            >
              <ExternalLink className="size-4" aria-hidden />
              Открыть сайт
            </a>
          )}
        </div>

        {project.techStack.length > 0 && (
          <ul className="mt-6 flex flex-wrap gap-2">
            {project.techStack.map((tech) => (
              <li
                key={tech}
                className="rounded-full border border-border px-3 py-1 font-mono text-xs text-muted-foreground"
              >
                {tech}
              </li>
            ))}
          </ul>
        )}
      </header>

      <div className="mt-10">
        <Markdown>{project.content}</Markdown>
      </div>
    </article>
  );
}
