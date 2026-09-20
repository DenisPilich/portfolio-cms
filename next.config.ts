import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Обложки хранятся в Vercel Blob, поэтому их домен нужно разрешить
   * для оптимизатора изображений: без этого next/image откажется
   * отдавать внешний файл.
   */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
