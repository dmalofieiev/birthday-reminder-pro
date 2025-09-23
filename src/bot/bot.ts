import { Telegraf } from "telegraf";
import { AuthContext, authMiddleware } from "./middleware/auth.middleware";
import { languageMiddleware } from "./middleware/language.middleware";
import { createValidationMiddleware } from "./middleware/validation.middleware";

// Импорт обработчиков
import {
  registerMenuHandlers,
  registerBirthdayPaginationHandlers,
} from "./handlers/menu.handlers";
import { registerBirthdayHandlers } from "./handlers/birthday.handlers";
import { registerSettingsHandlers } from "./handlers/settings.handlers";
import { registerLanguageHandlers } from "./handlers/language.handlers";

export function createBot(token: string): Telegraf<AuthContext> {
  const bot = new Telegraf<AuthContext>(token);

  // Подключаем middleware
  bot.use(languageMiddleware);
  bot.use(authMiddleware);
  bot.use(createValidationMiddleware());

  // Обработчик для неизвестных callback_data
  bot.action("noop", async (ctx) => {
    await ctx.answerCbQuery();
  });

  // Регистрируем обработчики
  registerLanguageHandlers(bot);
  registerMenuHandlers(bot);
  registerBirthdayPaginationHandlers(bot);
  registerBirthdayHandlers(bot);
  registerSettingsHandlers(bot);

  // Обработчик ошибок
  bot.catch((err, ctx) => {
    console.error("Bot error:", err);
    console.error("Context:", ctx);

    try {
      ctx.reply(
        "❌ Произошла ошибка. Попробуйте еще раз или обратитесь к администратору."
      );
    } catch (replyError) {
      console.error("Error sending error message:", replyError);
    }
  });

  return bot;
}
