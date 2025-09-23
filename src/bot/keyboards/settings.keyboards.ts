import { InlineKeyboardMarkup } from "telegraf/typings/core/types/typegram";
import { LANGUAGE_FLAGS, LANGUAGE_NAMES } from "../../utils/constants";

export function createSettingsKeyboard(
  t: (key: string) => string
): InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [
        { text: t("settings.language"), callback_data: "settings:language" },
        {
          text: t("settings.notificationTime"),
          callback_data: "settings:notification_time",
        },
      ],
      [
        {
          text: t("settings.notifications"),
          callback_data: "settings:notifications",
        },
      ],
      [
        { text: t("settings.exportData"), callback_data: "settings:export" },
        { text: t("settings.importCSV"), callback_data: "settings:import" },
      ],
      [
        {
          text: t("settings.deleteProfile"),
          callback_data: "settings:delete_profile",
        },
      ],
      [{ text: t("common.back"), callback_data: "menu:main" }],
    ],
  };
}

export function createLanguageSettingsKeyboard(
  t: (key: string) => string,
  currentLanguage: string
): InlineKeyboardMarkup {
  const languages = [
    { code: "en", flag: LANGUAGE_FLAGS.en, name: LANGUAGE_NAMES.en },
    { code: "ru", flag: LANGUAGE_FLAGS.ru, name: LANGUAGE_NAMES.ru },
    { code: "es", flag: LANGUAGE_FLAGS.es, name: LANGUAGE_NAMES.es },
  ];

  const keyboard = languages.map((lang) => [
    {
      text: `${lang.flag} ${lang.name} ${
        lang.code === currentLanguage ? "✅" : ""
      }`,
      callback_data: `settings:set_language:${lang.code}`,
    },
  ]);

  keyboard.push([{ text: t("common.back"), callback_data: "menu:settings" }]);

  return { inline_keyboard: keyboard };
}

export function createNotificationToggleKeyboard(
  t: (key: string) => string,
  isEnabled: boolean
): InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [
        {
          text: isEnabled ? "🔔 Включены" : "🔕 Отключены",
          callback_data: `settings:toggle_notifications:${!isEnabled}`,
        },
      ],
      [{ text: t("common.back"), callback_data: "menu:settings" }],
    ],
  };
}

export function createTimeSelectionKeyboard(
  t: (key: string) => string
): InlineKeyboardMarkup {
  const times = [
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
    "21:00",
    "22:00",
  ];

  const keyboard = [];

  // Create rows of 4 time slots each
  for (let i = 0; i < times.length; i += 4) {
    const row = times.slice(i, i + 4).map((time) => ({
      text: time,
      callback_data: `settings:set_time:${time}`,
    }));
    keyboard.push(row);
  }

  // Add custom time option
  keyboard.push([
    { text: "⌚ Свое время", callback_data: "settings:custom_time" },
  ]);

  // Back button
  keyboard.push([{ text: t("common.back"), callback_data: "menu:settings" }]);

  return { inline_keyboard: keyboard };
}

export function createDeleteProfileConfirmationKeyboard(
  t: (key: string) => string
): InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [
        {
          text: "⚠️ Да, удалить все данные",
          callback_data: "settings:confirm_delete_profile",
        },
      ],
      [{ text: t("common.cancel"), callback_data: "menu:settings" }],
    ],
  };
}

export function createExportOptionsKeyboard(
  t: (key: string) => string
): InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [
        { text: "📄 CSV", callback_data: "export:csv" },
        { text: "📊 JSON", callback_data: "export:json" },
      ],
      [{ text: t("common.back"), callback_data: "menu:settings" }],
    ],
  };
}
