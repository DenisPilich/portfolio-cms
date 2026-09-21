import Link from "next/link";
import { ArrowDown, Send } from "lucide-react";
import { siteConfig } from "@/lib/site";
import { HeroScene } from "@/components/hero-scene";

/**
 * Первый экран.
 *
 * Фраза приветствия разбита на слова, каждое появляется со своей задержкой —
 * получается эффект «печати», но без JavaScript: всё делает CSS-анимация,
 * а задержка считается от позиции слова в предложении.
 *
 * Компонент серверный: интерактивности нет, поэтому в бандл не попадает.
 */
export function HeroSection() {
  const sentence = `${siteConfig.hero.greeting} ${siteConfig.name}. ${siteConfig.hero.intro}`;
  const words = sentence.split(" ");

  return (
    <section
      id="about"
      className="grid scroll-mt-24 items-center gap-12 py-16 sm:py-24 lg:grid-cols-2"
    >
      <div>
        <h1 className="text-3xl leading-tight font-semibold tracking-tight text-balance sm:text-4xl lg:text-5xl">
          {words.map((word, index) => (
            <span
              key={`${word}-${index}`}
              style={{ animationDelay: `${index * 55}ms` }}
              className="mr-[0.25em] inline-block animate-fade-in-up"
            >
              {word}
            </span>
          ))}
        </h1>

        <p
          style={{ animationDelay: `${words.length * 55 + 100}ms` }}
          className="mt-6 animate-fade-in-up font-mono text-sm text-primary"
        >
          {siteConfig.role}
        </p>

        <div
          style={{ animationDelay: `${words.length * 55 + 200}ms` }}
          className="mt-9 flex animate-fade-in-up flex-wrap gap-3"
        >
          <Link
            href="#portfolio"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Смотреть работы
            <ArrowDown className="size-4" aria-hidden />
          </Link>
          <Link
            href="#contacts"
            className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
          >
            <Send className="size-4" aria-hidden />
            Связаться
          </Link>
        </div>
      </div>

      <HeroScene />
    </section>
  );
}
