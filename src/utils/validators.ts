export interface ValidationResult {
  isValid: boolean;
  error?: string;
  value?: any;
}

export function validateDateString(dateStr: string): ValidationResult {
  // Проверяем формат DD.MM.YYYY
  const dateRegex = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/;
  const match = dateStr.match(dateRegex);

  if (!match) {
    return {
      isValid: false,
      error: "validation.invalidDateFormat",
    };
  }

  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);

  const date = new Date(year, month - 1, day);

  if (
    date.getDate() !== day ||
    date.getMonth() !== month - 1 ||
    date.getFullYear() !== year
  ) {
    return {
      isValid: false,
      error: "validation.invalidDate",
    };
  }

  // Проверяем високосный год для 29 февраля
  if (month === 2 && day === 29 && !isLeapYear(year)) {
    return {
      isValid: false,
      error: "validation.leapYearError",
    };
  }

  // Проверяем, что дата не в будущем
  const currentYear = new Date().getFullYear();
  if (year > currentYear || year < 1900) {
    return {
      isValid: false,
      error: "validation.invalidDate",
    };
  }

  return {
    isValid: true,
    value: date,
  };
}

export function validateTime(timeStr: string): ValidationResult {
  const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
  const match = timeStr.match(timeRegex);

  if (!match) {
    return {
      isValid: false,
      error: "validation.invalidTimeFormat",
    };
  }

  return {
    isValid: true,
    value: timeStr,
  };
}

export function validateName(name: string): ValidationResult {
  const trimmedName = name.trim();

  if (trimmedName.length < 1) {
    return {
      isValid: false,
      error: "validation.nameRequired",
    };
  }

  if (trimmedName.length > 100) {
    return {
      isValid: false,
      error: "validation.nameTooLong",
    };
  }

  return {
    isValid: true,
    value: trimmedName,
  };
}

export function validateCategory(category: string): ValidationResult {
  const validCategories = ["family", "friends", "colleagues", "other"];

  if (!validCategories.includes(category)) {
    return {
      isValid: false,
      error: "validation.invalidCategory",
    };
  }

  return {
    isValid: true,
    value: category,
  };
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}
