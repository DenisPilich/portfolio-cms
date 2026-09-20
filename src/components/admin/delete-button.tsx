"use client";

/**
 * Кнопка удаления внутри формы.
 *
 * Форма отправляется Server Action, но перед отправкой браузер спрашивает
 * подтверждение: удаление необратимо, а кнопка стоит рядом с «Редактировать».
 */
export function DeleteButton({ label }: { label: string }) {
  return (
    <button
      type="submit"
      onClick={(event) => {
        const confirmed = window.confirm(
          `Удалить «${label}»? Действие необратимо.`,
        );

        if (!confirmed) {
          event.preventDefault();
        }
      }}
      className="rounded-md border border-red-500/40 px-3 py-1.5 text-sm text-red-500 transition-colors hover:bg-red-500/10"
    >
      Удалить
    </button>
  );
}
