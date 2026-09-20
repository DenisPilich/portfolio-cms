import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createProjectAction } from "@/actions/projects";
import { ProjectForm } from "@/components/admin/project-form";

export const metadata: Metadata = {
  title: "Новый проект",
  robots: { index: false, follow: false },
};

export default function NewProjectPage() {
  return (
    <div>
      <Link
        href="/admin/projects"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        К списку проектов
      </Link>

      <h1 className="mt-6 text-2xl font-semibold tracking-tight">
        Новый проект
      </h1>

      <div className="mt-8">
        {/* Server Action передаётся в клиентский компонент как обычный проп —
            это поддерживаемый способ связать форму с сервером. */}
        <ProjectForm action={createProjectAction} />
      </div>
    </div>
  );
}
