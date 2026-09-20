"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { siteConfig } from "@/lib/site";

/**
 * Мобильное меню. Клиентский компонент, потому что состояние открытости
 * живёт в браузере. Вынесен отдельно от SiteHeader намеренно: шапка
 * остаётся серверным компонентом и не тянет JavaScript в бандл.
 */
function MenuPanel() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? "Закрыть меню" : "Открыть меню"}
        className="inline-flex size-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        {open ? (
          <X className="size-4" aria-hidden />
        ) : (
          <Menu className="size-4" aria-hidden />
        )}
      </button>

      {open && (
        <nav className="absolute inset-x-0 top-16 border-b border-border bg-background px-6 py-3 shadow-sm">
          <ul className="flex flex-col">
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
      )}
    </div>
  );
}

export function MobileNav() {
  const pathname = usePathname();

  /*
   * key заставляет React пересоздать панель при смене адреса, поэтому меню
   * закрывается само: состояние open исчезает вместе с компонентом.
   *
   * Раньше это делал useEffect с setOpen(false). Так писать не стоит —
   * вызов состояния прямо в эффекте порождает лишний каскад рендеров,
   * и правило react-hooks/set-state-in-effect справедливо на это ругается.
   */
  return <MenuPanel key={pathname} />;
}
