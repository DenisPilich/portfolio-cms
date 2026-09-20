"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ImageUp } from "lucide-react";
import { FieldError, Input, Label } from "@/components/ui/field";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Поле обложки с загрузкой файла.
 *
 * Работает в двух режимах: можно вставить готовую ссылку или выбрать файл,
 * который уедет в хранилище. После загрузки в поле подставляется полученный
 * адрес, поэтому форма отправляет обычную строку и Server Action ничего
 * не знает про файлы.
 */
export function ImageUploader({
  name,
  label,
  hint,
  defaultValue,
  errors,
}: {
  name: string;
  label: string;
  hint?: string;
  defaultValue?: string | null;
  errors?: string[];
}) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setUploadError(null);

    // Размер проверяем и здесь, чтобы не гонять по сети заведомо большой файл.
    // Окончательное решение всё равно за сервером: браузерным проверкам
    // доверять нельзя, их легко обойти.
    if (file.size > MAX_FILE_SIZE) {
      setUploadError("Файл больше 5 МБ");
      return;
    }

    setIsUploading(true);

    const body = new FormData();
    body.append("file", file);

    try {
      const response = await fetch("/api/upload", { method: "POST", body });
      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        setUploadError(data.error ?? "Не удалось загрузить файл");
        return;
      }

      setUrl(data.url);
    } catch {
      setUploadError("Сеть недоступна, попробуйте ещё раз");
    } finally {
      setIsUploading(false);

      // Поле очищаем, иначе повторный выбор того же файла не вызовет
      // событие change и загрузка не начнётся.
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={name} hint={hint}>
        {label}
      </Label>

      <div className="flex gap-2">
        <Input
          id={name}
          name={name}
          type="url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://..."
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="inline-flex shrink-0 items-center gap-2 rounded-md border border-border px-3 py-2 text-sm transition-colors hover:bg-muted disabled:opacity-60"
        >
          <ImageUp className="size-4" aria-hidden />
          {isUploading ? "Загрузка..." : "Файл"}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
        onChange={handleFileChange}
        className="hidden"
      />

      {uploadError && (
        <p role="alert" className="text-xs text-red-500">
          {uploadError}
        </p>
      )}

      <FieldError errors={errors} />

      {url && (
        <div className="relative mt-3 h-40 w-full max-w-sm overflow-hidden rounded-md border border-border">
          <Image
            src={url}
            alt="Предпросмотр обложки"
            fill
            sizes="384px"
            className="object-cover"
            // Превью в админке не нуждается в оптимизации: это один файл,
            // который видит только автор.
            unoptimized
          />
        </div>
      )}
    </div>
  );
}
