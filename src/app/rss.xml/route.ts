import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/site";

/**
 * Лента RSS.
 *
 * Это Route Handler, а не страница: он возвращает не разметку, а XML.
 * Отдавать ленту самостоятельно полезно и для портфолио — читалки и
 * агрегаторы подписываются именно на такие адреса.
 */
export const revalidate = 3600;

/**
 * Текст из базы попадает внутрь XML, поэтому его нужно экранировать:
 * случайный символ «<» в заголовке сломал бы весь документ.
 */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
    take: 20,
    select: {
      slug: true,
      title: true,
      excerpt: true,
      publishedAt: true,
    },
  });

  const items = posts
    .map((post) => {
      const url = `${siteConfig.url}/blog/${post.slug}`;
      const pubDate = (post.publishedAt ?? new Date()).toUTCString();

      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(post.excerpt)}</description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteConfig.name)} — блог</title>
    <link>${siteConfig.url}/blog</link>
    <description>${escapeXml(siteConfig.description)}</description>
    <language>ru</language>
    <atom:link href="${siteConfig.url}/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
