import { Telegraf } from "telegraf";
import { AuthContext } from "../middleware/auth.middleware";
import {
  createMainMenuKeyboard,
  createLanguageSelectionKeyboard,
} from "../keyboards/main.keyboards";
import { getBirthdaysByUserId } from "../../database/models/birthday.model";
import { createBirthdayListKeyboard } from "../keyboards/birthday.keyboards";
import { createSettingsKeyboard } from "../keyboards/settings.keyboards";
import { getUpcomingBirthdays } from "../../database/models/birthday.model";
import {
  sortBirthdaysByProximity,
  formatBirthdayMessage,
} from "../../utils/helpers";

export function registerMenuHandlers(bot: Telegraf<AuthContext>) {
  // Команда /start
  bot.start(async (ctx) => {
    const welcomeMessage =
      ctx.t("welcome.title") + "\n\n" + ctx.t("welcome.description");

    await ctx.reply(welcomeMessage, {
      reply_markup: createMainMenuKeyboard(ctx.t),
    });
  });

  // Команда /menu - показать главное меню
  bot.command("menu", async (ctx) => {
    await showMainMenu(ctx);
  });

  // Обработчик для главного меню
  bot.action("menu:main", async (ctx) => {
    await showMainMenu(ctx);
  });

  // Мои дни рождения
  bot.action("menu:my_birthdays", async (ctx) => {
    await showMyBirthdays(ctx);
  });

  // Добавить день рождения
  bot.action("menu:add_birthday", async (ctx) => {
    await startAddingBirthday(ctx);
  });

  // Ближайшие 30 дней
  bot.action("menu:upcoming", async (ctx) => {
    await showUpcomingBirthdays(ctx);
  });

  // Настройки
  bot.action("menu:settings", async (ctx) => {
    await showSettings(ctx);
  });
}

async function showMainMenu(ctx: AuthContext) {
  const message = `👋 ${ctx.user.firstName || "Привет"}!\n\n${ctx.t(
    "welcome.description"
  )}`;

  try {
    await ctx.editMessageText(message, {
      reply_markup: createMainMenuKeyboard(ctx.t),
    });
  } catch (error) {
    // Если не удалось отредактировать, отправляем новое сообщение
    await ctx.reply(message, {
      reply_markup: createMainMenuKeyboard(ctx.t),
    });
  }
}

async function showMyBirthdays(ctx: AuthContext, page: number = 1) {
  try {
    const birthdays = await getBirthdaysByUserId(ctx.user.id);

    if (birthdays.length === 0) {
      await ctx.editMessageText(
        `📝 ${ctx.t("notifications.noBirthdays")}\n\n${ctx.t(
          "menu.addBirthday"
        )}?`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: ctx.t("menu.addBirthday"),
                  callback_data: "menu:add_birthday",
                },
              ],
              [{ text: ctx.t("common.back"), callback_data: "menu:main" }],
            ],
          },
        }
      );
      return;
    }

    const sortedBirthdays = sortBirthdaysByProximity(birthdays);
    const message = `👥 ${ctx.t("menu.myBirthdays")} (${birthdays.length})`;

    await ctx.editMessageText(message, {
      reply_markup: createBirthdayListKeyboard(
        ctx.t,
        sortedBirthdays,
        ctx.language,
        page
      ),
    });
  } catch (error) {
    console.error("Error showing birthdays:", error);
    await ctx.answerCbQuery("❌ Ошибка при загрузке данных");
  }
}

async function startAddingBirthday(ctx: AuthContext) {
  // Устанавливаем состояние для добавления дня рождения
  ctx.session?.setState?.("adding_birthday_name");

  await ctx.editMessageText(ctx.t("birthday.enterName"), {
    reply_markup: {
      inline_keyboard: [
        [{ text: ctx.t("common.cancel"), callback_data: "menu:main" }],
      ],
    },
  });
}

async function showUpcomingBirthdays(ctx: AuthContext) {
  try {
    const birthdays = await getUpcomingBirthdays(ctx.user.id, 30);

    if (birthdays.length === 0) {
      await ctx.editMessageText(
        `📅 ${ctx.t("notifications.noBirthdays")} в ближайшие 30 дней`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: ctx.t("menu.addBirthday"),
                  callback_data: "menu:add_birthday",
                },
              ],
              [{ text: ctx.t("common.back"), callback_data: "menu:main" }],
            ],
          },
        }
      );
      return;
    }

    const sortedBirthdays = sortBirthdaysByProximity(birthdays);
    let message = `📅 ${ctx.t("menu.upcoming30Days")}:\n\n`;

    sortedBirthdays.slice(0, 10).forEach((birthday) => {
      message += formatBirthdayMessage(birthday, ctx.language) + "\n";
    });

    if (sortedBirthdays.length > 10) {
      message += `\n... и еще ${sortedBirthdays.length - 10}`;
    }

    await ctx.editMessageText(message, {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: ctx.t("menu.addBirthday"),
              callback_data: "menu:add_birthday",
            },
          ],
          [{ text: ctx.t("common.back"), callback_data: "menu:main" }],
        ],
      },
    });
  } catch (error) {
    console.error("Error showing upcoming birthdays:", error);
    await ctx.answerCbQuery("❌ Ошибка при загрузке данных");
  }
}

async function showSettings(ctx: AuthContext) {
  await ctx.editMessageText(`⚙️ ${ctx.t("menu.settings")}`, {
    reply_markup: createSettingsKeyboard(ctx.t),
  });
}

// Обработчик для пагинации дней рождения
export function registerBirthdayPaginationHandlers(bot: Telegraf<AuthContext>) {
  bot.action(/^birthdays:page:(\d+)$/, async (ctx) => {
    const page = parseInt(ctx.match[1], 10);
    await showMyBirthdays(ctx, page);
  });
}
