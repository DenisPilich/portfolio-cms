import type { Metadata } from "next";
import { Mail, MailOpen } from "lucide-react";
import { deleteMessageAction, toggleMessageReadAction } from "@/actions/messages";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { DeleteButton } from "@/components/admin/delete-button";

export const metadata: Metadata = {
  title: "Сообщения",
  robots: { index: false, follow: false },
};

export default async function AdminMessagesPage() {
  const messages = await prisma.contactMessage.findMany({
    // Непрочитанные сверху: их и нужно обрабатывать первыми
    orderBy: [{ read: "asc" }, { createdAt: "desc" }],
  });

  const unread = messages.filter((message) => !message.read).length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Сообщения</h1>
        {unread > 0 && (
          <span className="rounded-full bg-primary px-3 py-1 text-xs text-primary-foreground">
            непрочитанных: {unread}
          </span>
        )}
      </div>

      <p className="mt-3 text-sm text-muted-foreground">
        Приходят из формы на странице «Контакты».
      </p>

      {messages.length === 0 ? (
        <p className="mt-8 rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          Сообщений пока нет.
        </p>
      ) : (
        <ul className="mt-8 grid gap-4">
          {messages.map((message) => (
            <li
              key={message.id}
              className={
                message.read
                  ? "rounded-lg border border-border bg-card p-5"
                  : "rounded-lg border border-primary/40 bg-card p-5"
              }
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium">
                    {message.name}
                    {!message.read && (
                      <span className="ml-2 rounded-full bg-primary/15 px-2 py-0.5 text-xs text-primary">
                        новое
                      </span>
                    )}
                  </p>
                  <a
                    href={`mailto:${message.email}`}
                    className="mt-1 block font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {message.email}
                  </a>
                </div>

                <time className="font-mono text-xs text-muted-foreground">
                  {formatDate(message.createdAt)}
                </time>
              </div>

              <p className="mt-4 text-sm text-pretty whitespace-pre-line">
                {message.message}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border pt-4">
                <form action={toggleMessageReadAction}>
                  <input type="hidden" name="id" value={message.id} />
                  <input
                    type="hidden"
                    name="read"
                    value={message.read ? "false" : "true"}
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm transition-colors hover:bg-muted"
                  >
                    {message.read ? (
                      <>
                        <Mail className="size-4" aria-hidden />
                        Пометить непрочитанным
                      </>
                    ) : (
                      <>
                        <MailOpen className="size-4" aria-hidden />
                        Пометить прочитанным
                      </>
                    )}
                  </button>
                </form>

                <a
                  href={`mailto:${message.email}?subject=${encodeURIComponent("Ответ на ваше сообщение")}`}
                  className="rounded-md border border-border px-3 py-1.5 text-sm transition-colors hover:bg-muted"
                >
                  Ответить
                </a>

                <form action={deleteMessageAction}>
                  <input type="hidden" name="id" value={message.id} />
                  <DeleteButton label={`сообщение от ${message.name}`} />
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
