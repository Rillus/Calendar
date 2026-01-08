import { describe, it, expect } from 'vitest';
import { getWeekStartDate, getWeekDates } from '../src/utils/weekViewUtils.js';

describe('weekViewUtils', () => {
  describe('getWeekStartDate', () => {
    it('should return Monday for a date in the middle of the week', () => {
      // Wednesday, 15 January 2025
      const date = new Date(2025, 0, 15);
      const weekStart = getWeekStartDate(date);
      
      // Should be Monday, 13 January 2025
      expect(weekStart.getFullYear()).toBe(2025);
      expect(weekStart.getMonth()).toBe(0);
      expect(weekStart.getDate()).toBe(13);
      expect(weekStart.getDay()).toBe(1); // Monday
    });

    it('should return Monday for a Monday date', () => {
      // Monday, 13 January 2025
      const date = new Date(2025, 0, 13);
      const weekStart = getWeekStartDate(date);
      
      expect(weekStart.getFullYear()).toBe(2025);
      expect(weekStart.getMonth()).toBe(0);
      expect(weekStart.getDate()).toBe(13);
      expect(weekStart.getDay()).toBe(1);
    });

    it('should return previous Monday for a Sunday date', () => {
      // Sunday, 12 January 2025
      const date = new Date(2025, 0, 12);
      const weekStart = getWeekStartDate(date);
      
      // Should be Monday, 6 January 2025
      expect(weekStart.getFullYear()).toBe(2025);
      expect(weekStart.getMonth()).toBe(0);
      expect(weekStart.getDate()).toBe(6);
      expect(weekStart.getDay()).toBe(1);
    });

    it('should handle dates at month boundaries', () => {
      // Wednesday, 1 January 2025 (should go back to previous month)
      const date = new Date(2025, 0, 1);
      const weekStart = getWeekStartDate(date);
      
      // Should be Monday, 30 December 2024
      expect(weekStart.getFullYear()).toBe(2024);
      expect(weekStart.getMonth()).toBe(11);
      expect(weekStart.getDate()).toBe(30);
      expect(weekStart.getDay()).toBe(1);
    });

    it('should handle dates at year boundaries', () => {
      // Wednesday, 1 January 2025
      const date = new Date(2025, 0, 1);
      const weekStart = getWeekStartDate(date);
      
      // Should be Monday, 30 December 2024
      expect(weekStart.getFullYear()).toBe(2024);
      expect(weekStart.getMonth()).toBe(11);
      expect(weekStart.getDate()).toBe(30);
    });
  });

  describe('getWeekDates', () => {
    it('should return 7 dates starting from Monday', () => {
      // Monday, 13 January 2025
      const weekStart = new Date(2025, 0, 13);
      const weekDates = getWeekDates(weekStart);
      
      expect(weekDates.length).toBe(7);
      expect(weekDates[0].getDate()).toBe(13); // Monday
      expect(weekDates[1].getDate()).toBe(14); // Tuesday
      expect(weekDates[2].getDate()).toBe(15); // Wednesday
      expect(weekDates[3].getDate()).toBe(16); // Thursday
      expect(weekDates[4].getDate()).toBe(17); // Friday
      expect(weekDates[5].getDate()).toBe(18); // Saturday
      expect(weekDates[6].getDate()).toBe(19); // Sunday
    });

    it('should handle weeks spanning month boundaries', () => {
      // Monday, 27 January 2025 (week spans into February)
      const weekStart = new Date(2025, 0, 27);
      const weekDates = getWeekDates(weekStart);
      
      expect(weekDates.length).toBe(7);
      expect(weekDates[0].getMonth()).toBe(0); // January
      expect(weekDates[0].getDate()).toBe(27);
      expect(weekDates[6].getMonth()).toBe(1); // February
      expect(weekDates[6].getDate()).toBe(2);
    });

    it('should handle weeks spanning year boundaries', () => {
      // Monday, 30 December 2024 (week spans into 2025)
      const weekStart = new Date(2024, 11, 30);
      const weekDates = getWeekDates(weekStart);
      
      expect(weekDates.length).toBe(7);
      expect(weekDates[0].getFullYear()).toBe(2024);
      expect(weekDates[0].getDate()).toBe(30);
      expect(weekDates[6].getFullYear()).toBe(2025);
      expect(weekDates[6].getDate()).toBe(5);
    });
  });
});
