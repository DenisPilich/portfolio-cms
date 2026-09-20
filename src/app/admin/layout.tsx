import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { requireUser } from "@/lib/auth";
import { AdminNav } from "@/components/admin/admin-nav";

/**
 * Layout админки.
 *
 * Проверка сессии здесь защищает все вложенные страницы разом: layout
 * выполняется до того, как отрендерится конкретный раздел. Важно понимать,
 * что это защита интерфейса, а не данных — сами Server Actions проверяют
 * сессию отдельно, потому что их можно вызвать напрямую.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <AdminNav />

        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {user.name}
          </span>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            На сайт
            <ArrowUpRight className="size-3.5" aria-hidden />
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-md border border-border px-3 py-1.5 text-sm transition-colors hover:bg-muted"
            >
              Выйти
            </button>
          </form>
        </div>
      </div>

      <div className="mt-8">{children}</div>
    </div>
  );
}
