import { Telegraf } from "telegraf";
import { AuthContext } from "../middleware/auth.middleware";
import { ValidationContext } from "../middleware/validation.middleware";
import {
  createBirthday,
  getBirthdayById,
  updateBirthday,
  deleteBirthday,
} from "../../database/models/birthday.model";
import {
  createCategorySelectionKeyboard,
  createBirthdayActionsKeyboard,
  createEditBirthdayKeyboard,
  createDeleteConfirmationKeyboard,
} from "../keyboards/birthday.keyboards";
import {
  validateDateString,
  validateName,
  validateCategory,
} from "../../utils/validators";
import {
  parseDate,
  formatDate,
  calculateAge,
  formatBirthdayMessage,
} from "../../utils/helpers";

type BirthdayContext = AuthContext & ValidationContext;

export function registerBirthdayHandlers(bot: Telegraf<BirthdayContext>) {
  // Обработка выбора категории
  bot.action(/^category:(\w+)$/, async (ctx) => {
    const category = ctx.match[1];
    const validation = validateCategory(category);

    if (!validation.isValid) {
      await ctx.answerCbQuery("❌ Неверная категория");
      return;
    }

    ctx.session?.setData?.("category", category);
    ctx.session?.setState?.("adding_birthday_notes");

    await ctx.editMessageText(ctx.t("birthday.enterNotes"), {
      reply_markup: {
        inline_keyboard: [
          [{ text: "⏭️ Пропустить", callback_data: "birthday:skip_notes" }],
          [{ text: ctx.t("common.cancel"), callback_data: "menu:main" }],
        ],
      },
    });
  });

  // Пропустить заметки
  bot.action("birthday:skip_notes", async (ctx) => {
    await saveBirthday(ctx);
  });

  // Сохранить день рождения
  bot.action("birthday:save", async (ctx) => {
    await saveBirthday(ctx);
  });

  // Просмотр дня рождения
  bot.action(/^birthday:view:(\d+)$/, async (ctx) => {
    const birthdayId = parseInt(ctx.match[1], 10);
    await showBirthdayDetails(ctx, birthdayId);
  });

  // Редактирование дня рождения
  bot.action(/^birthday:edit:(\d+)$/, async (ctx) => {
    const birthdayId = parseInt(ctx.match[1], 10);
    await showEditOptions(ctx, birthdayId);
  });

  // Удаление дня рождения
  bot.action(/^birthday:delete:(\d+)$/, async (ctx) => {
    const birthdayId = parseInt(ctx.match[1], 10);
    await showDeleteConfirmation(ctx, birthdayId);
  });

  // Подтверждение удаления
  bot.action(/^birthday:confirm_delete:(\d+)$/, async (ctx) => {
    const birthdayId = parseInt(ctx.match[1], 10);
    await confirmDelete(ctx, birthdayId);
  });

  // Обработка редактирования полей
  bot.action(/^edit:(name|date|category|notes):(\d+)$/, async (ctx) => {
    const field = ctx.match[1];
    const birthdayId = parseInt(ctx.match[2], 10);
    await startEditingField(ctx, field, birthdayId);
  });

  // Обработка текстовых сообщений в зависимости от состояния
  bot.on("text", async (ctx) => {
    const state = ctx.session?.state;

    if (!state) return;

    switch (state) {
      case "adding_birthday_name":
        await handleNameInput(ctx);
        break;
      case "adding_birthday_date":
        await handleDateInput(ctx);
        break;
      case "adding_birthday_notes":
        await handleNotesInput(ctx);
        break;
      case "editing_name":
        await handleEditName(ctx);
        break;
      case "editing_date":
        await handleEditDate(ctx);
        break;
      case "editing_notes":
        await handleEditNotes(ctx);
        break;
    }
  });
}

async function handleNameInput(ctx: BirthdayContext) {
  const name = ctx.message?.text?.trim();

  if (!name) {
    await ctx.reply("❌ Пожалуйста, введите имя");
    return;
  }

  const validation = validateName(name);
  if (!validation.isValid) {
    await ctx.reply(`❌ ${ctx.t(validation.error!)}`);
    return;
  }

  ctx.session?.setData?.("name", validation.value);
  ctx.session?.setState?.("adding_birthday_date");

  await ctx.reply(ctx.t("birthday.enterDate"), {
    reply_markup: {
      inline_keyboard: [
        [{ text: ctx.t("common.cancel"), callback_data: "menu:main" }],
      ],
    },
  });
}

