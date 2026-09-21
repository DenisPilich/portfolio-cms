import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { siteConfig } from "@/lib/site";

/**
 * Раздел контактов в конце страницы.
 *
 * Ссылки ведут на внешние профили, а форма живёт на отдельной странице:
 * держать её здесь означало бы тянуть состояние формы в главную.
 */
export function ContactsSection() {
  return (
    <section
      id="contacts"
      className="scroll-mt-24 border-t border-border py-20"
    >
      <h2 className="max-w-2xl text-2xl font-semibold tracking-tight text-balance">
        Хотите что-то спросить?
      </h2>
      <p className="mt-3 max-w-2xl text-pretty text-muted-foreground">
        Напишите удобным способом — отвечаю по будням.
      </p>

      <ul className="mt-8 flex flex-wrap gap-3">
        {siteConfig.socials.map((social) => (
          <li key={social.href}>
            <a
              href={social.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-md border border-border px-4 py-2.5 text-sm transition-colors hover:bg-muted"
            >
              {social.label}
            </a>
          </li>
        ))}
      </ul>

      <Link
        href="/contact"
        className="mt-6 inline-flex items-center gap-2 text-sm text-primary transition-opacity hover:opacity-80"
      >
        Или оставьте сообщение через форму
        <ArrowRight className="size-4" aria-hidden />
      </Link>
    </section>
  );
}
