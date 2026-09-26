import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { updateProjectAction } from "@/actions/projects";
import { prisma } from "@/lib/prisma";
import { ProjectForm } from "@/components/admin/project-form";

export const metadata: Metadata = {
  title: "Редактирование проекта",
  robots: { index: false, follow: false },
};

export default async function EditProjectPage({
  params,
}: PageProps<"/admin/projects/[id]/edit">) {
  const { id } = await params;

  const project = await prisma.project.findUnique({ where: { id } });

  if (!project) {
    notFound();
  }

  return (
    <div>
      <Link
        href="/admin/projects"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        К списку проектов
      </Link>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">
          Редактирование проекта
        </h1>
        {project.published && (
          <Link
            href={`/projects/${project.slug}`}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Открыть на сайте →
          </Link>
        )}
      </div>

      <div className="mt-8">
        <ProjectForm
          action={updateProjectAction}
          projectId={project.id}
          defaultValues={{
            title: project.title,
            slug: project.slug,
            summary: project.summary,
            content: project.content,
            coverImage: project.coverImage,
            techStack: project.techStack,
            repoUrl: project.repoUrl,
            liveUrl: project.liveUrl,
            featured: project.featured,
            published: project.published,
            position: project.position,
          }}
        />
      </div>
    </div>
  );
}
