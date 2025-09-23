import { InlineKeyboardMarkup } from "telegraf/typings/core/types/typegram";
import { Birthday } from "@prisma/client";
import { formatBirthdayMessage } from "../../utils/helpers";

export function createCategorySelectionKeyboard(
  t: (key: string) => string
): InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [
        {
          text: t("birthday.categories.family"),
          callback_data: "category:family",
        },
        {
          text: t("birthday.categories.friends"),
          callback_data: "category:friends",
        },
      ],
      [
        {
          text: t("birthday.categories.colleagues"),
          callback_data: "category:colleagues",
        },
        {
          text: t("birthday.categories.other"),
          callback_data: "category:other",
        },
      ],
      [{ text: t("common.cancel"), callback_data: "menu:main" }],
    ],
  };
}

export function createBirthdayActionsKeyboard(
  t: (key: string) => string,
  birthdayId: number
): InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [
        {
          text: t("common.edit"),
          callback_data: `birthday:edit:${birthdayId}`,
        },
        {
          text: t("common.delete"),
          callback_data: `birthday:delete:${birthdayId}`,
        },
      ],
      [{ text: t("common.back"), callback_data: "menu:my_birthdays" }],
    ],
  };
}

export function createBirthdayListKeyboard(
  t: (key: string) => string,
  birthdays: Birthday[],
  language: string,
  page: number = 1,
  itemsPerPage: number = 5
): InlineKeyboardMarkup {
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageBirthdays = birthdays.slice(startIndex, endIndex);

  const keyboard: any[][] = [];

  // Birthday items
  currentPageBirthdays.forEach((birthday) => {
    const displayText = formatBirthdayMessage(birthday, language);
    keyboard.push([
      {
        text: displayText,
        callback_data: `birthday:view:${birthday.id}`,
      },
    ]);
  });

  // Pagination
  const totalPages = Math.ceil(birthdays.length / itemsPerPage);
  if (totalPages > 1) {
    const paginationRow = [];

    if (page > 1) {
      paginationRow.push({
        text: "⬅️",
        callback_data: `birthdays:page:${page - 1}`,
      });
    }

    paginationRow.push({
      text: `${page}/${totalPages}`,
      callback_data: "noop",
    });

    if (page < totalPages) {
      paginationRow.push({
        text: "➡️",
        callback_data: `birthdays:page:${page + 1}`,
      });
    }

    keyboard.push(paginationRow);
  }

  // Add new birthday button
  keyboard.push([
    { text: t("menu.addBirthday"), callback_data: "menu:add_birthday" },
  ]);

  // Back to main menu
  keyboard.push([{ text: t("common.back"), callback_data: "menu:main" }]);

  return { inline_keyboard: keyboard };
}

export function createEditBirthdayKeyboard(
  t: (key: string) => string,
  birthdayId: number
): InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [
        { text: "👤 Имя", callback_data: `edit:name:${birthdayId}` },
        { text: "📅 Дата", callback_data: `edit:date:${birthdayId}` },
      ],
      [
        { text: "📂 Категория", callback_data: `edit:category:${birthdayId}` },
        { text: "📝 Заметки", callback_data: `edit:notes:${birthdayId}` },
      ],
      [
        {
          text: t("common.back"),
          callback_data: `birthday:view:${birthdayId}`,
        },
      ],
    ],
  };
}

export function createDeleteConfirmationKeyboard(
  t: (key: string) => string,
  birthdayId: number
): InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [
        {
          text: t("common.yes"),
          callback_data: `birthday:confirm_delete:${birthdayId}`,
        },
        { text: t("common.no"), callback_data: `birthday:view:${birthdayId}` },
      ],
    ],
  };
}

export function createSaveBirthdayKeyboard(
  t: (key: string) => string
): InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [
        { text: t("common.save"), callback_data: "birthday:save" },
        { text: t("common.cancel"), callback_data: "menu:main" },
      ],
    ],
  };
}
