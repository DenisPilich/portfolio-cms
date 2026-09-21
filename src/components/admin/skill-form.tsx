"use client";

import { useActionState, useState } from "react";
import { initialActionState, type ActionState } from "@/lib/action-state";
import { TechIcon } from "@/components/tech-icon";
import {
  FieldError,
  FormMessage,
  Input,
  Label,
  Select,
  Textarea,
} from "@/components/ui/field";

type SkillFormAction = (
  state: ActionState,
  formData: FormData,
) => Promise<ActionState>;

export type SkillFormValues = {
  name: string;
  description: string | null;
  category: "HARD" | "SOFT";
  icon: string | null;
  position: number;
};

export function SkillForm({
  action,
  skillId,
  defaultValues,
}: {
  action: SkillFormAction;
  skillId?: string;
  defaultValues?: SkillFormValues;
}) {
  const [state, formAction, isPending] = useActionState(
    action,
    initialActionState,
  );

  // Ключ иконки держим в состоянии, чтобы показывать предпросмотр логотипа
  // сразу при вводе: без этого пришлось бы сохранять и смотреть на главной.
  const [icon, setIcon] = useState(defaultValues?.icon ?? "");

  return (
    <form action={formAction} className="space-y-6">
      {skillId && <input type="hidden" name="id" value={skillId} />}

      <FormMessage status={state.status} message={state.message} />

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Название</Label>
          <Input
            id="name"
            name="name"
            defaultValue={defaultValues?.name ?? ""}
            required
            placeholder="TypeScript"
          />
          <FieldError errors={state.fieldErrors?.name} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Категория</Label>
          <Select
            id="category"
            name="category"
            defaultValue={defaultValues?.category ?? "HARD"}
          >
            <option value="HARD">Hard skill — технология</option>
            <option value="SOFT">Soft skill — качество</option>
          </Select>
          <FieldError errors={state.fieldErrors?.category} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" hint="для soft-навыков">
          Пояснение
        </Label>
        <Textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={defaultValues?.description ?? ""}
          placeholder="Есть опыт общения с дизайнерами и менеджерами."
        />
        <FieldError errors={state.fieldErrors?.description} />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="icon" hint="ключ Simple Icons">
            Иконка
          </Label>
          <div className="flex items-center gap-3">
            <Input
              id="icon"
              name="icon"
              value={icon}
              onChange={(event) => setIcon(event.target.value)}
              placeholder="react"
              className="font-mono"
            />
            <span className="flex size-10 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground">
              <TechIcon name={icon || "unknown"} />
            </span>
          </div>
          <FieldError errors={state.fieldErrors?.icon} />
          <p className="text-xs text-muted-foreground">
            Например: react, nextdotjs, postgresql, prisma. Названия берутся
            из набора Simple Icons, у soft-навыков иконка не нужна.
          </p>
        </div>

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
