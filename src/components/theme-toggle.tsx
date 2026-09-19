"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";

/**
 * Переключатель темы.
 *
 * Компонент клиентский: только в браузере есть localStorage и classList.
 * Начальное значение НЕ берётся из window при первом рендере — это сломало бы
 * гидратацию, потому что сервер отдаёт разметку, ничего не зная о теме.
 * Вместо этого тему выставляет крошечный инлайн-скрипт в layout.tsx ещё до
 * отрисовки, а здесь мы просто читаем уже готовое состояние.
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTheme(
      document.documentElement.classList.contains("dark") ? "dark" : "light",
    );
  }, []);

  function toggleTheme() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    localStorage.setItem("theme", next);
  }

  const label =
    theme === "dark" ? "Включить светлую тему" : "Включить тёмную тему";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className="inline-flex size-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      {/* До монтирования рисуем нейтральную заглушку, чтобы не мигала иконка */}
      {!mounted ? (
        <span className="size-4" aria-hidden />
      ) : theme === "dark" ? (
        <Sun className="size-4" aria-hidden />
      ) : (
        <Moon className="size-4" aria-hidden />
      )}
    </button>
  );
}
