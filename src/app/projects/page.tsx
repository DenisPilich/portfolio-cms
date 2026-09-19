import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Проекты",
  description: "Избранные проекты и кейсы.",
};

export default function ProjectsPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Проекты</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        Список проектов появится здесь после подключения базы данных.
      </p>
    </div>
  );
}
