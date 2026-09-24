"use client";

import { useActionState } from "react";
import { submitContactAction } from "@/actions/contact";
import { initialActionState } from "@/lib/action-state";
import {
  FieldError,
  FormMessage,
  Input,
  Label,
  Textarea,
} from "@/components/ui/field";

/**
 * Форма обратной связи.
 *
 * После успешной отправки форму сменяет сообщение: повторно отправлять
 * то же самое незачем, а так видно, что всё получилось.
 */
export function ContactForm() {
  const [state, formAction, isPending] = useActionState(
    submitContactAction,
    initialActionState,
  );

  if (state.status === "success") {
    return (
      <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-6">
        <p className="font-medium text-emerald-600 dark:text-emerald-400">
          Сообщение отправлено
        </p>
        <p className="mt-2 text-sm text-muted-foreground">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <FormMessage status={state.status} message={state.message} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Как вас зовут</Label>
          <Input id="name" name="name" required placeholder="Иван" />
          <FieldError errors={state.fieldErrors?.name} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email для ответа</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            placeholder="ivan@example.com"
          />
          <FieldError errors={state.fieldErrors?.email} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Сообщение</Label>
        <Textarea
          id="message"
          name="message"
          rows={6}
          required
          placeholder="Расскажите, что нужно сделать, или задайте вопрос."
        />
        <FieldError errors={state.fieldErrors?.message} />
      </div>

      {/*
        Ловушка для ботов. Скрыта от людей: поле вне потока и с aria-hidden,
        поэтому ни мышь, ни клавиатура, ни скринридер до него не доберутся.
      */}
      <div className="absolute -left-[9999px]" aria-hidden>
        <label htmlFor="company">Компания</label>
        <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {isPending ? "Отправляем..." : "Отправить"}
      </button>
    </form>
  );
}
