import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileNav } from "@/components/mobile-nav";

/**
 * Шапка сайта — серверный компонент. В неё не нужно передавать данные
 * из браузера, поэтому она рендерится на сервере и в бандл не попадает.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-4 px-6">
        <Link
          href="/"
          className="font-mono text-sm font-semibold tracking-tight transition-colors hover:text-primary"
        >
          {siteConfig.name}
        </Link>

        <nav aria-label="Основная навигация" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {siteConfig.nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
