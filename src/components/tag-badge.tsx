import Link from "next/link";
import type { Tag } from "@/generated/prisma/client";

type TagLike = Pick<Tag, "slug" | "name">;

/** Метка тега. Внутри карточки — статичная, вне её — ссылка на фильтр. */
export function TagBadge({ tag, count }: { tag: TagLike; count?: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">
      {tag.name}
      {count !== undefined && <span className="font-mono">{count}</span>}
    </span>
  );
}

export function TagLink({
  tag,
  count,
  active = false,
}: {
  tag: TagLike;
  count?: number;
  active?: boolean;
}) {
  return (
    <Link
      href={active ? "/blog" : `/blog?tag=${encodeURIComponent(tag.slug)}`}
      className={
        active
          ? "inline-flex items-center gap-1.5 rounded-full border border-primary bg-primary px-2.5 py-1 text-xs text-primary-foreground"
          : "inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground"
      }
    >
      {tag.name}
      {count !== undefined && <span className="font-mono">{count}</span>}
    </Link>
  );
}
