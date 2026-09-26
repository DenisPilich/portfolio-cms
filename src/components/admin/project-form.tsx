"use client";

import { useActionState, useState } from "react";
import { initialActionState, type ActionState } from "@/lib/action-state";
import { slugify } from "@/lib/slug";
import { ImageUploader } from "@/components/admin/image-uploader";
import {
  Checkbox,
  FieldError,
  FormMessage,
  Input,
  Label,
  Textarea,
} from "@/components/ui/field";

type ProjectFormAction = (
  state: ActionState,
  formData: FormData,
) => Promise<ActionState>;

export type ProjectFormValues = {
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImage: string | null;
  techStack: string[];
  repoUrl: string | null;
  liveUrl: string | null;
  featured: boolean;
  published: boolean;
  position: number;
};

export function ProjectForm({
  action,
  projectId,
  defaultValues,
}: {
  action: ProjectFormAction;
  projectId?: string;
  defaultValues?: ProjectFormValues;
}) {
  const [state, formAction, isPending] = useActionState(
    action,
    initialActionState,
  );

  const [title, setTitle] = useState(defaultValues?.title ?? "");
  const [slug, setSlug] = useState(defaultValues?.slug ?? "");
  // Пока пользователь не трогал поле slug, оно автоматически следует
  // за заголовком. Как только поле правили руками — перестаём вмешиваться.
  const [slugEditedManually, setSlugEditedManually] = useState(
    Boolean(defaultValues?.slug),
  );

  function handleTitleChange(value: string) {
    setTitle(value);

    if (!slugEditedManually) {
      setSlug(slugify(value));
    }
  }

  return (
    <form action={formAction} className="space-y-6">
      {projectId && <input type="hidden" name="id" value={projectId} />}

      <FormMessage status={state.status} message={state.message} />

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">Название</Label>
          <Input
            id="title"
            name="title"
            value={title}
            onChange={(event) => handleTitleChange(event.target.value)}
            required
            placeholder="Портфолио с собственной CMS"
          />
          <FieldError errors={state.fieldErrors?.title} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug" hint="адрес страницы">
            Slug
          </Label>
          <Input
            id="slug"
            name="slug"
            value={slug}
            onChange={(event) => {
              setSlugEditedManually(true);
              setSlug(event.target.value);
            }}
            required
            placeholder="portfolio-cms"
            className="font-mono"
          />
          <FieldError errors={state.fieldErrors?.slug} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="summary" hint="1–2 предложения">
          Краткое описание
        </Label>
        <Textarea
          id="summary"
          name="summary"
          rows={2}
          defaultValue={defaultValues?.summary ?? ""}
          required
        />
        <FieldError errors={state.fieldErrors?.summary} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content" hint="поддерживается Markdown">
          Содержимое
        </Label>
        <Textarea
          id="content"
          name="content"
          rows={14}
          defaultValue={defaultValues?.content ?? ""}
          required
          className="font-mono text-xs"
        />
        <FieldError errors={state.fieldErrors?.content} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="techStack" hint="через запятую">
          Технологии
        </Label>
        <Input
          id="techStack"
          name="techStack"
          defaultValue={defaultValues?.techStack.join(", ") ?? ""}
          placeholder="Next.js, TypeScript, Prisma"
        />
        <FieldError errors={state.fieldErrors?.techStack} />
      </div>

      {/*
        Обложка показывается в карточке проекта на главной и на странице
        «Проекты». Без неё там стоит заглушка, поэтому поле стоит выше
        ссылок — это то, что заполняют в первую очередь.
      */}
      <ImageUploader
        name="coverImage"
        label="Обложка проекта"
        hint="необязательно"
        defaultValue={defaultValues?.coverImage}
        errors={state.fieldErrors?.coverImage}
      />

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="repoUrl" hint="необязательно">
            Ссылка на код
          </Label>
          <Input
            id="repoUrl"
            name="repoUrl"
            type="url"
            defaultValue={defaultValues?.repoUrl ?? ""}
            placeholder="https://github.com/..."
          />
          <FieldError errors={state.fieldErrors?.repoUrl} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="liveUrl" hint="необязательно">
            Ссылка на демо
          </Label>
          <Input
            id="liveUrl"
            name="liveUrl"
            type="url"
            defaultValue={defaultValues?.liveUrl ?? ""}
            placeholder="https://example.com"
          />
          <FieldError errors={state.fieldErrors?.liveUrl} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <div className="space-y-2">
          <Label htmlFor="position" hint="меньше — выше">
            Порядок
          </Label>
          <Input
            id="position"
            name="position"
            type="number"
            min={0}
            max={999}
            defaultValue={defaultValues?.position ?? 0}
            className="w-28"
          />
          <FieldError errors={state.fieldErrors?.position} />
        </div>

        <Checkbox
          id="featured"
          name="featured"
          label="Показывать на главной"
          defaultChecked={defaultValues?.featured ?? false}
        />

        <Checkbox
          id="published"
          name="published"
          label="Опубликовано"
          defaultChecked={defaultValues?.published ?? false}
        />
      </div>

      <div className="flex items-center gap-3 border-t border-border pt-6">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {isPending ? "Сохраняем..." : "Сохранить"}
        </button>
      </div>
    </form>
  );
}
