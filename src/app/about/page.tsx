import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Обо мне",
  description: "Опыт, стек и подход к работе.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Обо мне</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        Этот раздел будет редактироваться из админки.
      </p>
    </div>
  );
}
