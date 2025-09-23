import { Telegraf } from "telegraf";
import { AuthContext } from "../middleware/auth.middleware";
import { updateUser } from "../../database/models/user.model";
import { createMainMenuKeyboard } from "../keyboards/main.keyboards";
import { SupportedLanguage } from "../../locales";

export function registerLanguageHandlers(bot: Telegraf<AuthContext>) {
  // Обработка выбора языка при первом запуске
  bot.action(/^lang:(\w+)$/, async (ctx) => {
    const language = ctx.match[1] as SupportedLanguage;

    try {
      // Обновляем язык пользователя в БД
      await updateUser(ctx.user.telegramId, { language });

      // Обновляем контекст
      ctx.user.language = language;
      ctx.language = language;

      // Показываем главное меню на выбранном языке
      const welcomeMessage =
        ctx.t("welcome.title") + "\n\n" + ctx.t("welcome.description");

      await ctx.editMessageText(welcomeMessage, {
        reply_markup: createMainMenuKeyboard(ctx.t),
      });

      await ctx.answerCbQuery(`✅ ${getLanguageName(language)} выбран`);
    } catch (error) {
      console.error("Error setting language:", error);
      await ctx.answerCbQuery("❌ Ошибка при смене языка");
    }
  });
}

function getLanguageName(language: SupportedLanguage): string {
  const names = {
    en: "English",
    ru: "Русский",
    es: "Español",
  };
  return names[language];
}
