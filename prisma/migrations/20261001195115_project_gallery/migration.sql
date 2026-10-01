-- Галерея проекта: отдельная таблица вместо массива ссылок.
-- У снимка есть alt-подпись и собственный порядок, а связь с проектом
-- объявлена с ON DELETE CASCADE -- при удалении проекта снимки уходят с ним.
CREATE TABLE "project_images" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_images_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "project_images_projectId_position_idx" ON "project_images"("projectId", "position");

ALTER TABLE "project_images"
    ADD CONSTRAINT "project_images_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "projects"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;