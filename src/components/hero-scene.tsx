import { TechIcon } from "@/components/tech-icon";

/**
 * Анимированная сцена первого экрана.
 *
 * Логотипы расставлены по кругу: угол считается от индекса, поэтому
 * добавление технологии в список ничего не ломает — она просто встанет
 * в общее кольцо. В центре — символ кода, вокруг плывут иконки, снизу
 * бежит строка из нулей и единиц.
 *
 * Всё на CSS: анимации описаны в globals.css, здесь задаются только
 * задержки. Так сцена не тянет ни одной библиотеки анимации в бандл.
 */
const ORBIT_TECH = [
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "PostgreSQL",
  "Prisma",
  "Tailwind CSS",
  "Docker",
  "Git",
];

const BINARY_STRING =
  "01101001 01101101 01110000 01101111 01110010 01110100 00100000 01110010 01100101 01100001 01100011 01110100 ";

export function HeroScene() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-sm select-none">
      {/* Концентрические окружности задают ощущение орбиты */}
      <svg
        viewBox="0 0 200 200"
        className="absolute inset-0 size-full text-border"
        aria-hidden
      >
        <circle
          cx="100"
          cy="100"
          r="78"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
          strokeDasharray="4 6"
        />
        <circle
          cx="100"
          cy="100"
          r="52"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
        />
      </svg>

      {ORBIT_TECH.map((tech, index) => {
        // Раскладываем иконки равномерно по окружности
        const angle = (index / ORBIT_TECH.length) * Math.PI * 2 - Math.PI / 2;
        const left = 50 + Math.cos(angle) * 39;
        const top = 50 + Math.sin(angle) * 39;

        return (
          <span
            key={tech}
            title={tech}
            style={{
              left: `${left}%`,
              top: `${top}%`,
              // Разные задержки создают ощущение, что иконки плывут вразнобой
              animationDelay: `${index * 320}ms`,
            }}
            className="absolute flex size-11 -translate-x-1/2 -translate-y-1/2 animate-float items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm"
          >
            <TechIcon name={tech} className="size-5" />
          </span>
        );
      })}

      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-mono text-xl font-semibold text-primary">
          &lt;\&gt;
        </span>
      </div>

      <div className="absolute -bottom-2 left-0 w-full overflow-hidden">
        <div className="flex w-max animate-scroll-binary font-mono text-[10px] whitespace-nowrap text-muted-foreground/40">
          <span>{BINARY_STRING.repeat(4)}</span>
          {/* Вторая копия нужна для бесшовного цикла: когда первая уезжает
              за край, на её месте оказывается точно такая же строка. */}
          <span aria-hidden>{BINARY_STRING.repeat(4)}</span>
        </div>
      </div>
    </div>
  );
}
