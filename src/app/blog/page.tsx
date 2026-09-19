import type { Metadata } from "next";
import Link from "next/link";
import { PostCard } from "@/components/post-card";
import { TagLink } from "@/components/tag-badge";
import { Pagination } from "@/components/pagination";
import { getPostsPage, getTagsWithCounts } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Блог",
  description: "Технические заметки о Next.js, React и работе с базами данных.",
};

/**
 * В Next.js 15+ searchParams — это Promise, его нужно дожидаться.
 * Значение может быть строкой, массивом (если параметр передан дважды)
 * или отсутствовать, поэтому перед использованием его проверяют.
 */
function parsePage(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number.parseInt(raw ?? "", 10);

  // Мусор в адресной строке не должен ломать страницу: показываем первую.
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export default async function BlogPage({ searchParams }: PageProps<"/blog">) {
  const params = await searchParams;
  const page = parsePage(params.page);
  const activeTag = Array.isArray(params.tag) ? params.tag[0] : params.tag;

  // Два независимых запроса запускаются параллельно, а не по очереди.
  const [{ posts, total, totalPages }, tags] = await Promise.all([
    getPostsPage({ page, tagSlug: activeTag }),
    getTagsWithCounts(),
  ]);

  const activeTagName = tags.find((tag) => tag.slug === activeTag)?.name;

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-16">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Блог</h1>
        <p className="mt-4 max-w-2xl text-pretty text-muted-foreground">
          {activeTagName
            ? `Статьи с тегом «${activeTagName}» — всего ${total}.`
            : "Заметки о том, что разбирал на практике: устройство фреймворка, базы данных, типизация."}
        </p>
      </header>

      {tags.length > 0 && (
        <nav aria-label="Фильтр по тегам" className="mt-8">
          <ul className="flex flex-wrap gap-2">
            <li>
              <Link
                href="/blog"
                className={
                  activeTag
                    ? "inline-flex items-center rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground"
                    : "inline-flex items-center rounded-full border border-primary bg-primary px-2.5 py-1 text-xs text-primary-foreground"
                }
              >
                Все
              </Link>
            </li>
            {tags.map((tag) => (
              <li key={tag.id}>
                <TagLink
                  tag={tag}
                  count={tag._count.posts}
                  active={tag.slug === activeTag}
                />
              </li>
            ))}
          </ul>
        </nav>
      )}

      {posts.length > 0 ? (
        <>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            basePath="/blog"
            tagSlug={activeTag}
          />
        </>
      ) : (
        <p className="mt-10 rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          {activeTag
            ? "С этим тегом статей пока нет."
            : "Пока ни одной статьи не опубликовано."}
        </p>
      )}
    </div>
  );
}
