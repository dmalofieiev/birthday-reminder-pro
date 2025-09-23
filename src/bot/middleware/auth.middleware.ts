import { Context } from "telegraf";
import { createUser, getUserById } from "../../database/models/user.model";
import { detectLanguage, SupportedLanguage } from "../../locales";
import { LanguageContext } from "./language.middleware";

export interface AuthContext extends LanguageContext {
  user: {
    id: number;
    telegramId: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    language: SupportedLanguage;
    notificationTime: string;
    notificationsEnabled: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
}

export async function authMiddleware(ctx: Context, next: () => Promise<void>) {
  const authCtx = ctx as AuthContext;
  const telegramId = ctx.from?.id.toString();

  if (!telegramId) {
    await ctx.reply("❌ Ошибка аутентификации");
    return;
  }

  try {
    // Проверяем, существует ли пользователь в БД
    let user = await getUserById(telegramId);

    if (!user) {
      // Создаем нового пользователя
      const detectedLanguage = detectLanguage(ctx.from?.language_code);

      user = await createUser({
        telegramId,
        firstName: ctx.from?.first_name,
        lastName: ctx.from?.last_name,
        username: ctx.from?.username,
        language: detectedLanguage,
      });

      console.log(`Created new user: ${telegramId} (${user.firstName})`);
    }

    // Добавляем пользователя в контекст
    authCtx.user = user;
  } catch (error) {
    console.error("Auth middleware error:", error);
    await ctx.reply("❌ Ошибка при работе с базой данных");
    return;
  }

  return next();
}
