import type { Skill, SkillLevel } from "@/generated/prisma/client";
import { TechIcon } from "@/components/tech-icon";

/**
 * Подписи уровней владения.
 *
 * Формулировки намеренно скромные: «уверенно» вместо «эксперт», «изучаю»
 * вместо «владею». Для начинающего специалиста честная оценка убедительнее
 * громких слов — она показывает, что человек понимает, где находится.
 */
const LEVEL_LABELS: Record<SkillLevel, string> = {
  CONFIDENT: "уверенно",
  BASIC: "основы",
  LEARNING: "изучаю",
};

/** Сколько из трёх делений шкалы закрашено для каждого уровня. */
const LEVEL_FILL: Record<SkillLevel, number> = {
  CONFIDENT: 3,
  BASIC: 2,
  LEARNING: 1,
};

function LevelMeter({ level }: { level: SkillLevel }) {
  const filled = LEVEL_FILL[level];

  return (
    <span className="flex items-center gap-1">
      {[1, 2, 3].map((step) => (
        <span
          key={step}
          className={
            step <= filled
              ? "h-1 w-3 rounded-full bg-primary"
              : "h-1 w-3 rounded-full bg-border"
          }
        />
      ))}
      <span className="ml-1 text-[0.65rem] text-muted-foreground">
        {LEVEL_LABELS[level]}
      </span>
    </span>
  );
}

/**
 * Раздел «Что я умею».
 *
 * Компонент серверный: данные приходят готовыми, интерактивности нет.
 * Hard-навыки показываются плиткой с логотипами и уровнем владения,
 * soft — карточками с пояснением, потому что у них суть в тексте,
 * а не в названии технологии.
 */
export function SkillsSection({ skills }: { skills: Skill[] }) {
  const hardSkills = skills.filter((skill) => skill.category === "HARD");
  const softSkills = skills.filter((skill) => skill.category === "SOFT");

  return (
    <section id="skills" className="scroll-mt-24 border-t border-border py-20">
      <h2 className="text-2xl font-semibold tracking-tight">Что я умею</h2>
      <p className="mt-3 max-w-2xl text-pretty text-muted-foreground">
        Отмечаю уровень честно: где-то уже работаю уверенно, а где-то только
        разбираюсь. Так понятнее, чего от меня ждать.
      </p>

      {hardSkills.length > 0 && (
        <div className="mt-10">
          <h3 className="font-mono text-sm tracking-wide text-muted-foreground uppercase">
            Hard skills
          </h3>

          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {hardSkills.map((skill) => (
              <li
                key={skill.id}
                className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/60"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-foreground">
                  <TechIcon name={skill.icon ?? skill.name} />
                </span>

                <span className="flex min-w-0 flex-col gap-1.5">
                  <span className="truncate text-sm font-medium">
                    {skill.name}
                  </span>
                  <LevelMeter level={skill.level} />
                </span>
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