async function handleDateInput(ctx: BirthdayContext) {
  const dateStr = ctx.message?.text?.trim();

  if (!dateStr) {
    await ctx.reply("❌ Пожалуйста, введите дату");
    return;
  }

  const validation = validateDateString(dateStr);
  if (!validation.isValid) {
    await ctx.reply(`❌ ${ctx.t(validation.error!)}`);
    return;
  }

  ctx.session?.setData?.("birthDate", validation.value);

  await ctx.reply(ctx.t("birthday.selectCategory"), {
    reply_markup: createCategorySelectionKeyboard(ctx.t),
  });
}

async function handleNotesInput(ctx: BirthdayContext) {
  const notes = ctx.message?.text?.trim();
  ctx.session?.setData?.("notes", notes || "");
  await saveBirthday(ctx);
}

async function saveBirthday(ctx: BirthdayContext) {
  try {
    const sessionData = ctx.session?.getData?.();
    const { name, birthDate, category, notes } = sessionData;

    if (!name || !birthDate || !category) {
      await ctx.reply("❌ Не хватает данных для сохранения");
      return;
    }

    const birthday = await createBirthday({
      name,
      birthDate: new Date(birthDate),
      category,
      notes: notes || "",
      userId: ctx.user.id,
    });

    ctx.session?.clearState?.();

    const age = calculateAge(birthday.birthDate);
    const message =
      `✅ День рождения добавлен!\n\n` +
      `👤 ${birthday.name}\n` +
      `📅 ${formatDate(birthday.birthDate, ctx.language)}\n` +
      `🎂 Возраст: ${age}\n` +
      `📂 ${ctx.t(`birthday.categories.${category}`)}\n` +
      (notes ? `📝 ${notes}\n` : "");

    await ctx.reply(message, {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: ctx.t("menu.addBirthday"),
              callback_data: "menu:add_birthday",
            },
          ],
          [
            {
              text: ctx.t("menu.myBirthdays"),
              callback_data: "menu:my_birthdays",
            },
          ],
          [{ text: ctx.t("common.back"), callback_data: "menu:main" }],
        ],
      },
    });
  } catch (error) {
    console.error("Error saving birthday:", error);
    await ctx.reply("❌ Ошибка при сохранении");
  }
}

async function showBirthdayDetails(ctx: BirthdayContext, birthdayId: number) {
  try {
    const birthday = await getBirthdayById(birthdayId);

    if (!birthday || birthday.userId !== ctx.user.id) {
      await ctx.answerCbQuery("❌ День рождения не найден");
      return;
    }

    const age = calculateAge(birthday.birthDate);
    const message =
      `👤 ${birthday.name}\n` +
      `📅 ${formatDate(birthday.birthDate, ctx.language)}\n` +
      `🎂 Возраст: ${age}\n` +
      `📂 ${ctx.t(`birthday.categories.${birthday.category}`)}\n` +
      (birthday.notes ? `📝 ${birthday.notes}\n` : "") +
      `\n${formatBirthdayMessage(birthday, ctx.language)}`;

    await ctx.editMessageText(message, {
      reply_markup: createBirthdayActionsKeyboard(ctx.t, birthdayId),
    });
  } catch (error) {
    console.error("Error showing birthday details:", error);
    await ctx.answerCbQuery("❌ Ошибка при загрузке данных");
  }
}

async function showEditOptions(ctx: BirthdayContext, birthdayId: number) {
  await ctx.editMessageText("✏️ Что хотите изменить?", {
    reply_markup: createEditBirthdayKeyboard(ctx.t, birthdayId),
  });
}

async function showDeleteConfirmation(
  ctx: BirthdayContext,
  birthdayId: number
) {
  try {
    const birthday = await getBirthdayById(birthdayId);

    if (!birthday || birthday.userId !== ctx.user.id) {
      await ctx.answerCbQuery("❌ День рождения не найден");
      return;
    }

    await ctx.editMessageText(
      `⚠️ Удалить день рождения?\n\n👤 ${birthday.name}\n📅 ${formatDate(
        birthday.birthDate,
        ctx.language
      )}`,
      {
        reply_markup: createDeleteConfirmationKeyboard(ctx.t, birthdayId),
      }
    );
  } catch (error) {
    console.error("Error showing delete confirmation:", error);
    await ctx.answerCbQuery("❌ Ошибка");
  }
}

