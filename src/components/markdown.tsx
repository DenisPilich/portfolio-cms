import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Рендер Markdown.
 *
 * react-markdown собирает дерево React-элементов, а не вставляет HTML-строку
 * через dangerouslySetInnerHTML. Это принципиально: HTML из базы не попадает
 * в страницу как разметка, поэтому XSS через содержимое статьи невозможен.
 *
 * remark-gfm добавляет таблицы, списки задач и зачёркивание — то, чего нет
 * в базовом Markdown.
 */
export function Markdown({ children }: { children: string }) {
  return (
    <div className="prose prose-neutral max-w-none dark:prose-invert prose-headings:tracking-tight prose-a:text-primary prose-code:font-mono prose-pre:bg-muted prose-pre:text-foreground">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}
