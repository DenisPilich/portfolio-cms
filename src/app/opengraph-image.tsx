import { ImageResponse } from "next/og";
import { loadOgFonts, OG_SIZE } from "@/lib/og-fonts";
import { siteConfig } from "@/lib/site";

export const runtime = "nodejs";
export const alt = siteConfig.description;
export const size = OG_SIZE;
export const contentType = "image/png";

/**
 * Обложка для главной страницы.
 *
 * Файл с таким именем Next.js подхватывает автоматически и подставляет
 * в метатеги og:image — вручную прописывать путь не нужно.
 */
export default async function OpengraphImage() {
  const fonts = await loadOgFonts();

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
        <div style={{ fontSize: 28, color: "#8fa0ff", letterSpacing: 2 }}>
          {siteConfig.role}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 88, fontWeight: 700, lineHeight: 1.1 }}>
            {siteConfig.name}
          </div>
          <div style={{ fontSize: 32, color: "#9aa4b8", lineHeight: 1.4 }}>
            {siteConfig.description}
          </div>
        </div>

        <div style={{ fontSize: 26, color: "#6b7488" }}>
          {siteConfig.url.replace(/^https?:\/\//, "")}
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
