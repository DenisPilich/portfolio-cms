import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

/**
 * Смена пароля администратора.
 *
 * Запуск:
 *   npm run db:set-password -- admin@example.com новый_надёжный_пароль
 *
 * Для продакшена подставьте продовую строку подключения:
 *   DATABASE_URL="postgresql://..." npm run db:set-password -- admin@example.com "пароль"
 */
async function main() {
  const [email, password] = process.argv.slice(2);

  if (!email || !password) {
    console.error(
      "Укажите email и новый пароль:\n  npm run db:set-password -- admin@example.com новый_пароль",
    );
    process.exit(1);
  }

  if (password.length < 10) {
    console.error("Пароль должен быть не короче 10 символов");
    process.exit(1);
  }

  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL ?? "",
  });
  const prisma = new PrismaClient({ adapter });

  try {
    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.update({
      where: { email },
      data: { passwordHash },
      select: { email: true, name: true },
    });

    console.log(`Пароль обновлён: ${user.email} (${user.name})`);
  } catch {
    console.error(`Пользователь с email ${email} не найден`);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
