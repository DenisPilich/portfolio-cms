import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getPublishedProjects, getSkills } from "@/lib/queries";
import { HeroSection } from "@/components/hero-section";
import { SkillsSection } from "@/components/skills-section";
import { ContactsSection } from "@/components/contacts-section";
import { ProjectShowcase } from "@/components/project-showcase";
import { Reveal } from "@/components/reveal";

/**
 * Главная — лендинг с якорями: первый экран, навыки, портфолио, контакты.
 * Отдельные страницы остаются для того, что требует глубины: детали проекта
 * и поиск.
 *
 * Данные читаются параллельно: два независимых запроса незачем выстраивать
 * в очередь.
 *
 * Первый экран появляется сам — у него своя анимация по словам. Остальные
 * секции обёрнуты в Reveal и проявляются по мере прокрутки.
 */
export default async function HomePage() {
  const [projects, skills] = await Promise.all([
    getPublishedProjects(),
    getSkills(),
  ]);

  return (
    <div className="mx-auto w-full max-w-5xl px-6">
      <HeroSection />

      <Reveal>
        <SkillsSection skills={skills} />
      </Reveal>

      {projects.length > 0 && (
        <Reveal>
          <section
            id="portfolio"
            className="scroll-mt-24 border-t border-border py-20"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <h2 className="text-2xl font-semibold tracking-tight">
                Портфолио
              </h2>
              <Link
                href="/projects"
                className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Все проекты
                <ArrowRight className="size-3.5" aria-hidden />
              </Link>
            </div>

            <div className="mt-8 grid gap-6">
              {projects.map((project) => (
                <ProjectShowcase key={project.id} project={project} />
              ))}
            </div>
          </section>
        </Reveal>
      )}

      <Reveal>
        <ContactsSection />
      </Reveal>
    </div>
  );
}
