/**
 * Статическая конфигурация сайта: то, что нужно для метаданных и навигации
 * ещё до обращения к базе данных.
 *
 * Тексты на английском: сайт рассчитан на международный рынок, поэтому
 * и интерфейс, и метаданные страниц должны быть на одном языке.
 */
export const siteConfig = {
  /** Подставьте своё имя — оно используется в шапке, подвале и заголовках. */
  name: "Pilich Denis",
  role: "Fullstack Developer",
  tagline:
    "I build web applications with TypeScript, React and Node.js. Below are the projects I have worked on and how they are put together.",
  description:
    "Fullstack developer portfolio: projects, technical notes and open source.",
  /** Текст первого экрана: показывается с анимацией появления. */
  hero: {
    greeting: "Hi! My name is",
    intro:
      "I can build something great for you — from the idea and the interface to the database and deployment.",
  },
  /** Базовый адрес сайта. В проде задаётся через NEXT_PUBLIC_SITE_URL. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  locale: "en_US",
  nav: [
    { href: "/projects", label: "Projects" },
    { href: "/about", label: "About" },
    { href: "/search", label: "Search" },
    { href: "/contact", label: "Contact" },
  ],
  socials: [
    { href: "https://github.com/DenisPilich", label: "GitHub" },
    { href: "https://t.me/DeniskaJob", label: "Telegram" },
    { href: "mailto:pilich.den@atomicmail.io", label: "Email" },
  ],
} as const;

export type SiteConfig = typeof siteConfig;
export type NavItem = SiteConfig["nav"][number];
