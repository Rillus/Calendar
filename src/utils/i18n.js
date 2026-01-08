/*******************************/
/* Internationalisation (i18n) */
/*******************************/

/**
 * Gets the default locale from browser or falls back to en-GB
 * @returns {string} Locale string (e.g., 'en-GB', 'en-US', 'es-ES')
 */
export function getDefaultLocale() {
  if (typeof navigator !== 'undefined' && navigator.language) {
    return navigator.language;
  }
  return 'en-GB';
}

/**
 * Checks if a locale uses right-to-left (RTL) text direction
 * @param {string} locale - Locale string (e.g., 'ar', 'he-IL')
 * @returns {boolean} True if RTL, false otherwise
 */
export function isRTL(locale) {
  const rtlLocales = ['ar', 'he', 'fa', 'ur', 'yi'];
  const localeCode = locale.split('-')[0].toLowerCase();
  return rtlLocales.includes(localeCode);
}

/**
 * Gets short month name for a given month index (0-11) and locale
 * @param {number} monthIndex - Month index (0=January, 11=December)
 * @param {string} [locale='en-GB'] - Locale string
 * @returns {string} Short month name
 */
export function getMonthName(monthIndex, locale = 'en-GB') {
  if (monthIndex < 0 || monthIndex > 11) {
    throw new Error(`Invalid month index: ${monthIndex}. Must be 0-11.`);
  }

  try {
    const date = new Date(2024, monthIndex, 1);
    const formatter = new Intl.DateTimeFormat(locale, { month: 'short' });
    return formatter.format(date);
  } catch (error) {
    // Fallback to en-GB if locale is invalid
    const date = new Date(2024, monthIndex, 1);
    const formatter = new Intl.DateTimeFormat('en-GB', { month: 'short' });
    return formatter.format(date);
  }
}

/**
 * Gets full month name for a given month index (0-11) and locale
 * @param {number} monthIndex - Month index (0=January, 11=December)
 * @param {string} [locale='en-GB'] - Locale string
 * @returns {string} Full month name
 */
export function getFullMonthName(monthIndex, locale = 'en-GB') {
  if (monthIndex < 0 || monthIndex > 11) {
    throw new Error(`Invalid month index: ${monthIndex}. Must be 0-11.`);
  }

  try {
    const date = new Date(2024, monthIndex, 1);
    const formatter = new Intl.DateTimeFormat(locale, { month: 'long' });
    return formatter.format(date);
  } catch (error) {
    // Fallback to en-GB if locale is invalid
    const date = new Date(2024, monthIndex, 1);
    const formatter = new Intl.DateTimeFormat('en-GB', { month: 'long' });
    return formatter.format(date);
  }
}

/**
 * Gets array of 12 short month names for a locale
 * @param {string} [locale='en-GB'] - Locale string
 * @returns {string[]} Array of 12 short month names
 */
export function getMonthNames(locale = 'en-GB') {
  return Array.from({ length: 12 }, (_, i) => getMonthName(i, locale));
}

/**
 * Gets array of 12 full month names for a locale
 * @param {string} [locale='en-GB'] - Locale string
 * @returns {string[]} Array of 12 full month names
 */
export function getFullMonthNames(locale = 'en-GB') {
  return Array.from({ length: 12 }, (_, i) => getFullMonthName(i, locale));
}

/**
 * Gets short weekday name for a given weekday index (0-6) and locale
 * @param {number} weekdayIndex - Weekday index (0=Sunday, 6=Saturday)
 * @param {string} [locale='en-GB'] - Locale string
 * @returns {string} Short weekday name
 */
export function getWeekdayName(weekdayIndex, locale = 'en-GB') {
  if (weekdayIndex < 0 || weekdayIndex > 6) {
    throw new Error(`Invalid weekday index: ${weekdayIndex}. Must be 0-6.`);
  }

  try {
    // Use a known Sunday as base (2024-01-07 was a Sunday)
    const baseDate = new Date(2024, 0, 7);
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() + weekdayIndex);
    const formatter = new Intl.DateTimeFormat(locale, { weekday: 'short' });
    return formatter.format(date);
  } catch (error) {
    // Fallback to en-GB if locale is invalid
    const baseDate = new Date(2024, 0, 7);
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() + weekdayIndex);
    const formatter = new Intl.DateTimeFormat('en-GB', { weekday: 'short' });
    return formatter.format(date);
  }
}

/**
 * Gets array of 7 short weekday names for a locale (Sunday to Saturday)
 * @param {string} [locale='en-GB'] - Locale string
 * @returns {string[]} Array of 7 short weekday names
 */
export function getWeekdayNames(locale = 'en-GB') {
  return Array.from({ length: 7 }, (_, i) => getWeekdayName(i, locale));
}

/**
 * Formats a date using locale-specific long format
 * @param {Date} date - Date to format
 * @param {string} [locale='en-GB'] - Locale string
 * @returns {string} Formatted date string
 */
export function formatDate(date, locale = 'en-GB') {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error('Invalid date provided');
  }

  try {
    const formatter = new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    return formatter.format(date);
  } catch (error) {
    // Fallback to en-GB if locale is invalid
    const formatter = new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    return formatter.format(date);
  }
}

/**
 * Formats a date using locale-specific short format (DD/MM/YYYY or MM/DD/YYYY)
 * @param {Date} date - Date to format
 * @param {string} [locale='en-GB'] - Locale string
 * @returns {string} Formatted date string
 */
export function formatDateShort(date, locale = 'en-GB') {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error('Invalid date provided');
  }

  try {
    const formatter = new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    return formatter.format(date);
  } catch (error) {
    // Fallback to en-GB if locale is invalid
    const formatter = new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    return formatter.format(date);
  }
}

/**
 * Gets locale configuration including RTL and date format preferences
 * @param {string} [locale] - Locale string (defaults to browser locale)
 * @returns {object} Locale configuration object
 */
export function getLocaleConfig(locale) {
  const effectiveLocale = locale || getDefaultLocale();
  const rtl = isRTL(effectiveLocale);

  // Determine date format based on locale
  let dateFormat = 'DD/MM/YYYY'; // Default to UK format
  if (effectiveLocale.startsWith('en-US')) {
    dateFormat = 'MM/DD/YYYY';
  } else if (effectiveLocale.startsWith('en-CA')) {
    dateFormat = 'YYYY-MM-DD'; // ISO format for Canada
  } else if (effectiveLocale.startsWith('ja') || effectiveLocale.startsWith('zh')) {
    dateFormat = 'YYYY-MM-DD'; // ISO format for Japanese/Chinese
  }

  return {
    locale: effectiveLocale,
    rtl,
    dateFormat
  };
}
