-- Четыре уровня владения вместо трёх.
-- Переименование сохраняет позицию значения в enum, поэтому шкала остаётся упорядоченной.
ALTER TYPE "SkillLevel" RENAME VALUE 'CONFIDENT' TO 'PRACTICAL';
ALTER TYPE "SkillLevel" ADD VALUE 'EXPERT';
