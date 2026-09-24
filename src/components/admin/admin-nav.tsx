"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Обзор" },
  { href: "/admin/projects", label: "Проекты" },
  { href: "/admin/posts", label: "Статьи" },
  { href: "/admin/skills", label: "Навыки" },
  { href: "/admin/messages", label: "Сообщения" },
] as const;

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Навигация по админке">
      <ul className="flex flex-wrap items-center gap-1">
        {LINKS.map((link) => {
          // Раздел считается активным и на вложенных страницах: /admin/projects/new
          const isActive =
            link.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(link.href);

          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={
                  isActive
                    ? "block rounded-md bg-muted px-3 py-2 text-sm font-medium text-foreground"
                    : "block rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                }
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
