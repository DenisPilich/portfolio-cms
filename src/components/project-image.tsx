"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Maximize2, X } from "lucide-react";

/**
 * Обложка проекта с просмотром в полном размере.
 *
 * Клиентский компонент, потому что состояние открытого окна живёт
 * в браузере. По клику картинка открывается поверх страницы — так же,
 * как на референсе, где снимок проекта можно рассмотреть целиком.
 */
export function ProjectImage({
  src,
  alt,
}: {
  src: string | null;
  alt: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  // Escape должен закрывать окно: без этого клавиатурный пользователь
  // окажется заперт внутри просмотра.
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!src) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-lg border border-dashed border-border bg-muted p-4 text-center text-xs text-muted-foreground">
        Обложка не задана
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label={`Открыть изображение «${alt}» в полном размере`}
        className="group relative aspect-[4/3] w-full cursor-zoom-in overflow-hidden rounded-lg border border-border bg-muted"
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 640px) 100vw, 220px"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />

        <span className="absolute right-2 bottom-2 flex size-8 items-center justify-center rounded-md bg-background/80 opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
          <Maximize2 className="size-4" aria-hidden />
        </span>
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 p-4 backdrop-blur-sm"
        >
          <button
            type="button"
            aria-label="Закрыть просмотр"
            className="absolute top-4 right-4 flex size-10 items-center justify-center rounded-md border border-border bg-background"
          >
            <X className="size-5" aria-hidden />
          </button>

          <Image
            src={src}
            alt={alt}
            width={1600}
            height={1000}
            sizes="90vw"
            className="h-auto max-h-[85vh] w-auto max-w-full rounded-lg object-contain"
          />
        </div>
      )}
    </>
  );
}
