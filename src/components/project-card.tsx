import Link from "next/link";
import { Code2, ExternalLink } from "lucide-react";
import type { Project } from "@/generated/prisma/client";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="flex flex-col rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary/60">
      <h3 className="text-lg font-semibold tracking-tight">
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
              className="rounded-full border border-border px-2.5 py-1 font-mono text-xs text-muted-foreground"
            >
              {tech}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-5 flex items-center gap-4 text-sm">
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
    </article>
  );
}
