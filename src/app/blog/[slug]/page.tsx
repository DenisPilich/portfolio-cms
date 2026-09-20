import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock } from "lucide-react";
import { Markdown } from "@/components/markdown";
import { TagBadge } from "@/components/tag-badge";
import { JsonLd } from "@/components/json-ld";
import { formatDate, toIsoDate } from "@/lib/format";
import { getPostBySlug, getRecentPosts } from "@/lib/queries";
import { siteConfig } from "@/lib/site";

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
    // Канонический адрес: если статью открыли с параметрами вроде ?utm_source,
    // поисковик поймёт, какая версия основная.
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      publishedTime: toIsoDate(post.publishedAt),
      modifiedTime: toIsoDate(post.updatedAt),
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: toIsoDate(post.publishedAt),
    dateModified: toIsoDate(post.updatedAt),
    inLanguage: "ru-RU",
    keywords: post.tags.map((tag) => tag.name).join(", "),
    author: { "@type": "Person", name: siteConfig.name },
    publisher: { "@type": "Person", name: siteConfig.name },
    mainEntityOfPage: `${siteConfig.url}/blog/${post.slug}`,
  };

  return (
    <article className="mx-auto w-full max-w-3xl px-6 py-16">
      <JsonLd data={jsonLd} />
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
          <time dateTime={toIsoDate(post.publishedAt)}>
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
