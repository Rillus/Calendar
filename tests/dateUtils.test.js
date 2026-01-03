import { describe, it, expect } from 'vitest';
import { isLeapYear, getDaysInMonth } from '../src/utils/dateUtils.js';

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
});

