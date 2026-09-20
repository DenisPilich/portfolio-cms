/**
 * Статическая конфигурация сайта: то, что нужно для метаданных и навигации
 * ещё до обращения к базе данных.
 *
 * Позже часть этих данных (имя, описание, соцсети) переедет в таблицу
 * SiteSetting, чтобы их можно было менять из админки. Пока это константы:
 * метаданные страниц вычисляются на сервере, и держать их в коде — нормально.
 */
export const siteConfig = {
  /** Подставьте своё имя — оно используется в шапке, подвале и заголовках. */
  name: "Pilich Denis",
  role: "Fullstack-разработчик",
  tagline:
    "Делаю веб-приложения на TypeScript, React и Node.js и не только. Ниже — проекты и заметки о том, как они устроены.",
  description:
    "Портфолио fullstack-разработчика: проекты, технические заметки и открытый исходный код.",
  /** Базовый адрес сайта. В проде задаётся через NEXT_PUBLIC_SITE_URL. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  locale: "ru_RU",
  nav: [
    { href: "/projects", label: "Проекты" },
    { href: "/blog", label: "Блог" },
    { href: "/about", label: "Обо мне" },
    { href: "/search", label: "Поиск" },
    { href: "/contact", label: "Контакты" },
  ],
  socials: [
    { href: "https://github.com/DenisPilich", label: "GitHub" },
    { href: "https://t.me/DeniskaJob", label: "Telegram" },
    { href: "pilich.den@atomicmail.io", label: "Email" },
  ],
} as const;

export type SiteConfig = typeof siteConfig;
export type NavItem = SiteConfig["nav"][number];
