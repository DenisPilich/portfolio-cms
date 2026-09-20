import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { updatePostAction } from "@/actions/posts";
import { prisma } from "@/lib/prisma";
import { PostForm } from "@/components/admin/post-form";

export const metadata: Metadata = {
  title: "Редактирование статьи",
  robots: { index: false, follow: false },
};

export default async function EditPostPage({
  params,
}: PageProps<"/admin/posts/[id]/edit">) {
  const { id } = await params;

  const post = await prisma.post.findUnique({
    where: { id },
    include: { tags: true },
  });

  if (!post) {
    notFound();
  }

  return (
    <div>
      <Link
        href="/admin/posts"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        К списку статей
      </Link>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">
          Редактирование статьи
        </h1>
        {post.published && (
          <Link
            href={`/blog/${post.slug}`}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Открыть на сайте →
          </Link>
        )}
      </div>

      <div className="mt-8">
        <PostForm
          action={updatePostAction}
          postId={post.id}
          defaultValues={{
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt,
            content: post.content,
            coverImage: post.coverImage,
            tags: post.tags.map((tag) => tag.name),
            published: post.published,
          }}
        />
      </div>
    </div>
  );
}
