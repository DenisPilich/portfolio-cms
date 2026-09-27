import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/queries";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: "Experience, stack and how I work.",
};

export default async function AboutPage() {
  const settings = await getSiteSettings();
  const about = settings.about;

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">About</h1>

      <p className="mt-6 text-lg text-pretty text-muted-foreground">
        {about ??
          "This text is stored in the database and will be editable from the admin area."}
      </p>

      <dl className="mt-10 grid gap-6 sm:grid-cols-2">
        <div className="rounded-lg border border-border p-5">
          <dt className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
            Focus
          </dt>
          <dd className="mt-2 text-sm">{siteConfig.role}</dd>
        </div>
        <div className="rounded-lg border border-border p-5">
          <dt className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
            Contact
          </dt>
          <dd className="mt-2 text-sm">
            <a
              href={settings.email ? `mailto:${settings.email}` : "#"}
              className="text-primary underline-offset-4 hover:underline"
            >
              {settings.email ?? "set it in the settings"}
            </a>
          </dd>
        </div>
      </dl>
    </div>
  );
}
