"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Появление блока при прокрутке.
 *
 * Блок скрыт до тех пор, пока не попадёт в поле зрения, — тогда к нему
 * применяется та же анимация, что и у первого экрана. Наблюдение снимается
 * после первого срабатывания: повторно анимировать при прокрутке вверх
 * не нужно, это выглядело бы дёргано.
 *
 * Скрытие работает только при включённом JavaScript: класс js на <html>
 * ставит инлайн-скрипт в layout, а правила в globals.css написаны через
 * html.js. Без скриптов содержимое просто остаётся видимым.
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    // В старых браузерах наблюдателя может не быть — тогда показываем сразу,
    // чтобы содержимое не осталось скрытым навсегда.
    if (typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        }
      },
      {
        // Блок начинает появляться, немного не дойдя до нижнего края экрана
        rootMargin: "0px 0px -8% 0px",
        threshold: 0.05,
      },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-reveal={isVisible ? "true" : "false"}
      style={{ animationDelay: `${delay}ms` }}
      className={className}
    >
      {children}
    </div>
  );
}
