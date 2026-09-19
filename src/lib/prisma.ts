import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

/**
 * Единственный экземпляр Prisma Client на всё приложение.
 *
 * Зачем singleton: в режиме разработки Next.js перезагружает модули при каждом
 * изменении файла. Если создавать клиент на уровне модуля без защиты, каждый
 * перезапуск открывал бы новый пул соединений, и база быстро упёрлась бы
 * в лимит подключений. Поэтому экземпляр кладётся в globalThis, который
 * переживает перезагрузку модулей.
 *
 * В продакшене модуль загружается один раз, и globalThis не нужен.
 */
function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "Не задана переменная окружения DATABASE_URL. Скопируйте .env.example в .env и укажите строку подключения.",
    );
  }

  // В Prisma 7 клиент не работает без драйвер-адаптера: именно адаптер
  // отвечает за соединение и пул, клиент лишь формирует SQL.
  const adapter = new PrismaPg({ connectionString });

  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as {
  prisma?: ReturnType<typeof createPrismaClient>;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
