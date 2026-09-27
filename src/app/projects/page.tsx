import type { Metadata } from "next";
import { getPublishedProjects } from "@/lib/queries";
import { ProjectCard } from "@/components/project-card";

export const metadata: Metadata = {
  title: "Projects",
  description: "Selected projects and how they are put together.",
};

export default async function ProjectsPage() {
  const projects = await getPublishedProjects();

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-16">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Projects</h1>
        <p className="mt-4 max-w-2xl text-pretty text-muted-foreground">
          {projects.length > 0
            ? `${projects.length} project${projects.length === 1 ? "" : "s"} in the portfolio. Open a card to read how it is built inside.`
            : "No projects published yet."}
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
          Check back later — this section is being filled in.
        </p>
      )}
    </div>
  );
}
