"use client";

import Image from "next/image";
import { useId, useRef, useState } from "react";
import { ArrowDown, ArrowUp, ImageUp, Trash2 } from "lucide-react";
import { FieldError, Input, Label } from "@/components/ui/field";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

/** Столько же, сколько допускает схема проверки на сервере. */
const MAX_IMAGES = 12;

export type GalleryItem = {
  url: string;
  alt: string;
};

/**
 * Галерея проекта: несколько снимков с подписями и порядком.
 *
 * Файлы уезжают в хранилище по одному, а в форму попадает только готовая
 * JSON-строка со ссылками — Server Action ничего не знает про файлы
 * и работает с обычным текстовым полем.
 *
 * Состояние живёт здесь, а не в полях ввода, потому что снимки нужно
 * переставлять и удалять до отправки формы. Сервер получает уже готовый
 * упорядоченный список.
 */
export function GalleryUploader({
  defaultValue = [],
  errors,
}: {
  defaultValue?: GalleryItem[];
  errors?: string[];
}) {
  const [items, setItems] = useState<GalleryItem[]>(defaultValue);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fieldId = useId();

  function updateAlt(index: number, alt: string) {
    setItems((current) =>
      current.map((item, position) =>
        position === index ? { ...item, alt } : item,
      ),
    );
  }

  function removeItem(index: number) {
    setItems((current) => current.filter((_, position) => position !== index));
  }

  /**
   * Меняет снимок местами с соседним.
   *
   * Копия массива обязательна: React сравнивает ссылки, и мутация на месте
   * не вызвала бы перерисовку — порядок поменялся бы в данных, но не на экране.
   */
  function moveItem(index: number, direction: -1 | 1) {
    setItems((current) => {
      const target = index + direction;

      if (target < 0 || target >= current.length) {
        return current;
      }

      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];

      return next;
    });
  }

  async function handleFilesChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const files = Array.from(event.target.files ?? []);

    if (files.length === 0) {
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    const uploaded: GalleryItem[] = [];
    let error: string | null = null;

    for (const file of files) {
      // Размер проверяем и здесь, чтобы не гонять по сети заведомо большой
      // файл. Окончательное решение всё равно за сервером.
      if (file.size > MAX_FILE_SIZE) {
        error = `“${file.name}” is larger than 5 MB and was skipped`;
        continue;
      }

      const body = new FormData();
      body.append("file", file);

      try {
        const response = await fetch("/api/upload", { method: "POST", body });
        const data = (await response.json()) as { url?: string; error?: string };

        if (!response.ok || !data.url) {
          error = data.error ?? "Could not upload the file";
          continue;
        }

        uploaded.push({ url: data.url, alt: "" });
      } catch {
        error = "Network unavailable, please try again";
      }
    }

    // Добавляем одним обновлением состояния: иначе каждый файл вызывал бы
    // отдельную перерисовку всего списка.
    if (uploaded.length > 0) {
      setItems((current) => [...current, ...uploaded].slice(0, MAX_IMAGES));
    }

    setUploadError(error);
    setIsUploading(false);

    // Поле очищаем, иначе повторный выбор тех же файлов не вызовет
    // событие change и загрузка не начнётся.
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={fieldId} hint={`up to ${MAX_IMAGES} images`}>
        Gallery
      </Label>

      {/*
        Форма отправляет именно это поле: сервер получает готовый список
        со ссылками, подписями и порядком.
      */}
      <input type="hidden" name="gallery" value={JSON.stringify(items)} />

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || items.length >= MAX_IMAGES}
          className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm transition-colors hover:bg-muted disabled:opacity-60"
        >
          <ImageUp className="size-4" aria-hidden />
          {isUploading ? "Uploading..." : "Add images"}
        </button>

        <span className="font-mono text-xs text-muted-foreground">
          {items.length} / {MAX_IMAGES}
        </span>
      </div>

      <input
        ref={fileInputRef}
        id={fieldId}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
        onChange={handleFilesChange}
        className="hidden"
      />

      {uploadError && (
        <p role="alert" className="text-xs text-red-500">
          {uploadError}
        </p>
      )}

      <FieldError errors={errors} />

      {items.length === 0 ? (
        <p className="rounded-md border border-dashed border-border p-4 text-xs text-muted-foreground">
          No gallery images yet. The cover above is shown in the project card;
          these appear on the project page.
        </p>
      ) : (
        <ul className="mt-3 space-y-3">
          {items.map((item, index) => (
            <li
              key={`${item.url}-${index}`}
              className="flex flex-wrap items-start gap-3 rounded-md border border-border p-3"
            >
              <div className="relative size-20 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
                <Image
                  src={item.url}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover"
                  // Превью в админке не нуждается в оптимизации: это один файл,
                  // который видит только автор.
                  unoptimized
                />
              </div>

              <div className="min-w-[12rem] flex-1 space-y-1">
                <Input
                  value={item.alt}
                  onChange={(event) => updateAlt(index, event.target.value)}
                  placeholder="What is shown (for screen readers)"
                  aria-label={`Description of image ${index + 1}`}
                />
                <p className="truncate font-mono text-[0.65rem] text-muted-foreground">
                  {item.url}
                </p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveItem(index, -1)}
                  disabled={index === 0}
                  aria-label={`Move image ${index + 1} up`}
                  className="inline-flex size-8 items-center justify-center rounded-md border border-border transition-colors hover:bg-muted disabled:opacity-40"
                >
                  <ArrowUp className="size-4" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => moveItem(index, 1)}
                  disabled={index === items.length - 1}
                  aria-label={`Move image ${index + 1} down`}
                  className="inline-flex size-8 items-center justify-center rounded-md border border-border transition-colors hover:bg-muted disabled:opacity-40"
                >
                  <ArrowDown className="size-4" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  aria-label={`Remove image ${index + 1}`}
                  className="inline-flex size-8 items-center justify-center rounded-md border border-border text-red-500 transition-colors hover:bg-muted"
                >
                  <Trash2 className="size-4" aria-hidden />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
