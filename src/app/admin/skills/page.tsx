import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { deleteSkillAction } from "@/actions/skills";
import { prisma } from "@/lib/prisma";
import { TechIcon } from "@/components/tech-icon";
import { DeleteButton } from "@/components/admin/delete-button";

export const metadata: Metadata = {
  title: "Навыки",
  robots: { index: false, follow: false },
};

export default async function AdminSkillsPage() {
  const skills = await prisma.skill.findMany({
    orderBy: [{ category: "asc" }, { position: "asc" }, { name: "asc" }],
  });

  const groups = [
    {
      title: "Hard skills",
      items: skills.filter((skill) => skill.category === "HARD"),
    },
    {
      title: "Soft skills",
      items: skills.filter((skill) => skill.category === "SOFT"),
    },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Навыки</h1>
        <Link
          href="/admin/skills/new"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Plus className="size-4" aria-hidden />
          Добавить
        </Link>
      </div>

      <p className="mt-3 text-sm text-muted-foreground">
        Этот список выводится на главной странице в разделе «Что я умею».
      </p>

      {skills.length === 0 ? (
        <p className="mt-8 rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          Навыков пока нет. Добавьте первый.
        </p>
      ) : (
        groups.map((group) =>
          group.items.length > 0 ? (
            <section key={group.title} className="mt-8">
              <h2 className="font-mono text-sm tracking-wide text-muted-foreground uppercase">
                {group.title}
              </h2>

              <ul className="mt-4 divide-y divide-border rounded-lg border border-border">
                {group.items.map((skill) => (
                  <li
                    key={skill.id}
                    className="flex flex-wrap items-center justify-between gap-4 p-4"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                        <TechIcon name={skill.icon ?? skill.name} />
                      </span>

                      <div className="min-w-0">
                        <Link
                          href={`/admin/skills/${skill.id}/edit`}
                          className="font-medium transition-colors hover:text-primary"
                        >
                          {skill.name}
                        </Link>
                        {skill.description && (
                          <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                            {skill.description}
                          </p>
                        )}
                        <p className="mt-1 font-mono text-xs text-muted-foreground">
                          порядок {skill.position}
                          {skill.icon ? ` · ${skill.icon}` : ""}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/skills/${skill.id}/edit`}
                        className="rounded-md border border-border px-3 py-1.5 text-sm transition-colors hover:bg-muted"
                      >
                        Изменить
                      </Link>

                      <form action={deleteSkillAction}>
                        <input type="hidden" name="id" value={skill.id} />
                        <DeleteButton label={skill.name} />
                      </form>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ) : null,
        )
      )}
    </div>
  );
}
