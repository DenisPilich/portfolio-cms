import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getPublishedProjects, getRecentPosts, getSkills } from "@/lib/queries";
import { HeroSection } from "@/components/hero-section";
import { SkillsSection } from "@/components/skills-section";
import { ContactsSection } from "@/components/contacts-section";
import { ProjectShowcase } from "@/components/project-showcase";
import { PostCard } from "@/components/post-card";

/**
 * Главная — лендинг с якорями: первый экран, навыки, портфолио, контакты.
 * Отдельные страницы остаются для того, что требует глубины: детали проекта,
 * блог с пагинацией и поиск.
 *
 * Данные читаются параллельно: три независимых запроса незачем выстраивать
 * в очередь.
 */
export default async function HomePage() {
  const [projects, skills, posts] = await Promise.all([
    getPublishedProjects(),
    getSkills(),
    getRecentPosts(2),
  ]);

  return (
    <div className="mx-auto w-full max-w-5xl px-6">
      <HeroSection />

      <SkillsSection skills={skills} />

      {projects.length > 0 && (
        <section
          id="portfolio"
          className="scroll-mt-24 border-t border-border py-20"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <h2 className="text-2xl font-semibold tracking-tight">Портфолио</h2>
            <Link
              href="/projects"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Все проекты
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </div>

          <div className="mt-8 grid gap-6">
            {projects.map((project, index) => (
              <div
                key={project.id}
                // Задержка растёт с индексом: карточки выезжают по очереди,
                // а не появляются все одновременно.
                style={{ animationDelay: `${index * 80}ms` }}
                className="animate-fade-in-up"
              >
                <ProjectShowcase project={project} />
              </div>
            ))}
          </div>
        </section>
      )}

      {posts.length > 0 && (
        <section className="border-t border-border py-20">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <h2 className="text-2xl font-semibold tracking-tight">
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

      <ContactsSection />
    </div>
  );
}
