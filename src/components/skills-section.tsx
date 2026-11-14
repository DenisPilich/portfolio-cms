import type { Skill } from "@/generated/prisma/client";
import { TechIcon } from "@/components/tech-icon";

/**
 * Раздел навыков.
 *
 * Уровней владения здесь намеренно нет. Шкала «основы / уверенно / идеально»
 * выглядит объективной, но на практике судить о себе по ней невозможно:
 * у каждого своя планка, и у читателя она другая. Вместо оценки — простой
 * список технологий, с которыми человек работал, и качеств, которые может
 * подтвердить делом. Уровни при этом остаются в базе: их можно вернуть,
 * не трогая данные.
 *
 * Hard-навыки — плитки с логотипами: так список читается быстрее, чем
 * строкой через запятую. Soft — обычный список с акцентным маркером:
 * у них суть в тексте, рамки вокруг каждого пункта только дробят чтение.
 */
export function SkillsSection({ skills }: { skills: Skill[] }) {
  const hardSkills = skills.filter((skill) => skill.category === "HARD");
  const softSkills = skills.filter((skill) => skill.category === "SOFT");

  return (
    <section id="skills" className="scroll-mt-24 border-t border-border py-20">
      <p className="font-mono text-xs tracking-[0.2em] text-primary uppercase">
        Skills
      </p>
      <h2 className="mt-4 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
        What I work with
      </h2>

      <div className="mt-12 grid gap-12 lg:grid-cols-2 lg:gap-16">
        {hardSkills.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold tracking-tight">
              Hard skills
            </h3>

            <ul className="mt-6 flex flex-wrap gap-2.5">
              {hardSkills.map((skill) => (
                <li key={skill.id}>
                  <span className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm transition-colors hover:border-primary/60">
                    <span className="flex size-5 shrink-0 items-center justify-center text-primary">
                      <TechIcon name={skill.icon ?? skill.name} className="size-4" />
                    </span>
                    {skill.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {softSkills.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold tracking-tight">
              Soft skills
            </h3>

            <ul className="mt-6 space-y-4">
              {softSkills.map((skill) => (
                <li
                  key={skill.id}
                  className="relative border-l-2 border-primary/40 pl-5"
                >
                  <p className="font-medium">{skill.name}</p>
                  {skill.description && (
                    <p className="mt-1 text-sm text-pretty text-muted-foreground">
                      {skill.description}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
