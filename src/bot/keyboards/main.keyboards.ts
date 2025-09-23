import { InlineKeyboardMarkup } from "telegraf/typings/core/types/typegram";
import { LANGUAGE_FLAGS, LANGUAGE_NAMES } from "../../utils/constants";
import { SupportedLanguage } from "../../locales";

export function createMainMenuKeyboard(
  t: (key: string) => string
): InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [
        { text: t("menu.myBirthdays"), callback_data: "menu:my_birthdays" },
        { text: t("menu.addBirthday"), callback_data: "menu:add_birthday" },
      ],
      [{ text: t("menu.upcoming30Days"), callback_data: "menu:upcoming" }],
      [{ text: t("menu.settings"), callback_data: "menu:settings" }],
    ],
  };
}

export function createLanguageSelectionKeyboard(): InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [
        {
          text: `${LANGUAGE_FLAGS.en} ${LANGUAGE_NAMES.en}`,
          callback_data: "lang:en",
        },
        {
          text: `${LANGUAGE_FLAGS.ru} ${LANGUAGE_NAMES.ru}`,
          callback_data: "lang:ru",
        },
      ],
      [
        {
          text: `${LANGUAGE_FLAGS.es} ${LANGUAGE_NAMES.es}`,
          callback_data: "lang:es",
        },
      ],
    ],
  };
}

export function createBackToMainKeyboard(
  t: (key: string) => string
): InlineKeyboardMarkup {
  return {
    inline_keyboard: [[{ text: t("common.back"), callback_data: "menu:main" }]],
  };
}

export function createConfirmationKeyboard(
  t: (key: string) => string,
  confirmAction: string,
  cancelAction: string = "menu:main"
): InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [
        { text: t("common.yes"), callback_data: confirmAction },
        { text: t("common.no"), callback_data: cancelAction },
      ],
    ],
  };
}

export function createPaginationKeyboard(
  t: (key: string) => string,
  currentPage: number,
  totalPages: number,
  baseAction: string
): InlineKeyboardMarkup {
  const keyboard: any[][] = [];

  // Navigation buttons
  const navigationRow = [];

  if (currentPage > 1) {
    navigationRow.push({
      text: "⬅️",
      callback_data: `${baseAction}:${currentPage - 1}`,
    });
  }

  navigationRow.push({
    text: `${currentPage}/${totalPages}`,
    callback_data: "noop",
  });

  if (currentPage < totalPages) {
    navigationRow.push({
      text: "➡️",
      callback_data: `${baseAction}:${currentPage + 1}`,
    });
  }

  if (navigationRow.length > 0) {
    keyboard.push(navigationRow);
  }

  // Back button
  keyboard.push([{ text: t("common.back"), callback_data: "menu:main" }]);

  return { inline_keyboard: keyboard };
}
