import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatShortDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Админка",
  robots: { index: false, follow: false },
};

export default async function AdminDashboardPage() {
  // Счётчики считаются одним обращением: $transaction объединяет запросы,
  // и они уходят в базу параллельно.
  const [
    projectsTotal,
    projectsDraft,
    postsTotal,
    postsDraft,
    messagesUnread,
    recentProjects,
    recentPosts,
  ] = await prisma.$transaction([
    prisma.project.count(),
    prisma.project.count({ where: { published: false } }),
    prisma.post.count(),
    prisma.post.count({ where: { published: false } }),
    prisma.contactMessage.count({ where: { read: false } }),
    prisma.project.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: { id: true, title: true, published: true, updatedAt: true },
    }),
    prisma.post.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: { id: true, title: true, published: true, updatedAt: true },
    }),
  ]);

  const stats = [
    { label: "Проектов", value: projectsTotal, hint: `${projectsDraft} черновиков` },
    { label: "Статей", value: postsTotal, hint: `${postsDraft} черновиков` },
    { label: "Сообщений", value: messagesUnread, hint: "непрочитанных" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Обзор</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg border border-border p-5">
            <p className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
              {stat.label}
            </p>
            <p className="mt-2 text-3xl font-semibold tabular-nums">
              {stat.value}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{stat.hint}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-8 sm:grid-cols-2">
        <section>
          <div className="flex items-baseline justify-between">
            <h2 className="font-medium">Недавние проекты</h2>
            <Link
              href="/admin/projects"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Все
            </Link>
          </div>
          <ul className="mt-3 divide-y divide-border rounded-lg border border-border">
            {recentProjects.map((project) => (
              <li key={project.id}>
                <Link
                  href={`/admin/projects/${project.id}/edit`}
                  className="flex items-center justify-between gap-3 px-4 py-3 text-sm transition-colors hover:bg-muted"
                >
                  <span className="truncate">{project.title}</span>
                  <span className="shrink-0 font-mono text-xs text-muted-foreground">
                    {project.published ? "опубл." : "черновик"} ·{" "}
                    {formatShortDate(project.updatedAt)}
                  </span>
                </Link>
              </li>
            ))}
            {recentProjects.length === 0 && (
              <li className="px-4 py-3 text-sm text-muted-foreground">
                Пока ничего нет
              </li>
            )}
          </ul>
        </section>

        <section>
          <div className="flex items-baseline justify-between">
            <h2 className="font-medium">Недавние статьи</h2>
            <Link
              href="/admin/posts"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Все
            </Link>
          </div>
          <ul className="mt-3 divide-y divide-border rounded-lg border border-border">
            {recentPosts.map((post) => (
              <li key={post.id}>
                <Link
                  href={`/admin/posts/${post.id}/edit`}
                  className="flex items-center justify-between gap-3 px-4 py-3 text-sm transition-colors hover:bg-muted"
                >
                  <span className="truncate">{post.title}</span>
                  <span className="shrink-0 font-mono text-xs text-muted-foreground">
                    {post.published ? "опубл." : "черновик"} ·{" "}
                    {formatShortDate(post.updatedAt)}
                  </span>
                </Link>
              </li>
            ))}
            {recentPosts.length === 0 && (
              <li className="px-4 py-3 text-sm text-muted-foreground">
                Пока ничего нет
              </li>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
