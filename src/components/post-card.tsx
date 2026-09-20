import Link from "next/link";
import { Clock } from "lucide-react";
import { formatDate, toIsoDate } from "@/lib/format";
import { TagBadge } from "@/components/tag-badge";
import type { Post, Tag } from "@/generated/prisma/client";

type PostWithTags = Post & { tags: Tag[] };

export function PostCard({ post }: { post: PostWithTags }) {
  return (
    <article className="flex flex-col rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary/60">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <time dateTime={toIsoDate(post.publishedAt)}>
          {formatDate(post.publishedAt)}
        </time>
        <span aria-hidden>·</span>
        <span className="inline-flex items-center gap-1">
          <Clock className="size-3.5" aria-hidden />
          {post.readingTime} мин
        </span>
      </div>

      <h3 className="mt-3 text-lg font-semibold tracking-tight">
        <Link
          href={`/blog/${post.slug}`}
          className="transition-colors hover:text-primary"
        >
          {post.title}
        </Link>
      </h3>

      <p className="mt-3 flex-1 text-sm text-pretty text-muted-foreground">
        {post.excerpt}
      </p>

      {post.tags.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <li key={tag.id}>
              <TagBadge tag={tag} />
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
