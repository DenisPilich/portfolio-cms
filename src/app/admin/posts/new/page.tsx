import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createPostAction } from "@/actions/posts";
import { PostForm } from "@/components/admin/post-form";

export const metadata: Metadata = {
  title: "Новая статья",
  robots: { index: false, follow: false },
};

export default function NewPostPage() {
  return (
    <div>
      <Link
        href="/admin/posts"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        К списку статей
      </Link>

      <h1 className="mt-6 text-2xl font-semibold tracking-tight">Новая статья</h1>

      <div className="mt-8">
        <PostForm action={createPostAction} />
      </div>
    </div>
  );
}
