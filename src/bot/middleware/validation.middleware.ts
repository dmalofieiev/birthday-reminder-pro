import { Context } from "telegraf";
import { LanguageContext } from "./language.middleware";

export interface ValidationContext extends LanguageContext {
  session: {
    state?: string;
    data?: any;
    setState?: (state: string, data?: any) => void;
    clearState?: () => void;
    getData?: (key?: string) => any;
    setData?: (key: string, value: any) => void;
  };
}

// Простая реализация сессий в памяти
// В продакшне лучше использовать Redis или базу данных
const sessions = new Map<string, any>();

export function createValidationMiddleware() {
  return async (ctx: Context, next: () => Promise<void>) => {
    const validationCtx = ctx as ValidationContext;
    const userId = ctx.from?.id.toString();

    if (!userId) {
      return next();
    }

    // Инициализируем сессию
    if (!sessions.has(userId)) {
      sessions.set(userId, { state: null, data: {} });
    }

    validationCtx.session = sessions.get(userId);

    // Добавляем методы для работы с сессией
    validationCtx.session.setState = (state: string, data?: any) => {
      const session = sessions.get(userId) || {};
      session.state = state;
      if (data) {
        session.data = { ...session.data, ...data };
      }
      sessions.set(userId, session);
    };

    validationCtx.session.clearState = () => {
      const session = sessions.get(userId) || {};
      session.state = null;
      session.data = {};
      sessions.set(userId, session);
    };

    validationCtx.session.getData = (key?: string) => {
      const session = sessions.get(userId) || {};
      return key ? session.data?.[key] : session.data;
    };

    validationCtx.session.setData = (key: string, value: any) => {
      const session = sessions.get(userId) || { data: {} };
      if (!session.data) session.data = {};
      session.data[key] = value;
      sessions.set(userId, session);
    };

    return next();
  };
}

// Функция для очистки старых сессий (можно вызывать периодически)
export function cleanupSessions() {
  // В реальном приложении здесь была бы логика очистки по времени
  // sessions.clear();
}
