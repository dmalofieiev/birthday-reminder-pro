import { Telegraf } from "telegraf";
import { AuthContext } from "../middleware/auth.middleware";
import { ValidationContext } from "../middleware/validation.middleware";
import { updateUser, deleteUser } from "../../database/models/user.model";
import {
  createLanguageSettingsKeyboard,
  createNotificationToggleKeyboard,
  createTimeSelectionKeyboard,
  createDeleteProfileConfirmationKeyboard,
  createExportOptionsKeyboard,
} from "../keyboards/settings.keyboards";
import { validateTime } from "../../utils/validators";
import { SupportedLanguage } from "../../locales";

type SettingsContext = AuthContext & ValidationContext;

export function registerSettingsHandlers(bot: Telegraf<SettingsContext>) {
  // Языковые настройки
  bot.action("settings:language", async (ctx) => {
    await ctx.editMessageText("🌐 Выберите язык:", {
      reply_markup: createLanguageSettingsKeyboard(ctx.t, ctx.user.language),
    });
  });

  // Установка языка
  bot.action(/^settings:set_language:(\w+)$/, async (ctx) => {
    const language = ctx.match[1] as SupportedLanguage;

    try {
      await updateUser(ctx.user.telegramId, { language });

      // Обновляем контекст
      ctx.user.language = language;
      ctx.language = language;

      await ctx.answerCbQuery("✅ Язык изменен");
      await ctx.editMessageText("✅ Язык успешно изменен", {
        reply_markup: {
          inline_keyboard: [
            [{ text: "⬅️ Назад", callback_data: "menu:settings" }],
          ],
        },
      });
    } catch (error) {
      console.error("Error updating language:", error);
      await ctx.answerCbQuery("❌ Ошибка при изменении языка");
    }
  });

  // Настройки уведомлений
  bot.action("settings:notifications", async (ctx) => {
    await ctx.editMessageText("🔔 Уведомления:", {
      reply_markup: createNotificationToggleKeyboard(
        ctx.t,
        ctx.user.notificationsEnabled
      ),
    });
  });

  // Переключение уведомлений
  bot.action(/^settings:toggle_notifications:(true|false)$/, async (ctx) => {
    const enabled = ctx.match[1] === "true";

    try {
      await updateUser(ctx.user.telegramId, { notificationsEnabled: enabled });
      ctx.user.notificationsEnabled = enabled;

      await ctx.answerCbQuery(
        `✅ Уведомления ${enabled ? "включены" : "отключены"}`
      );
      await ctx.editMessageText("🔔 Уведомления:", {
        reply_markup: createNotificationToggleKeyboard(ctx.t, enabled),
      });
    } catch (error) {
      console.error("Error toggling notifications:", error);
      await ctx.answerCbQuery("❌ Ошибка");
    }
  });

  // Время уведомлений
  bot.action("settings:notification_time", async (ctx) => {
    await ctx.editMessageText(
      `⏰ Текущее время уведомлений: ${ctx.user.notificationTime}\n\nВыберите новое время:`,
      {
        reply_markup: createTimeSelectionKeyboard(ctx.t),
      }
    );
  });

  // Установка времени
  bot.action(/^settings:set_time:(\d{2}:\d{2})$/, async (ctx) => {
    const time = ctx.match[1];

    try {
      await updateUser(ctx.user.telegramId, { notificationTime: time });
      ctx.user.notificationTime = time;

      await ctx.answerCbQuery("✅ Время обновлено");
      await ctx.editMessageText(`✅ Время уведомлений изменено на ${time}`, {
        reply_markup: {
          inline_keyboard: [
            [{ text: "⬅️ Назад", callback_data: "menu:settings" }],
          ],
        },
      });
    } catch (error) {
      console.error("Error updating notification time:", error);
      await ctx.answerCbQuery("❌ Ошибка");
    }
  });

  // Кастомное время
  bot.action("settings:custom_time", async (ctx) => {
    ctx.session?.setState?.("setting_custom_time");

    await ctx.editMessageText(
      "⌚ Введите время в формате ЧЧ:ММ (например, 09:30):",
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "❌ Отмена",
                callback_data: "settings:notification_time",
              },
            ],
          ],
        },
      }
    );
  });

  // Экспорт данных
  bot.action("settings:export", async (ctx) => {
    await ctx.editMessageText("📤 Выберите формат экспорта:", {
      reply_markup: createExportOptionsKeyboard(ctx.t),
    });
  });

  // Экспорт в CSV
  bot.action("export:csv", async (ctx) => {
    await exportUserData(ctx, "csv");
  });

  // Экспорт в JSON
  bot.action("export:json", async (ctx) => {
    await exportUserData(ctx, "json");
  });

  // Импорт CSV
  bot.action("settings:import", async (ctx) => {
    ctx.session?.setState?.("importing_csv");

    await ctx.editMessageText(
      "📥 Отправьте CSV файл с днями рождения.\n\n" +
        "Формат: Имя,Дата,Категория,Заметки\n" +
        "Пример: Иван Петров,15.03.1990,friends,Лучший друг",
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: "❌ Отмена", callback_data: "menu:settings" }],
          ],
        },
      }
    );
  });

  // Удаление профиля
  bot.action("settings:delete_profile", async (ctx) => {
    await ctx.editMessageText(
      "⚠️ ВНИМАНИЕ!\n\n" +
        "Это действие удалит ВСЕ ваши данные:\n" +
        "• Все дни рождения\n" +
        "• Настройки\n" +
        "• Историю\n\n" +
        "Данные нельзя будет восстановить!",
      {
        reply_markup: createDeleteProfileConfirmationKeyboard(ctx.t),
      }
    );
  });

  // Подтверждение удаления профиля
  bot.action("settings:confirm_delete_profile", async (ctx) => {
    try {
      await deleteUser(ctx.user.telegramId);

      await ctx.editMessageText(
        "✅ Профиль удален\n\n" +
          "Все ваши данные были удалены из системы.\n" +
          "Спасибо за использование Birthday Reminder Pro!\n" +
          "\nДля повторного использования отправьте /start"
      );
    } catch (error) {
      console.error("Error deleting profile:", error);
      await ctx.answerCbQuery("❌ Ошибка при удалении профиля");
    }
  });

  // Обработка текстовых сообщений для настроек
  bot.on("text", async (ctx) => {
    const state = ctx.session?.state;

    if (state === "setting_custom_time") {
      await handleCustomTimeInput(ctx);
    }
  });

  // Обработка файлов для импорта
  bot.on("document", async (ctx) => {
    const state = ctx.session?.state;

    if (state === "importing_csv") {
      await handleCSVImport(ctx);
    }
  });
}

