import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/queries";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Обо мне",
  description: "Опыт, стек и подход к работе.",
};

export default async function AboutPage() {
  const settings = await getSiteSettings();
  const about = settings.about;

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Обо мне</h1>

      <p className="mt-6 text-lg text-pretty text-muted-foreground">
        {about ??
          "Текст этого раздела хранится в базе и будет редактироваться из админки."}
      </p>

      <dl className="mt-10 grid gap-6 sm:grid-cols-2">
        <div className="rounded-lg border border-border p-5">
          <dt className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
            Специализация
          </dt>
          <dd className="mt-2 text-sm">{siteConfig.role}</dd>
        </div>
        <div className="rounded-lg border border-border p-5">
          <dt className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
            Контакты
          </dt>
          <dd className="mt-2 text-sm">
            <a
              href={settings.email ? `mailto:${settings.email}` : "#"}
              className="text-primary underline-offset-4 hover:underline"
            >
              {settings.email ?? "укажите в настройках"}
            </a>
          </dd>
        </div>
      </dl>
    </div>
  );
}
