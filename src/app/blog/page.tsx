import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Блог",
  description: "Технические заметки и разборы.",
};

export default function BlogPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Блог</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        Список статей появится здесь после подключения базы данных.
      </p>
    </div>
  );
}
