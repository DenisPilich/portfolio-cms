import type { Skill } from "@/generated/prisma/client";
import { TechIcon } from "@/components/tech-icon";

/**
 * Раздел «Что я умею».
 *
 * Компонент серверный: данные приходят готовыми, интерактивности нет.
 * Hard-навыки показываются плиткой с логотипами, soft — карточками
 * с пояснением, потому что у них суть в тексте, а не в названии.
 */
export function SkillsSection({ skills }: { skills: Skill[] }) {
  const hardSkills = skills.filter((skill) => skill.category === "HARD");
  const softSkills = skills.filter((skill) => skill.category === "SOFT");

  return (
    <section id="skills" className="scroll-mt-24 border-t border-border py-20">
      <h2 className="text-2xl font-semibold tracking-tight">
        Что я умею
      </h2>
      <p className="mt-3 max-w-2xl text-pretty text-muted-foreground">
        Технологии, с которыми работаю, и то, как веду себя в команде.
      </p>

      {hardSkills.length > 0 && (
        <div className="mt-10">
          <h3 className="font-mono text-sm tracking-wide text-muted-foreground uppercase">
            Hard skills
          </h3>

          <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {hardSkills.map((skill) => (
              <li
                key={skill.id}
                className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/60"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-foreground">
                  <TechIcon name={skill.icon ?? skill.name} />
                </span>
                <span className="text-sm font-medium">{skill.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {softSkills.length > 0 && (
        <div className="mt-12">
          <h3 className="font-mono text-sm tracking-wide text-muted-foreground uppercase">
            Soft skills
          </h3>

          <ul className="mt-5 grid gap-4 sm:grid-cols-2">
            {softSkills.map((skill) => (
              <li
                key={skill.id}
                className="rounded-lg border border-border bg-card p-5"
              >
                <p className="font-medium">{skill.name}</p>
                {skill.description && (
                  <p className="mt-2 text-sm text-pretty text-muted-foreground">
                    {skill.description}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
