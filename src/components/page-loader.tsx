"use client";

import { useEffect, useState } from "react";

/**
 * Заставка при первой загрузке сайта.
 *
 * Показывается, пока страница грузится, но не меньше минимального времени:
 * на быстром соединении анимация мигнула бы и выглядела как сбой, а не как
 * задумка. После исчезновения компонент снимается с экрана целиком, поэтому
 * он не перехватывает клики.
 *
 * При переходах между страницами заставка не появляется: layout не
 * перемонтируется, а состояние живёт именно в нём.
 */
const MIN_VISIBLE_MS = 1100;

export function PageLoader() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const startedAt = Date.now();

    function scheduleHide() {
      const elapsed = Date.now() - startedAt;
      const remaining = Math.max(0, MIN_VISIBLE_MS - elapsed);

      timer = setTimeout(() => setIsVisible(false), remaining);
    }

    if (document.readyState === "complete") {
      scheduleHide();
    } else {
      window.addEventListener("load", scheduleHide, { once: true });
    }

    return () => {
      window.removeEventListener("load", scheduleHide);

      if (timer) {
        clearTimeout(timer);
      }
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      aria-hidden
      className="fixed inset-0 z-100 flex items-center justify-center bg-background"
    >
      <div className="flex flex-col items-center gap-5">
        <span className="animate-pulse font-mono text-3xl font-semibold text-primary">
          &lt;\&gt;
        </span>

        <span className="block h-0.5 w-32 overflow-hidden rounded-full bg-muted">
          <span className="block h-full w-1/3 animate-loader-bar rounded-full bg-primary" />
        </span>
      </div>
    </div>
  );
}