async function confirmDelete(ctx: BirthdayContext, birthdayId: number) {
  try {
    const birthday = await getBirthdayById(birthdayId);

    if (!birthday || birthday.userId !== ctx.user.id) {
      await ctx.answerCbQuery("❌ День рождения не найден");
      return;
    }

    await deleteBirthday(birthdayId);

    await ctx.editMessageText(
      `✅ День рождения удален\n\n👤 ${birthday.name}`,
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: ctx.t("menu.myBirthdays"),
                callback_data: "menu:my_birthdays",
              },
            ],
            [{ text: ctx.t("common.back"), callback_data: "menu:main" }],
          ],
        },
      }
    );
  } catch (error) {
    console.error("Error deleting birthday:", error);
    await ctx.answerCbQuery("❌ Ошибка при удалении");
  }
}

async function startEditingField(
  ctx: BirthdayContext,
  field: string,
  birthdayId: number
) {
  ctx.session?.setState?.(`editing_${field}`, { birthdayId });

  const messages = {
    name: "Введите новое имя:",
    date: "Введите новую дату (ДД.ММ.ГГГГ):",
    notes: "Введите новые заметки:",
  };

  await ctx.editMessageText(
    messages[field as keyof typeof messages] || "Введите новое значение:",
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: ctx.t("common.cancel"),
              callback_data: `birthday:view:${birthdayId}`,
            },
          ],
        ],
      },
    }
  );
}

async function handleEditName(ctx: BirthdayContext) {
  const name = ctx.message?.text?.trim();
  const birthdayId = ctx.session?.getData?.("birthdayId");

  if (!name || !birthdayId) {
    await ctx.reply("❌ Ошибка данных");
    return;
  }

  const validation = validateName(name);
  if (!validation.isValid) {
    await ctx.reply(`❌ ${ctx.t(validation.error!)}`);
    return;
  }

  try {
    await updateBirthday(birthdayId, { name: validation.value });
    ctx.session?.clearState?.();

    await ctx.reply("✅ Имя обновлено", {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "👁️ Просмотр",
              callback_data: `birthday:view:${birthdayId}`,
            },
          ],
        ],
      },
    });
  } catch (error) {
    console.error("Error updating name:", error);
    await ctx.reply("❌ Ошибка при обновлении");
  }
}

async function handleEditDate(ctx: BirthdayContext) {
  const dateStr = ctx.message?.text?.trim();
  const birthdayId = ctx.session?.getData?.("birthdayId");

  if (!dateStr || !birthdayId) {
    await ctx.reply("❌ Ошибка данных");
    return;
  }

  const validation = validateDateString(dateStr);
  if (!validation.isValid) {
    await ctx.reply(`❌ ${ctx.t(validation.error!)}`);
    return;
  }

  try {
    await updateBirthday(birthdayId, { birthDate: validation.value });
    ctx.session?.clearState?.();

    await ctx.reply("✅ Дата обновлена", {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "👁️ Просмотр",
              callback_data: `birthday:view:${birthdayId}`,
            },
          ],
        ],
      },
    });
  } catch (error) {
    console.error("Error updating date:", error);
    await ctx.reply("❌ Ошибка при обновлении");
  }
}

async function handleEditNotes(ctx: BirthdayContext) {
  const notes = ctx.message?.text?.trim();
  const birthdayId = ctx.session?.getData?.("birthdayId");

  if (!birthdayId) {
    await ctx.reply("❌ Ошибка данных");
    return;
  }

  try {
    await updateBirthday(birthdayId, { notes: notes || "" });
    ctx.session?.clearState?.();

    await ctx.reply("✅ Заметки обновлены", {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "👁️ Просмотр",
              callback_data: `birthday:view:${birthdayId}`,
            },
          ],
        ],
      },
    });
  } catch (error) {
    console.error("Error updating notes:", error);
    await ctx.reply("❌ Ошибка при обновлении");
  }
}
