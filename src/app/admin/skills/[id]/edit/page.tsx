import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { updateSkillAction } from "@/actions/skills";
import { prisma } from "@/lib/prisma";
import { SkillForm } from "@/components/admin/skill-form";

export const metadata: Metadata = {
  title: "Редактирование навыка",
  robots: { index: false, follow: false },
};

export default async function EditSkillPage({
  params,
}: PageProps<"/admin/skills/[id]/edit">) {
  const { id } = await params;

  const skill = await prisma.skill.findUnique({ where: { id } });

  if (!skill) {
    notFound();
  }

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
        Редактирование навыка
      </h1>

      <div className="mt-8">
        <SkillForm
          action={updateSkillAction}
          skillId={skill.id}
          defaultValues={{
            name: skill.name,
            description: skill.description,
            category: skill.category,
            icon: skill.icon,
            position: skill.position,
          }}
        />
      </div>
    </div>
  );
}
