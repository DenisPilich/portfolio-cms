import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock } from "lucide-react";
import { Markdown } from "@/components/markdown";
import { TagBadge } from "@/components/tag-badge";
import { formatDate } from "@/lib/format";
import { getPostBySlug, getRecentPosts } from "@/lib/queries";

export async function generateStaticParams() {
  const posts = await getRecentPosts(1000);
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return { title: "Статья не найдена" };
  }

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      publishedTime: post.publishedAt?.toISOString(),
      tags: post.tags.map((tag) => tag.name),
    },
  };
}

export default async function PostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="mx-auto w-full max-w-3xl px-6 py-16">
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Все статьи
      </Link>

      <header className="mt-8">
        <h1 className="text-3xl font-semibold tracking-tight text-balance">
          {post.title}
        </h1>

        <p className="mt-4 text-lg text-pretty text-muted-foreground">
          {post.excerpt}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <time dateTime={post.publishedAt?.toISOString()}>
            {formatDate(post.publishedAt)}
          </time>
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-4" aria-hidden />
            {post.readingTime} мин чтения
          </span>
        </div>

        {post.tags.length > 0 && (
          <ul className="mt-6 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <li key={tag.id}>
                <TagBadge tag={tag} />
              </li>
            ))}
          </ul>
        )}
      </header>

      <div className="mt-10">
        <Markdown>{post.content}</Markdown>
      </div>
    </article>
  );
}
