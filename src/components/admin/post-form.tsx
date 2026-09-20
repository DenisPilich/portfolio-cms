"use client";

import { useActionState, useState } from "react";
import { initialActionState, type ActionState } from "@/lib/action-state";
import { slugify } from "@/lib/slug";
import {
  Checkbox,
  FieldError,
  FormMessage,
  Input,
  Label,
  Textarea,
} from "@/components/ui/field";

type PostFormAction = (
  state: ActionState,
  formData: FormData,
) => Promise<ActionState>;

export type PostFormValues = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  tags: string[];
  published: boolean;
};

export function PostForm({
  action,
  postId,
  defaultValues,
}: {
  action: PostFormAction;
  postId?: string;
  defaultValues?: PostFormValues;
}) {
  const [state, formAction, isPending] = useActionState(
    action,
    initialActionState,
  );

  const [title, setTitle] = useState(defaultValues?.title ?? "");
  const [slug, setSlug] = useState(defaultValues?.slug ?? "");
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
      {postId && <input type="hidden" name="id" value={postId} />}

      <FormMessage status={state.status} message={state.message} />

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">Заголовок</Label>
          <Input
            id="title"
            name="title"
            value={title}
            onChange={(event) => handleTitleChange(event.target.value)}
            required
            placeholder="Как работает кэш в Next.js"
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
            className="font-mono"
          />
          <FieldError errors={state.fieldErrors?.slug} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="excerpt" hint="показывается в списке">
          Краткое описание
        </Label>
        <Textarea
          id="excerpt"
          name="excerpt"
          rows={2}
          defaultValue={defaultValues?.excerpt ?? ""}
          required
        />
        <FieldError errors={state.fieldErrors?.excerpt} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content" hint="поддерживается Markdown">
          Текст статьи
        </Label>
        <Textarea
          id="content"
          name="content"
          rows={18}
          defaultValue={defaultValues?.content ?? ""}
          required
          className="font-mono text-xs"
        />
        <FieldError errors={state.fieldErrors?.content} />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="tags" hint="через запятую">
            Теги
          </Label>
          <Input
            id="tags"
            name="tags"
            defaultValue={defaultValues?.tags.join(", ") ?? ""}
            placeholder="Next.js, Prisma"
          />
          <FieldError errors={state.fieldErrors?.tags} />
          <p className="text-xs text-muted-foreground">
            Новые теги создаются автоматически.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="coverImage" hint="необязательно">
            Обложка (URL)
          </Label>
          <Input
            id="coverImage"
            name="coverImage"
            type="url"
            defaultValue={defaultValues?.coverImage ?? ""}
            placeholder="https://..."
          />
          <FieldError errors={state.fieldErrors?.coverImage} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <Checkbox
          id="published"
          name="published"
          label="Опубликовано"
          defaultChecked={defaultValues?.published ?? false}
        />
        <p className="text-xs text-muted-foreground">
          Время чтения рассчитывается автоматически по тексту.
        </p>
      </div>

      <div className="border-t border-border pt-6">
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
