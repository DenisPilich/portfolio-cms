import { TechIcon } from "@/components/tech-icon";

/**
 * Анимированная сцена первого экрана.
 *
 * Геометрия. Иконки расставлены по окружности, но положение задаётся
 * в процентах, а проценты считаются по-разному: left — от ширины, top —
 * от высоты. Стоило контейнеру оказаться чуть не квадратным, как круг
 * превращался в эллипс. Поэтому размер задан распоркой с padding-top: 100%:
 * её высота всегда равна ширине родителя, и квадрат получается гарантированно,
 * независимо от того, сколько места дал макет.
 *
 * Движение отдано пунктирной орбите, которая вращается. Сами иконки
 * не смещаются и не масштабируются — меняется только их прозрачность,
 * а она на положение не влияет.
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

/** Радиус кольца в процентах от стороны квадрата. */
const ORBIT_RADIUS = 39;

export function HeroScene() {
  return (
    /* Внешний блок задаёт ширину, распорка внутри — высоту, равную ширине */
    <div className="relative mx-auto w-full max-w-sm select-none">
      <div className="pt-[100%]" aria-hidden />

      <div className="absolute inset-0">
        {/* Пунктирная орбита: вращается она, а не иконки */}
        <svg
          viewBox="0 0 200 200"
          className="absolute inset-0 size-full animate-spin-slow text-border"
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
        </svg>

        {/* Внутренняя окружность неподвижна — она задаёт центр композиции */}
        <svg
          viewBox="0 0 200 200"
          className="absolute inset-0 size-full text-border"
          aria-hidden
        >
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
          // Углы распределены равномерно, первый — строго сверху
          const angle = (index / ORBIT_TECH.length) * Math.PI * 2 - Math.PI / 2;
          const left = 50 + Math.cos(angle) * ORBIT_RADIUS;
          const top = 50 + Math.sin(angle) * ORBIT_RADIUS;

          return (
            <span
              key={tech}
              title={tech}
              style={{
                left: `${left}%`,
                top: `${top}%`,
                // Разные задержки делают пульсацию несинхронной
                animationDelay: `${index * 400}ms`,
              }}
              className="absolute flex size-11 -translate-x-1/2 -translate-y-1/2 animate-pulse-soft items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm"
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
    </div>
  );
}
