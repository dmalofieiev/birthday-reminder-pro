import en from "./en.json";
import ru from "./ru.json";
import es from "./es.json";

export type SupportedLanguage = "en" | "ru" | "es";

export const locales = {
  en,
  ru,
  es,
};

export const defaultLanguage: SupportedLanguage = "en";

export const supportedLanguages: SupportedLanguage[] = ["en", "ru", "es"];

export function t(language: SupportedLanguage, key: string): string {
  const locale = locales[language] || locales[defaultLanguage];

  const keys = key.split(".");
  let value: any = locale;

  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) break;
  }

  return value || key;
}

export function detectLanguage(
  telegramLanguageCode?: string
): SupportedLanguage {
  if (!telegramLanguageCode) return defaultLanguage;

  const langCode = telegramLanguageCode.toLowerCase().split("-")[0];

  switch (langCode) {
    case "ru":
      return "ru";
    case "es":
      return "es";
    case "en":
    default:
      return "en";
  }
}
