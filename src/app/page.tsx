import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { siteConfig } from "@/lib/site";
import { getFeaturedProjects, getRecentPosts } from "@/lib/queries";
import { ProjectCard } from "@/components/project-card";
import { PostCard } from "@/components/post-card";

/**
 * Главная страница — серверный компонент: база данных читается прямо здесь,
 * во время рендера. Никакого API-слоя и никакого состояния загрузки
 * на клиенте: браузер получает уже готовую разметку.
 */
export default async function HomePage() {
  const [projects, posts] = await Promise.all([
    getFeaturedProjects(2),
    getRecentPosts(2),
  ]);

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

      {projects.length > 0 && (
        <section className="border-t border-border py-14">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-xl font-semibold tracking-tight">
              Избранные проекты
            </h2>
            <Link
              href="/projects"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Все проекты
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </section>
      )}

      {posts.length > 0 && (
        <section className="border-t border-border py-14">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-xl font-semibold tracking-tight">
              Свежее в блоге
            </h2>
            <Link
              href="/blog"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Все статьи
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
