import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createSkillAction } from "@/actions/skills";
import { SkillForm } from "@/components/admin/skill-form";

export const metadata: Metadata = {
  title: "Новый навык",
  robots: { index: false, follow: false },
};

export default function NewSkillPage() {
  return (
    <div>
      <Link
        href="/admin/skills"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        К списку навыков
      </Link>

      <h1 className="mt-6 text-2xl font-semibold tracking-tight">
        Новый навык
      </h1>

      <div className="mt-8">
        <SkillForm action={createSkillAction} />
      </div>
    </div>
  );
}
