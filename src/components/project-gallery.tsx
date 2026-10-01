"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";

export type GalleryImage = {
  url: string;
  alt: string;
};

/**
 * Галерея проекта с просмотром в полный размер.
 *
 * Клиентский компонент, потому что состояние открытого снимка живёт
 * в браузере. Открывается поверх страницы по клику, листается стрелками
 * и закрывается по Escape — иначе клавиатурный пользователь оказался бы
 * заперт внутри просмотра.
 *
 * Список снимков приходит готовым и упорядоченным с сервера, поэтому
 * компонент ничего не сортирует: порядок задаёт администратор.
 */
export function ProjectGallery({ images }: { images: GalleryImage[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const close = useCallback(() => setOpenIndex(null), []);

  // Листаем по кругу: с последнего снимка следующий — первый.
  const showPrevious = useCallback(() => {
    setOpenIndex((current) =>
      current === null ? null : (current - 1 + images.length) % images.length,
    );
  }, [images.length]);

  const showNext = useCallback(() => {
    setOpenIndex((current) =>
      current === null ? null : (current + 1) % images.length,
    );
  }, [images.length]);

  useEffect(() => {
    if (openIndex === null) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        close();
      } else if (event.key === "ArrowLeft") {
        showPrevious();
      } else if (event.key === "ArrowRight") {
        showNext();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [openIndex, close, showPrevious, showNext]);

  const current = openIndex === null ? null : images[openIndex];

  return (
    <>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
        {images.map((image, index) => (
          <li key={`${image.url}-${index}`}>
            <button
              type="button"
              onClick={() => setOpenIndex(index)}
              aria-label={`Open image ${index + 1} of ${images.length} in full size`}
              className="group relative block aspect-[4/3] w-full cursor-zoom-in overflow-hidden rounded-lg border border-border bg-muted"
            >
              <Image
                src={image.url}
                alt={image.alt}
                fill
                sizes="(max-width: 640px) 100vw, 360px"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />

              <span className="absolute right-2 bottom-2 flex size-8 items-center justify-center rounded-md bg-background/80 opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
                <Maximize2 className="size-4" aria-hidden />
              </span>
            </button>

            {image.alt && (
              <p className="mt-2 text-xs text-pretty text-muted-foreground">
                {image.alt}
              </p>
            )}
          </li>
        ))}
      </ul>

      {current && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={current.alt}
          onClick={close}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 p-4 backdrop-blur-sm"
        >
          <button
            type="button"
            onClick={close}
            aria-label="Close the preview"
            className="absolute top-4 right-4 flex size-10 items-center justify-center rounded-md border border-border bg-background"
          >
            <X className="size-5" aria-hidden />
          </button>

          {images.length > 1 && (
            <>
              {/* stopPropagation обязателен: без него клик по стрелке
                  всплыл бы до фона и закрыл просмотр. */}
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  showPrevious();
                }}
                aria-label="Previous image"
                className="absolute left-4 flex size-10 items-center justify-center rounded-md border border-border bg-background"
              >
                <ChevronLeft className="size-5" aria-hidden />
              </button>

              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  showNext();
                }}
                aria-label="Next image"
                className="absolute right-4 flex size-10 items-center justify-center rounded-md border border-border bg-background"
              >
                <ChevronRight className="size-5" aria-hidden />
              </button>
            </>
          )}

          <figure className="flex max-h-full flex-col items-center gap-3">
            <Image
              src={current.url}
              alt={current.alt}
              width={1600}
              height={1000}
              sizes="90vw"
              className="h-auto max-h-[80vh] w-auto max-w-full rounded-lg object-contain"
            />

            <figcaption className="text-center text-xs text-muted-foreground">
              {current.alt}
              {images.length > 1 && (
                <span className="ml-2 font-mono">
                  {(openIndex ?? 0) + 1} / {images.length}
                </span>
              )}
            </figcaption>
          </figure>
        </div>
      )}
    </>
  );
}
