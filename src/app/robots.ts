import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

/**
 * Правила для поисковых роботов.
 *
 * Админку и страницу входа закрываем: индексировать их незачем,
 * а в выдаче они выглядели бы мусором.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/login"],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
