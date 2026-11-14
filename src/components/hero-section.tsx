import Link from "next/link";
import { ArrowDown, Send } from "lucide-react";
import { siteConfig } from "@/lib/site";
import { HeroScene } from "@/components/hero-scene";

/**
 * Первый экран.
 *
 * Построен как на референсе: мелкое приветствие, крупное имя, под ним
 * описание. Имя — главный визуальный акцент, поэтому оно набрано заметно
 * крупнее остального, а приветствие вынесено в моноширинную строку.
 *
 * Фраза разбита на слова, каждое появляется со своей задержкой — эффект
 * «печати» без JavaScript: всё делает CSS-анимация, а задержка считается
 * от позиции слова.
 *
 * Запуск анимации ждёт заставку: CSS-анимация стартует в момент отрисовки,
 * а заставка закрывает экран больше секунды. Без этой связки зритель видел бы
 * не начало фразы, а её хвост. Класс page-ready ставит загрузчик, а правила
 * живут в globals.css рядом с остальными анимациями.
 *
 * Компонент серверный: интерактивности нет, поэтому в бандл не попадает.
 */
export function HeroSection() {
  const nameWords = `${siteConfig.name}.`.split(" ");
  const introWords = siteConfig.hero.intro.split(" ");

  // Задержки идут одним потоком: имя, затем описание. Считаем их от общего
  // счётчика, иначе после имени была бы пауза на всю длину фразы.
  const introOffset = nameWords.length;

  return (
    <section
      id="about"
      className="grid scroll-mt-24 items-center gap-12 py-16 sm:py-24 lg:grid-cols-2 lg:gap-16"
    >
      <div>
        <p className="font-mono text-sm tracking-[0.2em] text-primary uppercase">
          {siteConfig.hero.greeting}
        </p>

        <h1 className="mt-4 text-4xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
          {nameWords.map((word, index) => (
            <span
              key={`${word}-${index}`}
              style={{ animationDelay: `${index * 55}ms` }}
              className="hero-reveal mr-[0.25em] inline-block bg-gradient-to-br from-foreground via-foreground to-primary bg-clip-text text-transparent"
            >
              {word}
            </span>
          ))}
        </h1>

        <p className="mt-6 max-w-xl text-lg text-pretty text-muted-foreground sm:text-xl">
          {introWords.map((word, index) => (
            <span
              key={`${word}-${index}`}
              style={{
                animationDelay: `${(introOffset + index) * 45}ms`,
              }}
              className="hero-reveal mr-[0.25em] inline-block"
            >
              {word}
            </span>
          ))}
        </p>

        <p
          style={{ animationDelay: `${(introOffset + introWords.length) * 45}ms` }}
          className="hero-reveal mt-6 font-mono text-sm text-primary"
        >
          {siteConfig.role}
        </p>

        <div
          style={{
            animationDelay: `${(introOffset + introWords.length) * 45 + 100}ms`,
          }}
          className="hero-reveal mt-9 flex flex-wrap gap-3"
        >
          <Link
            href="#portfolio"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            View my work
            <ArrowDown className="size-4" aria-hidden />
          </Link>
          <Link
            href="#contacts"
            className="inline-flex items-center gap-2 rounded-md border border-border px-5 py-3 text-sm font-medium transition-colors hover:bg-muted"
          >
            <Send className="size-4" aria-hidden />
            Get in touch
          </Link>
        </div>
      </div>

      <HeroScene />
    </section>
  );
}
