import type { Metadata } from "next";
import { Search } from "lucide-react";
import { ProjectCard } from "@/components/project-card";
import { MIN_SEARCH_LENGTH, searchProjects } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Search",
  description: "Search across projects.",
  robots: { index: false, follow: true },
};

export default async function SearchPage({
  searchParams,
}: PageProps<"/search">) {
  const params = await searchParams;
  const rawQuery = Array.isArray(params.q) ? params.q[0] : (params.q ?? "");
  const query = rawQuery.trim();

  const { projects } = await searchProjects(query);
  const tooShort = query.length > 0 && query.length < MIN_SEARCH_LENGTH;
  const searched = query.length >= MIN_SEARCH_LENGTH;

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Search</h1>
      <p className="mt-4 max-w-2xl text-pretty text-muted-foreground">
        Looks through project titles, descriptions and tech stacks.
      </p>

      {/*
        Обычная GET-форма: запрос уходит в адресную строку, поэтому ссылкой
        на результаты можно поделиться, а страница работает и без JavaScript.
      */}
      <form action="/search" method="get" className="mt-8 flex flex-wrap gap-2">
        <label htmlFor="q" className="sr-only">
          Search query
        </label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={query}
          placeholder="For example: Next.js"
          autoComplete="off"
          className="min-w-0 flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary sm:max-w-md"
        />
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Search className="size-4" aria-hidden />
          Search
        </button>
      </form>

      {tooShort && (
        <p className="mt-8 text-sm text-muted-foreground">
          Please enter at least {MIN_SEARCH_LENGTH} characters.
        </p>
      )}

      {searched && projects.length === 0 && (
        <p className="mt-8 rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          Nothing found for “{query}”.
        </p>
      )}

      {projects.length > 0 && (
        <section className="mt-12">
          <h2 className="font-medium">
            Projects{" "}
            <span className="font-mono text-sm text-muted-foreground">
              {projects.length}
            </span>
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