async function handleCustomTimeInput(ctx: SettingsContext) {
  const timeStr = ctx.message?.text?.trim();

  if (!timeStr) {
    await ctx.reply("❌ Пожалуйста, введите время");
    return;
  }

  const validation = validateTime(timeStr);
  if (!validation.isValid) {
    await ctx.reply(
      "❌ Неверный формат времени. Используйте ЧЧ:ММ (например, 09:30)"
    );
    return;
  }

  try {
    await updateUser(ctx.user.telegramId, {
      notificationTime: validation.value,
    });
    ctx.user.notificationTime = validation.value;
    ctx.session?.clearState?.();

    await ctx.reply(`✅ Время уведомлений изменено на ${validation.value}`, {
      reply_markup: {
        inline_keyboard: [
          [{ text: "⬅️ Назад", callback_data: "menu:settings" }],
        ],
      },
    });
  } catch (error) {
    console.error("Error updating custom time:", error);
    await ctx.reply("❌ Ошибка при обновлении времени");
  }
}

async function exportUserData(ctx: SettingsContext, format: "csv" | "json") {
  try {
    // Здесь будет логика экспорта, пока заглушка
    await ctx.answerCbQuery("🔄 Экспорт в разработке...");

    // TODO: Implement actual export logic
    await ctx.editMessageText(
      `📤 Экспорт в ${format.toUpperCase()} формате будет добавлен в следующих версиях`,
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: "⬅️ Назад", callback_data: "menu:settings" }],
          ],
        },
      }
    );
  } catch (error) {
    console.error("Error exporting data:", error);
    await ctx.answerCbQuery("❌ Ошибка экспорта");
  }
}

async function handleCSVImport(ctx: SettingsContext) {
  try {
    // Здесь будет логика импорта CSV, пока заглушка
    ctx.session?.clearState?.();

    await ctx.reply("📥 Импорт CSV будет добавлен в следующих версиях", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "⬅️ Назад", callback_data: "menu:settings" }],
        ],
      },
    });
  } catch (error) {
    console.error("Error importing CSV:", error);
    await ctx.reply("❌ Ошибка при импорте файла");
  }
}
