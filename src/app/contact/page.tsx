import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Контакты",
  description: "Как со мной связаться.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Контакты</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        Форма обратной связи появится здесь после подключения базы данных.
      </p>
    </div>
  );
}
