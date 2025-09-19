import { Context } from "telegraf";
import { detectLanguage, SupportedLanguage, t } from "../../locales";
import { getUserById, updateUser } from "../../database/models/user.model";

export interface LanguageContext extends Context {
  language: SupportedLanguage;
  t: (key: string) => string;
}

export async function languageMiddleware(
  ctx: Context,
  next: () => Promise<void>
) {
  const langCtx = ctx as LanguageContext;
  const telegramId = ctx.from?.id.toString();

  if (!telegramId) {
    langCtx.language = "en";
    langCtx.t = (key: string) => t("en", key);
    return next();
  }

  try {
    // Получаем пользователя из БД
    const user = await getUserById(telegramId);

    if (user) {
      // Пользователь существует - используем его язык
      langCtx.language = user.language as SupportedLanguage;
    } else {
      // Новый пользователь - определяем язык автоматически
      const detectedLang = detectLanguage(ctx.from?.language_code);
      langCtx.language = detectedLang;

      // Создаем пользователя с определенным языком будет в user.model.ts
    }

    // Добавляем функцию локализации в контекст
    langCtx.t = (key: string) => t(langCtx.language, key);
  } catch (error) {
    console.error("Language middleware error:", error);
    langCtx.language = "en";
    langCtx.t = (key: string) => t("en", key);
  }

  return next();
}
