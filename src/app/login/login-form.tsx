"use client";

import { useActionState } from "react";
import { loginAction } from "@/actions/auth";
import { initialActionState } from "@/lib/action-state";
import { FieldError, FormMessage, Input, Label } from "@/components/ui/field";

/**
 * Форма входа.
 *
 * useActionState связывает форму с серверной функцией и отдаёт три значения:
 * текущее состояние, готовый action для <form> и признак выполнения.
 * Признак выполнения приходит из React 19, поэтому отдельный useFormStatus
 * здесь не нужен.
 */
export function LoginForm() {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialActionState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <FormMessage status={state.status} message={state.message} />

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          placeholder="admin@example.com"
        />
        <FieldError errors={state.fieldErrors?.email} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Пароль</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
        <FieldError errors={state.fieldErrors?.password} />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {isPending ? "Проверяем..." : "Войти"}
      </button>
    </form>
  );
}
