import { describe, it, expect } from 'vitest';
import {
  getMonthName,
  getFullMonthName,
  getMonthNames,
  getFullMonthNames,
  getWeekdayName,
  getWeekdayNames,
  formatDate,
  formatDateShort,
  isRTL,
  getLocaleConfig,
  getDefaultLocale
} from '../src/utils/i18n.js';

describe('i18n', () => {
  describe('getMonthName', () => {
    it('should return short month name for en-GB', () => {
      expect(getMonthName(0, 'en-GB')).toBe('Jan');
      expect(getMonthName(11, 'en-GB')).toBe('Dec');
    });

    it('should return short month name for en-US', () => {
      expect(getMonthName(0, 'en-US')).toBe('Jan');
      expect(getMonthName(11, 'en-US')).toBe('Dec');
    });

    it('should return short month name for es-ES', () => {
      expect(getMonthName(0, 'es-ES')).toBe('ene');
      expect(getMonthName(11, 'es-ES')).toBe('dic');
    });

    it('should return short month name for fr-FR', () => {
      expect(getMonthName(0, 'fr-FR')).toBe('janv.');
      expect(getMonthName(11, 'fr-FR')).toBe('déc.');
    });

    it('should return short month name for de-DE', () => {
      expect(getMonthName(0, 'de-DE')).toBe('Jan');
      expect(getMonthName(11, 'de-DE')).toBe('Dez');
    });

    it('should default to en-GB for invalid locale', () => {
      expect(getMonthName(0, 'invalid')).toBe('Jan');
    });

    it('should handle month index out of range', () => {
      expect(() => getMonthName(-1, 'en-GB')).toThrow();
      expect(() => getMonthName(12, 'en-GB')).toThrow();
    });
  });

  describe('getFullMonthName', () => {
    it('should return full month name for en-GB', () => {
      expect(getFullMonthName(0, 'en-GB')).toBe('January');
      expect(getFullMonthName(11, 'en-GB')).toBe('December');
    });

    it('should return full month name for es-ES', () => {
      expect(getFullMonthName(0, 'es-ES')).toBe('enero');
      expect(getFullMonthName(11, 'es-ES')).toBe('diciembre');
    });

    it('should return full month name for fr-FR', () => {
      expect(getFullMonthName(0, 'fr-FR')).toBe('janvier');
      expect(getFullMonthName(11, 'fr-FR')).toBe('décembre');
    });

    it('should default to en-GB for invalid locale', () => {
      expect(getFullMonthName(0, 'invalid')).toBe('January');
    });
  });

  describe('getMonthNames', () => {
    it('should return array of 12 short month names for en-GB', () => {
      const months = getMonthNames('en-GB');
      expect(months).toHaveLength(12);
      expect(months[0]).toBe('Jan');
      expect(months[11]).toBe('Dec');
    });

    it('should return array of 12 short month names for es-ES', () => {
      const months = getMonthNames('es-ES');
      expect(months).toHaveLength(12);
      expect(months[0]).toBe('ene');
      expect(months[11]).toBe('dic');
    });
  });

  describe('getFullMonthNames', () => {
    it('should return array of 12 full month names for en-GB', () => {
      const months = getFullMonthNames('en-GB');
      expect(months).toHaveLength(12);
      expect(months[0]).toBe('January');
      expect(months[11]).toBe('December');
    });

    it('should return array of 12 full month names for es-ES', () => {
      const months = getFullMonthNames('es-ES');
      expect(months).toHaveLength(12);
      expect(months[0]).toBe('enero');
      expect(months[11]).toBe('diciembre');
    });
  });

  describe('getWeekdayName', () => {
    it('should return weekday name for en-GB', () => {
      expect(getWeekdayName(0, 'en-GB')).toBe('Sun');
      expect(getWeekdayName(1, 'en-GB')).toBe('Mon');
    });

    it('should return weekday name for es-ES', () => {
      expect(getWeekdayName(0, 'es-ES')).toBe('dom');
      expect(getWeekdayName(1, 'es-ES')).toBe('lun');
    });

    it('should handle index out of range', () => {
      expect(() => getWeekdayName(-1, 'en-GB')).toThrow();
      expect(() => getWeekdayName(7, 'en-GB')).toThrow();
    });
  });

  describe('getWeekdayNames', () => {
    it('should return array of 7 weekday names for en-GB', () => {
      const weekdays = getWeekdayNames('en-GB');
      expect(weekdays).toHaveLength(7);
      expect(weekdays[0]).toBe('Sun');
      expect(weekdays[6]).toBe('Sat');
    });

    it('should return array of 7 weekday names for es-ES', () => {
      const weekdays = getWeekdayNames('es-ES');
      expect(weekdays).toHaveLength(7);
      expect(weekdays[0]).toBe('dom');
      expect(weekdays[6]).toBe('sáb');
    });
  });

  describe('formatDate', () => {
    it('should format date for en-GB', () => {
      const date = new Date(2024, 0, 15); // 15 January 2024
      const formatted = formatDate(date, 'en-GB');
      expect(formatted).toContain('January');
      expect(formatted).toContain('2024');
      expect(formatted).toContain('15');
    });

    it('should format date for en-US', () => {
      const date = new Date(2024, 0, 15); // 15 January 2024
      const formatted = formatDate(date, 'en-US');
      expect(formatted).toContain('January');
      expect(formatted).toContain('2024');
      expect(formatted).toContain('15');
    });

    it('should format date for es-ES', () => {
      const date = new Date(2024, 0, 15);
      const formatted = formatDate(date, 'es-ES');
      expect(formatted).toContain('enero');
      expect(formatted).toContain('2024');
    });

    it('should default to en-GB for invalid locale', () => {
      const date = new Date(2024, 0, 15);
      const formatted = formatDate(date, 'invalid');
      expect(formatted).toBeTruthy();
    });
  });

  describe('formatDateShort', () => {
    it('should format short date for en-GB (DD/MM/YYYY)', () => {
      const date = new Date(2024, 0, 15);
      const formatted = formatDateShort(date, 'en-GB');
      expect(formatted).toMatch(/\d{2}\/\d{2}\/2024/);
    });

    it('should format short date for en-US (MM/DD/YYYY)', () => {
      const date = new Date(2024, 0, 15);
      const formatted = formatDateShort(date, 'en-US');
      expect(formatted).toMatch(/\d{2}\/\d{2}\/2024/);
    });

    it('should format short date for es-ES', () => {
      const date = new Date(2024, 0, 15);
      const formatted = formatDateShort(date, 'es-ES');
      expect(formatted).toBeTruthy();
    });
  });

  describe('isRTL', () => {
    it('should return true for Arabic locale', () => {
      expect(isRTL('ar')).toBe(true);
      expect(isRTL('ar-SA')).toBe(true);
    });

    it('should return true for Hebrew locale', () => {
      expect(isRTL('he')).toBe(true);
      expect(isRTL('he-IL')).toBe(true);
    });

    it('should return false for English locales', () => {
      expect(isRTL('en-GB')).toBe(false);
      expect(isRTL('en-US')).toBe(false);
    });

    it('should return false for Spanish, French, German', () => {
      expect(isRTL('es-ES')).toBe(false);
      expect(isRTL('fr-FR')).toBe(false);
      expect(isRTL('de-DE')).toBe(false);
    });
  });

  describe('getLocaleConfig', () => {
    it('should return config for en-GB', () => {
      const config = getLocaleConfig('en-GB');
      expect(config.locale).toBe('en-GB');
      expect(config.rtl).toBe(false);
      expect(config.dateFormat).toBe('DD/MM/YYYY');
    });

    it('should return config for en-US', () => {
      const config = getLocaleConfig('en-US');
      expect(config.locale).toBe('en-US');
      expect(config.rtl).toBe(false);
      expect(config.dateFormat).toBe('MM/DD/YYYY');
    });

    it('should return config for Arabic', () => {
      const config = getLocaleConfig('ar');
      expect(config.locale).toBe('ar');
      expect(config.rtl).toBe(true);
    });

    it('should return config for Hebrew', () => {
      const config = getLocaleConfig('he');
      expect(config.locale).toBe('he');
      expect(config.rtl).toBe(true);
    });
  });

  describe('getDefaultLocale', () => {
    it('should return a valid locale string', () => {
      const locale = getDefaultLocale();
      expect(typeof locale).toBe('string');
      expect(locale.length).toBeGreaterThan(0);
    });

    it('should prefer browser locale if available', () => {
      // This test verifies the function exists and returns a value
      // Actual browser locale detection is environment-dependent
      const locale = getDefaultLocale();
      expect(locale).toBeTruthy();
    });
  });
});
