/**
 * Состояние формы для useActionState.
 *
 * Тип вынесен в отдельный файл намеренно: из модуля с директивой "use server"
 * можно экспортировать только асинхронные функции, поэтому ни тип, ни
 * константа там жить не могут.
 */
export type ActionState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

export const initialActionState: ActionState = { status: "idle" };
