import type { IconType } from "react-icons";
import {
  SiCss,
  SiDocker,
  SiExpress,
  SiFigma,
  SiGit,
  SiHtml5,
  SiJavascript,
  SiJest,
  SiLaravel,
  SiMongodb,
  SiNextdotjs,
  SiNginx,
  SiNodedotjs,
  SiPostgresql,
  SiPrisma,
  SiPython,
  SiReact,
  SiRedis,
  SiRedux,
  SiSass,
  SiTailwindcss,
  SiTypescript,
  SiVercel,
  SiVite,
  SiVitest,
  SiWebpack,
  SiZod,
} from "react-icons/si";

/**
 * Логотипы технологий.
 *
 * Ключи приведены к «нормализованному» виду: только строчные латинские буквы
 * и цифры. Поэтому «Next.js», «nextjs» и «nextdotjs» попадают в одну запись —
 * в базе ключ хранится в формате Simple Icons, а в стеке проекта технология
 * написана по-человечески, и приводить их вручную не нужно.
 *
 * Логотипы берутся из набора Simple Icons: это официальные SVG с открытой
 * лицензией, а не картинки с чужого сайта.
 */
const ICONS: Record<string, IconType> = {
  typescript: SiTypescript,
  javascript: SiJavascript,
  react: SiReact,
  nextjs: SiNextdotjs,
  nextdotjs: SiNextdotjs,
  nodejs: SiNodedotjs,
  nodedotjs: SiNodedotjs,
  express: SiExpress,
  laravel: SiLaravel,
  postgresql: SiPostgresql,
  postgres: SiPostgresql,
  prisma: SiPrisma,
  mongodb: SiMongodb,
  redis: SiRedis,
  tailwindcss: SiTailwindcss,
  sass: SiSass,
  scss: SiSass,
  css: SiCss,
  css3: SiCss,
  html5: SiHtml5,
  html: SiHtml5,
  docker: SiDocker,
  git: SiGit,
  nginx: SiNginx,
  python: SiPython,
  redux: SiRedux,
  zod: SiZod,
  vite: SiVite,
  webpack: SiWebpack,
  vitest: SiVitest,
  jest: SiJest,
  vercel: SiVercel,
  figma: SiFigma,
};

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function findTechIcon(name: string): IconType | undefined {
  return ICONS[normalize(name)];
}

/**
 * Инициалы для технологий, которых нет в наборе логотипов.
 *
 * Общая заглушка на всех сделала бы список нечитаемым: несколько одинаковых
 * значков подряд ничего не сообщают. Монограмма хотя бы различает записи.
 * Так, логотипа Zustand в Simple Icons нет — вместо него будет «Zu».
 */
function initials(name: string): string {
  const words = name.split(/[\s.]+/).filter(Boolean);

  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }

  const single = name.slice(0, 2);

  return single.charAt(0).toUpperCase() + single.slice(1).toLowerCase();
}

/**
 * Иконка технологии по названию.
 *
 * Если логотип неизвестен, показывается монограмма, а не пустота: список
 * не должен разъезжаться из-за одной незнакомой технологии.
 */
export function TechIcon({
  name,
  className = "size-5",
}: {
  name: string;
  className?: string;
}) {
  const Icon = findTechIcon(name);

  if (!Icon) {
    return (
      <span
        title={name}
        aria-hidden
        className={`${className} flex items-center justify-center font-mono text-[0.6rem] leading-none font-semibold`}
      >
        {initials(name)}
      </span>
    );
  }

  return <Icon className={className} aria-hidden title={name} />;
}
