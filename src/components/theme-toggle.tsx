"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";

/**
 * Переключатель темы.
 *
 * Тема живёт вне React — это класс dark на элементе <html>, который
 * выставляет инлайн-скрипт в layout ещё до первой отрисовки. Читать такое
 * состояние через useState и синхронизировать эффектом неправильно: эффект
 * вызовет лишний рендер, и правило react-hooks/set-state-in-effect на это
 * справедливо ругается.
 *
 * useSyncExternalStore создан ровно для внешних источников состояния:
 * React сам подписывается на изменения и перечитывает значение. Серверная
 * версия нужна для гидратации — она отдаёт тему по умолчанию, а после
 * монтирования React подставит настоящую, без ошибок несоответствия.
 */
function subscribeToThemeChanges(onStoreChange: () => void) {
  const observer = new MutationObserver(onStoreChange);

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });

  return () => observer.disconnect();
}

function getThemeSnapshot(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function getServerThemeSnapshot(): Theme {
  return "dark";
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(
    subscribeToThemeChanges,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );

  function toggleTheme() {
    const next: Theme = theme === "dark" ? "light" : "dark";

    // Меняем внешний источник, а не состояние React: наблюдатель
    // в subscribeToThemeChanges заметит изменение класса и обновит тему.
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
      {theme === "dark" ? (
        <Sun className="size-4" aria-hidden />
      ) : (
        <Moon className="size-4" aria-hidden />
      )}
    </button>
  );
}
