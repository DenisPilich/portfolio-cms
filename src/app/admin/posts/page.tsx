import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { deletePostAction } from "@/actions/posts";
import { prisma } from "@/lib/prisma";
import { formatShortDate } from "@/lib/format";
import { DeleteButton } from "@/components/admin/delete-button";

export const metadata: Metadata = {
  title: "Статьи",
  robots: { index: false, follow: false },
};

export default async function AdminPostsPage() {
  const posts = await prisma.post.findMany({
    orderBy: { updatedAt: "desc" },
    include: { tags: true },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Статьи</h1>
        <Link
          href="/admin/posts/new"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Plus className="size-4" aria-hidden />
          Написать
        </Link>
      </div>

      {posts.length === 0 ? (
        <p className="mt-8 rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          Статей пока нет. Напишите первую.
        </p>
      ) : (
        <ul className="mt-8 divide-y divide-border rounded-lg border border-border">
          {posts.map((post) => (
            <li
              key={post.id}
              className="flex flex-wrap items-center justify-between gap-4 p-4"
            >
              <div className="min-w-0">
                <Link
                  href={`/admin/posts/${post.id}/edit`}
                  className="truncate font-medium transition-colors hover:text-primary"
                >
                  {post.title}
                </Link>
                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  /{post.slug} · {post.readingTime} мин · {post.views} просмотров
                  · {formatShortDate(post.updatedAt)}
                </p>
                {post.tags.length > 0 && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {post.tags.map((tag) => tag.name).join(", ")}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={
                    post.published
                      ? "rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-600 dark:text-emerald-400"
                      : "rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground"
                  }
                >
                  {post.published ? "опубликована" : "черновик"}
                </span>

                <Link
                  href={`/admin/posts/${post.id}/edit`}
                  className="rounded-md border border-border px-3 py-1.5 text-sm transition-colors hover:bg-muted"
                >
                  Изменить
                </Link>

                <form action={deletePostAction}>
                  <input type="hidden" name="id" value={post.id} />
                  <input type="hidden" name="slug" value={post.slug} />
                  <DeleteButton label={post.title} />
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
