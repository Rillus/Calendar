import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  validateDate,
  validateTime,
  isDateRestricted,
  formatDateForError,
  createValidationOptions
} from '../src/utils/dateValidation.js';

describe('dateValidation', () => {
  describe('validateDate', () => {
    it('should return valid for a valid date with no restrictions', () => {
      const date = new Date(2024, 5, 15);
      const result = validateDate(date);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return invalid when past dates are not allowed', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const result = validateDate(yesterday, { allowPast: false });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Past dates are not allowed');
    });

    it('should return valid when past dates are allowed (default)', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const result = validateDate(yesterday);
      expect(result.valid).toBe(true);
    });

    it('should return invalid when date is before minDate', () => {
      const date = new Date(2024, 5, 15);
      const minDate = new Date(2024, 5, 20);
      
      const result = validateDate(date, { minDate });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('must be after');
    });

    it('should return invalid when date is after maxDate', () => {
      const date = new Date(2024, 5, 25);
      const maxDate = new Date(2024, 5, 20);
      
      const result = validateDate(date, { maxDate });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('must be before');
    });

    it('should return valid when date equals minDate', () => {
      const date = new Date(2024, 5, 15);
      const minDate = new Date(2024, 5, 15);
      
      const result = validateDate(date, { minDate });
      expect(result.valid).toBe(true);
    });

    it('should return valid when date equals maxDate', () => {
      const date = new Date(2024, 5, 15);
      const maxDate = new Date(2024, 5, 15);
      
      const result = validateDate(date, { maxDate });
      expect(result.valid).toBe(true);
    });

    it('should handle multiple restrictions (past + minDate)', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const minDate = new Date();
      minDate.setDate(minDate.getDate() + 1);
      
      const result = validateDate(yesterday, { allowPast: false, minDate });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Past dates are not allowed');
    });

    it('should handle invalid date objects', () => {
      const invalidDate = new Date('invalid');
      
      const result = validateDate(invalidDate);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid date');
    });

    it('should handle today when allowPast is false', () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const result = validateDate(today, { allowPast: false });
      expect(result.valid).toBe(true);
    });

    it('should compare dates ignoring time when checking past dates', () => {
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      
      const result = validateDate(today, { allowPast: false });
      expect(result.valid).toBe(true);
    });
  });

  describe('validateTime', () => {
    it('should return valid for valid 24-hour time', () => {
      const result = validateTime(14, 30, { use12Hour: false });
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return invalid for hour out of range (24-hour)', () => {
      const result = validateTime(24, 30, { use12Hour: false });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Hour must be between 0 and 23');
    });

    it('should return invalid for negative hour', () => {
      const result = validateTime(-1, 30, { use12Hour: false });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Hour must be between 0 and 23');
    });

    it('should return invalid for minute out of range', () => {
      const result = validateTime(14, 60, { use12Hour: false });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Minute must be between 0 and 59');
    });

    it('should return invalid for negative minute', () => {
      const result = validateTime(14, -1, { use12Hour: false });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Minute must be between 0 and 59');
    });

    it('should return valid for valid 12-hour time with AM', () => {
      const result = validateTime(10, 30, { use12Hour: true, meridiem: 'AM' });
      expect(result.valid).toBe(true);
    });

    it('should return valid for valid 12-hour time with PM', () => {
      const result = validateTime(2, 30, { use12Hour: true, meridiem: 'PM' });
      expect(result.valid).toBe(true);
    });

    it('should return invalid for hour out of range (12-hour)', () => {
      const result = validateTime(13, 30, { use12Hour: true, meridiem: 'AM' });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Hour must be between 1 and 12');
    });

    it('should return invalid for hour 0 in 12-hour mode', () => {
      const result = validateTime(0, 30, { use12Hour: true, meridiem: 'AM' });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Hour must be between 1 and 12');
    });

    it('should return invalid when meridiem is missing in 12-hour mode', () => {
      const result = validateTime(10, 30, { use12Hour: true });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Meridiem (AM/PM) is required');
    });

    it('should return invalid for invalid meridiem value', () => {
      const result = validateTime(10, 30, { use12Hour: true, meridiem: 'INVALID' });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Meridiem must be');
    });

    it('should accept valid edge cases for 24-hour mode', () => {
      expect(validateTime(0, 0, { use12Hour: false }).valid).toBe(true);
      expect(validateTime(23, 59, { use12Hour: false }).valid).toBe(true);
    });

    it('should accept valid edge cases for 12-hour mode', () => {
      expect(validateTime(1, 0, { use12Hour: true, meridiem: 'AM' }).valid).toBe(true);
      expect(validateTime(12, 59, { use12Hour: true, meridiem: 'PM' }).valid).toBe(true);
    });
  });

  describe('isDateRestricted', () => {
    it('should return false for unrestricted date', () => {
      const date = new Date(2024, 5, 15);
      const result = isDateRestricted(date);
      expect(result).toBe(false);
    });

    it('should return true for past date when allowPast is false', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const result = isDateRestricted(yesterday, { allowPast: false });
      expect(result).toBe(true);
    });

    it('should return true for date before minDate', () => {
      const date = new Date(2024, 5, 15);
      const minDate = new Date(2024, 5, 20);
      
      const result = isDateRestricted(date, { minDate });
      expect(result).toBe(true);
    });

    it('should return true for date after maxDate', () => {
      const date = new Date(2024, 5, 25);
      const maxDate = new Date(2024, 5, 20);
      
      const result = isDateRestricted(date, { maxDate });
      expect(result).toBe(true);
    });

    it('should return false for date within valid range', () => {
      const date = new Date(2024, 5, 15);
      const minDate = new Date(2024, 5, 10);
      const maxDate = new Date(2024, 5, 20);
      
      const result = isDateRestricted(date, { minDate, maxDate });
      expect(result).toBe(false);
    });
  });

  describe('formatDateForError', () => {
    it('should format date in readable format', () => {
      const date = new Date(2024, 5, 15);
      const formatted = formatDateForError(date);
      expect(formatted).toMatch(/15/);
      expect(formatted).toMatch(/2024/);
    });

    it('should handle different months correctly', () => {
      const date = new Date(2024, 0, 1); // January
      const formatted = formatDateForError(date);
      expect(formatted).toMatch(/January|Jan|01/);
    });
  });

  describe('createValidationOptions', () => {
    it('should create default options when none provided', () => {
      const options = createValidationOptions();
      expect(options.allowPast).toBe(true);
      expect(options.minDate).toBeUndefined();
      expect(options.maxDate).toBeUndefined();
    });

    it('should merge provided options with defaults', () => {
      const minDate = new Date(2024, 0, 1);
      const options = createValidationOptions({ minDate, allowPast: false });
      expect(options.allowPast).toBe(false);
      expect(options.minDate).toBe(minDate);
    });

    it('should handle time validation options', () => {
      const options = createValidationOptions({ use12Hour: true });
      expect(options.use12Hour).toBe(true);
    });
  });
});
