/**
 * Структурированные данные schema.org.
 *
 * Поисковые системы читают их, чтобы показывать расширенный результат:
 * дату, автора, обложку. Единственное место в проекте, где оправдан
 * dangerouslySetInnerHTML — но перед вставкой символ «<» заменяется
 * на escape-последовательность, иначе закрывающий тег внутри данных
 * позволил бы внедрить произвольную разметку.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
