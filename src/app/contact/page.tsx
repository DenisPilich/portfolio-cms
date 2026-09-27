import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "How to get in touch and the contact form.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Contact</h1>
      <p className="mt-4 max-w-2xl text-pretty text-muted-foreground">
        Send a message through the form or use any of the links below — I reply
        to the email you leave.
      </p>

      <ul className="mt-6 flex flex-wrap gap-3">
        {siteConfig.socials.map((social) => (
          <li key={social.href}>
            <a
              href={social.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm transition-colors hover:bg-muted"
            >
              {social.label}
            </a>
          </li>
        ))}
      </ul>

      <div className="mt-10">
        <ContactForm />
      </div>
    </div>
  );
}
