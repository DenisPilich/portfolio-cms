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
import { Code2 } from "lucide-react";

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
 * Иконка технологии по названию.
 *
 * Если логотип неизвестен, возвращается нейтральный значок, а не пустота:
 * список не должен разъезжаться из-за одной незнакомой технологии.
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
    return <Code2 className={className} aria-hidden />;
  }

  return <Icon className={className} aria-hidden title={name} />;
}
