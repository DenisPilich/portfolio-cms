import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

/**
 * Мелкие элементы форм с едиными стилями.
 * Собраны в одном файле, чтобы не плодить по компоненту на каждый тег.
 */

const fieldClassName =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground transition-colors outline-none placeholder:text-muted-foreground/60 focus:border-primary disabled:opacity-60";

export function Label({
  htmlFor,
  children,
  hint,
}: {
  htmlFor: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label htmlFor={htmlFor} className="flex items-baseline justify-between gap-3">
      <span className="text-sm font-medium">{children}</span>
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${fieldClassName} ${className ?? ""}`} {...props} />;
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`${fieldClassName} leading-relaxed ${className ?? ""}`}
      {...props}
    />
  );
}

export function Checkbox({
  id,
  name,
  defaultChecked,
  label,
}: {
  id: string;
  name: string;
  defaultChecked?: boolean;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        id={id}
        name={name}
        type="checkbox"
        defaultChecked={defaultChecked}
        className="size-4 rounded border-border accent-[var(--color-primary)]"
      />
      <label htmlFor={id} className="text-sm">
        {label}
      </label>
    </div>
  );
}

/** Сообщения об ошибке конкретного поля, полученные от Zod. */
export function FieldError({ errors }: { errors?: string[] }) {
  if (!errors || errors.length === 0) {
    return null;
  }

  return (
    <p className="text-xs text-red-500" role="alert">
      {errors[0]}
    </p>
  );
}

/** Общее сообщение формы: ошибка входа или подтверждение сохранения. */
export function FormMessage({
  status,
  message,
}: {
  status: "idle" | "error" | "success";
  message?: string;
}) {
  if (!message || status === "idle") {
    return null;
  }

  return (
    <p
      role={status === "error" ? "alert" : "status"}
      className={
        status === "error"
          ? "rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-500"
          : "rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400"
      }
    >
      {message}
    </p>
  );
}
