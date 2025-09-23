import dotenv from "dotenv";
import { createBot } from "./bot/bot";

// Загружаем переменные окружения
dotenv.config();

async function main() {
  // Проверяем наличие необходимых переменных окружения
  const requiredEnvVars = {
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    DATABASE_URL: process.env.DATABASE_URL,
  };

  for (const [name, value] of Object.entries(requiredEnvVars)) {
    if (!value) {
      console.error(`❌ Отсутствует переменная окружения: ${name}`);
      process.exit(1);
    }
  }

  console.log("🚀 Запуск Birthday Reminder Pro...");

  try {
    // Создаем и запускаем бота
    const bot = createBot(process.env.TELEGRAM_BOT_TOKEN!);

    // Graceful shutdown
    process.once("SIGINT", () => {
      console.log("\n🛑 Получен сигнал SIGINT. Завершение работы...");
      bot.stop("SIGINT");
    });

    process.once("SIGTERM", () => {
      console.log("\n🛑 Получен сигнал SIGTERM. Завершение работы...");
      bot.stop("SIGTERM");
    });

    // Запускаем бота
    await bot.launch();
    console.log("✅ Бот запущен успешно!");
    console.log("📋 Доступные команды:");
    console.log("  /start - Запуск бота");
    console.log("  /menu - Главное меню");
  } catch (error) {
    console.error("❌ Ошибка при запуске бота:", error);
    process.exit(1);
  }
}

// Обработка необработанных ошибок
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception thrown:", error);
  process.exit(1);
});

// Запускаем приложение
main().catch((error) => {
  console.error("❌ Критическая ошибка:", error);
  process.exit(1);
});
