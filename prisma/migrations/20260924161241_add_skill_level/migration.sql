-- CreateEnum
CREATE TYPE "SkillLevel" AS ENUM ('LEARNING', 'BASIC', 'CONFIDENT');

-- AlterTable
ALTER TABLE "skills" ADD COLUMN     "level" "SkillLevel" NOT NULL DEFAULT 'BASIC';
