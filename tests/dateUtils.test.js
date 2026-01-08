import { describe, it, expect } from 'vitest';
import { isLeapYear, getDaysInMonth, formatDate, formatTime, formatDateWithTime } from '../src/utils/dateUtils.js';

describe('dateUtils', () => {
  describe('isLeapYear', () => {
    it('should return true for year 2000 (divisible by 400)', () => {
      expect(isLeapYear(2000)).toBe(true);
    });

    it('should return true for year 2004 (divisible by 4, not by 100)', () => {
      expect(isLeapYear(2004)).toBe(true);
    });

    it('should return true for year 2020 (divisible by 4, not by 100)', () => {
      expect(isLeapYear(2020)).toBe(true);
    });

    it('should return true for year 2024 (divisible by 4, not by 100)', () => {
      expect(isLeapYear(2024)).toBe(true);
    });

    it('should return false for year 1900 (divisible by 100 but not 400)', () => {
      expect(isLeapYear(1900)).toBe(false);
    });

    it('should return false for year 1800 (divisible by 100 but not 400)', () => {
      expect(isLeapYear(1800)).toBe(false);
    });

    it('should return false for year 2001 (not divisible by 4)', () => {
      expect(isLeapYear(2001)).toBe(false);
    });

    it('should return false for year 2002 (not divisible by 4)', () => {
      expect(isLeapYear(2002)).toBe(false);
    });

    it('should return false for year 2003 (not divisible by 4)', () => {
      expect(isLeapYear(2003)).toBe(false);
    });

    it('should return true for year 1600 (divisible by 400)', () => {
      expect(isLeapYear(1600)).toBe(true);
    });

    it('should return false for year 1700 (divisible by 100 but not 400)', () => {
      expect(isLeapYear(1700)).toBe(false);
    });
  });

  describe('getDaysInMonth', () => {
    it('should return 31 for January', () => {
      expect(getDaysInMonth(0, 2024)).toBe(31);
    });

    it('should return 28 for February in non-leap year', () => {
      expect(getDaysInMonth(1, 2023)).toBe(28);
    });

    it('should return 29 for February in leap year', () => {
      expect(getDaysInMonth(1, 2024)).toBe(29);
    });

    it('should return 31 for March', () => {
      expect(getDaysInMonth(2, 2024)).toBe(31);
    });

    it('should return 30 for April', () => {
      expect(getDaysInMonth(3, 2024)).toBe(30);
    });

    it('should return 31 for May', () => {
      expect(getDaysInMonth(4, 2024)).toBe(31);
    });

    it('should return 30 for June', () => {
      expect(getDaysInMonth(5, 2024)).toBe(30);
    });

    it('should return 31 for July', () => {
      expect(getDaysInMonth(6, 2024)).toBe(31);
    });

    it('should return 31 for August', () => {
      expect(getDaysInMonth(7, 2024)).toBe(31);
    });

    it('should return 30 for September', () => {
      expect(getDaysInMonth(8, 2024)).toBe(30);
    });

    it('should return 31 for October', () => {
      expect(getDaysInMonth(9, 2024)).toBe(31);
    });

    it('should return 30 for November', () => {
      expect(getDaysInMonth(10, 2024)).toBe(30);
    });

    it('should return 31 for December', () => {
      expect(getDaysInMonth(11, 2024)).toBe(31);
    });

    it('should handle February in century years correctly', () => {
      expect(getDaysInMonth(1, 1900)).toBe(28); // Not a leap year
      expect(getDaysInMonth(1, 2000)).toBe(29); // Leap year
    });
  });

  describe('formatDate', () => {
    it('should format date in British format (en-GB) by default', () => {
      const date = new Date(2024, 0, 15); // 15 January 2024
      const formatted = formatDate(date);
      expect(formatted).toBe('15 January 2024');
    });

    it('should format date with different months correctly', () => {
      const date1 = new Date(2024, 2, 20); // 20 March 2024
      expect(formatDate(date1)).toBe('20 March 2024');

      const date2 = new Date(2023, 11, 25); // 25 December 2023
      expect(formatDate(date2)).toBe('25 December 2023');
    });

    it('should handle single-digit days correctly', () => {
      const date = new Date(2024, 5, 5); // 5 June 2024
      expect(formatDate(date)).toBe('5 June 2024');
    });

    it('should use specified locale when provided', () => {
      const date = new Date(2024, 0, 15); // 15 January 2024
      const formatted = formatDate(date, { locale: 'en-US' });
      // US format typically uses "January 15, 2024"
      expect(formatted).toContain('January');
      expect(formatted).toContain('2024');
    });

    it('should handle leap year dates correctly', () => {
      const date = new Date(2024, 1, 29); // 29 February 2024 (leap year)
      expect(formatDate(date)).toBe('29 February 2024');
    });
  });

  describe('formatTime', () => {
    it('should format time in 12-hour format by default', () => {
      const date = new Date(2024, 0, 15, 14, 30); // 2:30 PM
      const formatted = formatTime(date);
      expect(formatted).toBe('2:30 PM');
    });

    it('should format midnight correctly in 12-hour format', () => {
      const date = new Date(2024, 0, 15, 0, 0); // 12:00 AM
      const formatted = formatTime(date, { use12Hour: true });
      expect(formatted).toBe('12:00 AM');
    });

    it('should format noon correctly in 12-hour format', () => {
      const date = new Date(2024, 0, 15, 12, 0); // 12:00 PM
      const formatted = formatTime(date, { use12Hour: true });
      expect(formatted).toBe('12:00 PM');
    });

    it('should format morning hours correctly in 12-hour format', () => {
      const date = new Date(2024, 0, 15, 9, 15); // 9:15 AM
      const formatted = formatTime(date, { use12Hour: true });
      expect(formatted).toBe('9:15 AM');
    });

    it('should format afternoon hours correctly in 12-hour format', () => {
      const date = new Date(2024, 0, 15, 15, 45); // 3:45 PM
      const formatted = formatTime(date, { use12Hour: true });
      expect(formatted).toBe('3:45 PM');
    });

    it('should format time in 24-hour format when use12Hour is false', () => {
      const date = new Date(2024, 0, 15, 14, 30); // 14:30
      const formatted = formatTime(date, { use12Hour: false });
      expect(formatted).toBe('14:30');
    });

    it('should format midnight correctly in 24-hour format', () => {
      const date = new Date(2024, 0, 15, 0, 0); // 00:00
      const formatted = formatTime(date, { use12Hour: false });
      expect(formatted).toBe('00:00');
    });

    it('should format noon correctly in 24-hour format', () => {
      const date = new Date(2024, 0, 15, 12, 0); // 12:00
      const formatted = formatTime(date, { use12Hour: false });
      expect(formatted).toBe('12:00');
    });

    it('should pad minutes with zero when needed', () => {
      const date = new Date(2024, 0, 15, 14, 5); // 14:05
      const formatted24 = formatTime(date, { use12Hour: false });
      expect(formatted24).toBe('14:05');
      
      const formatted12 = formatTime(date, { use12Hour: true });
      expect(formatted12).toBe('2:05 PM');
    });
  });

  describe('formatDateWithTime', () => {
    it('should combine date and time in 12-hour format', () => {
      const date = new Date(2024, 0, 15, 14, 30); // 15 January 2024, 2:30 PM
      const formatted = formatDateWithTime(date, { use12Hour: true });
      expect(formatted).toBe('15 January 2024, 2:30 PM');
    });

    it('should combine date and time in 24-hour format', () => {
      const date = new Date(2024, 0, 15, 14, 30); // 15 January 2024, 14:30
      const formatted = formatDateWithTime(date, { use12Hour: false });
      expect(formatted).toBe('15 January 2024, 14:30');
    });

    it('should use 12-hour format by default', () => {
      const date = new Date(2024, 0, 15, 14, 30);
      const formatted = formatDateWithTime(date);
      expect(formatted).toBe('15 January 2024, 2:30 PM');
    });

    it('should handle dates without time component (midnight)', () => {
      const date = new Date(2024, 0, 15, 0, 0);
      const formatted = formatDateWithTime(date, { use12Hour: true });
      expect(formatted).toBe('15 January 2024, 12:00 AM');
    });

    it('should respect locale option for date formatting', () => {
      const date = new Date(2024, 0, 15, 14, 30);
      const formatted = formatDateWithTime(date, { locale: 'en-US', use12Hour: true });
      // Should still contain the time
      expect(formatted).toContain('PM');
      expect(formatted).toContain('2024');
    });
  });
});

