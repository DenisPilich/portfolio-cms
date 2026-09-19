import type { Metadata } from "next";
import { getPublishedProjects } from "@/lib/queries";
import { ProjectCard } from "@/components/project-card";

export const metadata: Metadata = {
  title: "Проекты",
  description: "Избранные проекты и разборы того, как они устроены.",
};

export default async function ProjectsPage() {
  const projects = await getPublishedProjects();

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-16">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Проекты</h1>
        <p className="mt-4 max-w-2xl text-pretty text-muted-foreground">
          {projects.length > 0
            ? `Всего в портфолио ${projects.length} ${pluralizeProjects(projects.length)}. Откройте карточку, чтобы прочитать, как проект устроен внутри.`
            : "Пока ни одного проекта не опубликовано."}
        </p>
      </header>

      {projects.length > 0 ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <p className="mt-10 rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          Загляните позже — раздел наполняется.
        </p>
      )}
    </div>
  );
}

/** Русское склонение: 1 проект, 2 проекта, 5 проектов. */
function pluralizeProjects(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return "проект";
  }
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return "проекта";
  }
  return "проектов";
}
