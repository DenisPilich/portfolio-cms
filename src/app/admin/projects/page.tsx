import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { deleteProjectAction } from "@/actions/projects";
import { prisma } from "@/lib/prisma";
import { formatShortDate } from "@/lib/format";
import { DeleteButton } from "@/components/admin/delete-button";

export const metadata: Metadata = {
  title: "Проекты",
  robots: { index: false, follow: false },
};

export default async function AdminProjectsPage() {
  // Здесь, в отличие от публичной части, показываем и черновики.
  const projects = await prisma.project.findMany({
    orderBy: [{ position: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Проекты</h1>
        <Link
          href="/admin/projects/new"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Plus className="size-4" aria-hidden />
          Добавить
        </Link>
      </div>

      {projects.length === 0 ? (
        <p className="mt-8 rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          Проектов пока нет. Добавьте первый.
        </p>
      ) : (
        <ul className="mt-8 divide-y divide-border rounded-lg border border-border">
          {projects.map((project) => (
            <li
              key={project.id}
              className="flex flex-wrap items-center justify-between gap-4 p-4"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/projects/${project.id}/edit`}
                    className="truncate font-medium transition-colors hover:text-primary"
                  >
                    {project.title}
                  </Link>
                  {project.featured && (
                    <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
                      на главной
                    </span>
                  )}
                </div>
                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  /{project.slug} · порядок {project.position} ·{" "}
                  {formatShortDate(project.updatedAt)}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={
                    project.published
                      ? "rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-600 dark:text-emerald-400"
                      : "rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground"
                  }
                >
                  {project.published ? "опубликован" : "черновик"}
                </span>

                <Link
                  href={`/admin/projects/${project.id}/edit`}
                  className="rounded-md border border-border px-3 py-1.5 text-sm transition-colors hover:bg-muted"
                >
                  Изменить
                </Link>

                <form action={deleteProjectAction}>
                  <input type="hidden" name="id" value={project.id} />
                  <input type="hidden" name="slug" value={project.slug} />
                  <DeleteButton label={project.title} />
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
