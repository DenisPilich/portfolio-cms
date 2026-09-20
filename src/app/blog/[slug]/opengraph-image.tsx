import { ImageResponse } from "next/og";
import { loadOgFonts, OG_SIZE } from "@/lib/og-fonts";
import { getPostBySlug } from "@/lib/queries";
import { formatDate } from "@/lib/format";
import { siteConfig } from "@/lib/site";

export const runtime = "nodejs";
export const alt = "Обложка статьи";
export const size = OG_SIZE;
export const contentType = "image/png";

/**
 * Обложка статьи генерируется на лету: заголовок и дата берутся из базы,
 * поэтому картинка всегда соответствует тексту и не нужно заранее
 * готовить изображение для каждой публикации.
 */
export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  const fonts = await loadOgFonts();

  const title = post?.title ?? siteConfig.name;
  const meta = post
    ? `${formatDate(post.publishedAt)} · ${post.readingTime} мин чтения`
    : siteConfig.role;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#101319",
          color: "#f2f4f8",
          padding: 80,
          fontFamily: "Inter",
        }}
      >
        {/*
          Текст собран в одну строку шаблона, а не как несколько выражений
          подряд: Satori требует явный display: flex у контейнера, у которого
          больше одного дочернего узла, и падает с ошибкой на соседних
          текстовых фрагментах.
        */}
        <div style={{ fontSize: 28, color: "#8fa0ff", letterSpacing: 2 }}>
          {`${siteConfig.name} · блог`}
        </div>

        <div
          style={{
            fontSize: title.length > 60 ? 64 : 78,
            fontWeight: 700,
            lineHeight: 1.15,
          }}
        >
          {title}
        </div>

        <div style={{ fontSize: 28, color: "#6b7488" }}>{meta}</div>
      </div>
    ),
    { ...size, fonts },
  );
}
