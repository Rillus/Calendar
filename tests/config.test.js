import { describe, it, expect } from 'vitest';
import {
  calendarType,
  segments,
  monthColors,
  monthColorsHover,
  months,
  monthDays,
  deg,
  fullRadius,
  notchedRadius30,
  notchedRadiusFeb,
  svgSize
} from '../src/config/config.js';

describe('config', () => {
  describe('calendarType', () => {
    it('should be "year"', () => {
      expect(calendarType).toBe('year');
    });
  });

  describe('segments', () => {
    it('should be 12 (one per month)', () => {
      expect(segments).toBe(12);
    });
  });

  describe('monthColors', () => {
    it('should have 12 colours', () => {
      expect(monthColors.length).toBe(12);
    });

    it('should have RGB arrays with 3 elements each', () => {
      monthColors.forEach((color, index) => {
        expect(Array.isArray(color)).toBe(true);
        expect(color.length).toBe(3);
        expect(color[0]).toBeGreaterThanOrEqual(0);
        expect(color[0]).toBeLessThanOrEqual(255);
        expect(color[1]).toBeGreaterThanOrEqual(0);
        expect(color[1]).toBeLessThanOrEqual(255);
        expect(color[2]).toBeGreaterThanOrEqual(0);
        expect(color[2]).toBeLessThanOrEqual(255);
      });
    });

    it('should have correct January colour', () => {
      expect(monthColors[0]).toEqual([72, 88, 154]);
    });

    it('should have correct December colour', () => {
      expect(monthColors[11]).toEqual([153, 32, 122]);
    });
  });

  describe('monthColorsHover', () => {
    it('should have 12 colours', () => {
      expect(monthColorsHover.length).toBe(12);
    });

    it('should have RGB arrays with 3 elements each', () => {
      monthColorsHover.forEach((color) => {
        expect(Array.isArray(color)).toBe(true);
        expect(color.length).toBe(3);
      });
    });

    it('should have correct January hover colour', () => {
      expect(monthColorsHover[0]).toEqual([117, 132, 196]);
    });
  });

  describe('months', () => {
    it('should have 12 month abbreviations', () => {
      expect(months.length).toBe(12);
    });

    it('should have uppercase month abbreviations', () => {
      months.forEach((month) => {
        expect(month).toBe(month.toUpperCase());
        expect(month.length).toBe(3);
      });
    });

    it('should start with JAN', () => {
      expect(months[0]).toBe('JAN');
    });

    it('should end with DEC', () => {
      expect(months[11]).toBe('DEC');
    });

    it('should have all expected months', () => {
      const expectedMonths = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      expect(months).toEqual(expectedMonths);
    });
  });

  describe('monthDays', () => {
    it('should have 12 day counts', () => {
      expect(monthDays.length).toBe(12);
    });

    it('should have correct day counts for each month', () => {
      const expectedDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      expect(monthDays).toEqual(expectedDays);
    });

    it('should have February with 28 days', () => {
      expect(monthDays[1]).toBe(28);
    });

    it('should have 31-day months at correct indices', () => {
      const thirtyOneDayMonths = [0, 2, 4, 6, 7, 9, 11]; // Jan, Mar, May, Jul, Aug, Oct, Dec
      thirtyOneDayMonths.forEach((index) => {
        expect(monthDays[index]).toBe(31);
      });
    });

    it('should have 30-day months at correct indices', () => {
      const thirtyDayMonths = [3, 5, 8, 10]; // Apr, Jun, Sep, Nov
      thirtyDayMonths.forEach((index) => {
        expect(monthDays[index]).toBe(30);
      });
    });
  });

  describe('deg', () => {
    it('should be 360 divided by segments', () => {
      expect(deg).toBe(360 / segments);
    });

    it('should be 30 degrees (360/12)', () => {
      expect(deg).toBe(30);
    });
  });

  describe('fullRadius', () => {
    it('should be 1.0', () => {
      expect(fullRadius).toBe(1.0);
    });
  });

  describe('notchedRadius30', () => {
    it('should be less than fullRadius', () => {
      expect(notchedRadius30).toBeLessThan(fullRadius);
    });

    it('should be 0.96', () => {
      expect(notchedRadius30).toBe(0.96);
    });
  });

  describe('notchedRadiusFeb', () => {
    it('should be less than fullRadius', () => {
      expect(notchedRadiusFeb).toBeLessThan(fullRadius);
    });

    it('should be less than notchedRadius30 (more pronounced)', () => {
      expect(notchedRadiusFeb).toBeLessThan(notchedRadius30);
    });

    it('should be 0.92', () => {
      expect(notchedRadiusFeb).toBe(0.92);
    });
  });

  describe('svgSize', () => {
    it('should be 400', () => {
      expect(svgSize).toBe(400);
    });

    it('should be a positive number', () => {
      expect(svgSize).toBeGreaterThan(0);
    });
  });
});

