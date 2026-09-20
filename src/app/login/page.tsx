import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Вход",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  // Если пользователь уже вошёл, форма ему не нужна.
  const user = await getSessionUser();
  if (user) {
    redirect("/admin");
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col justify-center px-6 py-24">
      <h1 className="text-2xl font-semibold tracking-tight">Вход в админку</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Раздел для управления содержимым сайта.
      </p>

      <div className="mt-8">
        <LoginForm />
      </div>

      {/*
        Подсказка с демо-доступом нужна только при локальном запуске.
        В продакшене она превратилась бы в готовую инструкцию для того,
        кто захочет войти в админку, поэтому там не показывается вовсе.
      */}
      {process.env.NODE_ENV === "development" && (
        <p className="mt-6 rounded-md border border-dashed border-border p-3 text-xs text-muted-foreground">
          Демо-доступ: <span className="font-mono">admin@example.com</span> /{" "}
          <span className="font-mono">admin12345</span>
        </p>
      )}
    </div>
  );
}
