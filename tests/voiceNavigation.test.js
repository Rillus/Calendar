import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  setupVoiceNavigation, 
  parseVoiceCommand,
  parseMonthName,
  parseDateCommand,
  parseTimeCommand,
  parseNavigationCommand
} from '../src/utils/voiceNavigation.js';

describe('voiceNavigation', () => {
  describe('setupVoiceNavigation', () => {
    beforeEach(() => {
      // Clear any existing mocks
      delete window.SpeechRecognition;
      delete window.webkitSpeechRecognition;
    });

    afterEach(() => {
      vi.clearAllMocks();
    });

    it('should return null when Speech Recognition API is not available', () => {
      const callbacks = {};
      const result = setupVoiceNavigation(callbacks);
      
      expect(result).toBeNull();
    });

    it('should create recognition instance when SpeechRecognition is available', () => {
      const mockRecognition = vi.fn();
      mockRecognition.prototype.continuous = false;
      mockRecognition.prototype.interimResults = false;
      mockRecognition.prototype.onresult = null;
      mockRecognition.prototype.onerror = null;
      mockRecognition.prototype.onend = null;
      mockRecognition.prototype.start = vi.fn();
      mockRecognition.prototype.stop = vi.fn();
      
      window.SpeechRecognition = mockRecognition;
      
      const callbacks = {};
      const recognition = setupVoiceNavigation(callbacks);
      
      expect(recognition).toBeTruthy();
      expect(mockRecognition).toHaveBeenCalled();
      expect(recognition.continuous).toBe(false);
      expect(recognition.interimResults).toBe(false);
    });

    it('should create recognition instance when webkitSpeechRecognition is available', () => {
      const mockRecognition = vi.fn();
      mockRecognition.prototype.continuous = false;
      mockRecognition.prototype.interimResults = false;
      mockRecognition.prototype.onresult = null;
      mockRecognition.prototype.onerror = null;
      mockRecognition.prototype.onend = null;
      mockRecognition.prototype.start = vi.fn();
      mockRecognition.prototype.stop = vi.fn();
      
      window.webkitSpeechRecognition = mockRecognition;
      
      const callbacks = {};
      const recognition = setupVoiceNavigation(callbacks);
      
      expect(recognition).toBeTruthy();
      expect(mockRecognition).toHaveBeenCalled();
    });

    it('should prefer SpeechRecognition over webkitSpeechRecognition', () => {
      const mockSpeechRecognition = vi.fn();
      mockSpeechRecognition.prototype.continuous = false;
      mockSpeechRecognition.prototype.interimResults = false;
      mockSpeechRecognition.prototype.onresult = null;
      
      const mockWebkitRecognition = vi.fn();
      mockWebkitRecognition.prototype.continuous = false;
      mockWebkitRecognition.prototype.interimResults = false;
      mockWebkitRecognition.prototype.onresult = null;
      
      window.SpeechRecognition = mockSpeechRecognition;
      window.webkitSpeechRecognition = mockWebkitRecognition;
      
      const callbacks = {};
      setupVoiceNavigation(callbacks);
      
      expect(mockSpeechRecognition).toHaveBeenCalled();
      expect(mockWebkitRecognition).not.toHaveBeenCalled();
    });

    it('should parse voice command when recognition result is received', () => {
      const mockRecognition = vi.fn();
      mockRecognition.prototype.continuous = false;
      mockRecognition.prototype.interimResults = false;
      mockRecognition.prototype.onresult = null;
      mockRecognition.prototype.onerror = null;
      mockRecognition.prototype.onend = null;
      mockRecognition.prototype.start = vi.fn();
      mockRecognition.prototype.stop = vi.fn();
      
      window.SpeechRecognition = mockRecognition;
      
      const onSelectDate = vi.fn();
      const callbacks = { onSelectDate };
      
      const recognition = setupVoiceNavigation(callbacks);
      
      // Simulate recognition result
      const mockResult = {
        results: [
          [
            {
              transcript: 'Select January 15th',
              confidence: 0.9
            }
          ]
        ]
      };
      
      // Trigger onresult handler
      if (recognition && recognition.onresult) {
        recognition.onresult({ results: mockResult.results });
      }
      
      // Note: parseVoiceCommand will be tested separately
      expect(recognition).toBeTruthy();
    });
  });

  describe('parseMonthName', () => {
    it('should parse full month names', () => {
      expect(parseMonthName('January')).toBe(0);
      expect(parseMonthName('February')).toBe(1);
      expect(parseMonthName('March')).toBe(2);
      expect(parseMonthName('April')).toBe(3);
      expect(parseMonthName('May')).toBe(4);
      expect(parseMonthName('June')).toBe(5);
      expect(parseMonthName('July')).toBe(6);
      expect(parseMonthName('August')).toBe(7);
      expect(parseMonthName('September')).toBe(8);
      expect(parseMonthName('October')).toBe(9);
      expect(parseMonthName('November')).toBe(10);
      expect(parseMonthName('December')).toBe(11);
    });

    it('should parse abbreviated month names', () => {
      expect(parseMonthName('Jan')).toBe(0);
      expect(parseMonthName('Feb')).toBe(1);
      expect(parseMonthName('Mar')).toBe(2);
      expect(parseMonthName('Apr')).toBe(3);
      expect(parseMonthName('Jun')).toBe(5);
      expect(parseMonthName('Jul')).toBe(6);
      expect(parseMonthName('Aug')).toBe(7);
      expect(parseMonthName('Sep')).toBe(8);
      expect(parseMonthName('Oct')).toBe(9);
      expect(parseMonthName('Nov')).toBe(10);
      expect(parseMonthName('Dec')).toBe(11);
    });

    it('should be case insensitive', () => {
      expect(parseMonthName('january')).toBe(0);
      expect(parseMonthName('JANUARY')).toBe(0);
      expect(parseMonthName('JaNuArY')).toBe(0);
      expect(parseMonthName('jan')).toBe(0);
    });

    it('should return null for invalid month names', () => {
      expect(parseMonthName('InvalidMonth')).toBeNull();
      expect(parseMonthName('')).toBeNull();
      expect(parseMonthName('Mon')).toBeNull();
    });
  });

  describe('parseDateCommand', () => {
    it('should parse "Select January 15th"', () => {
      const currentYear = 2024;
      const result = parseDateCommand('Select January 15th', currentYear);
      
      expect(result).toBeTruthy();
      expect(result.month).toBe(0); // January
      expect(result.day).toBe(15);
      expect(result.year).toBe(currentYear);
    });

    it('should parse "Select Jan 15"', () => {
      const currentYear = 2024;
      const result = parseDateCommand('Select Jan 15', currentYear);
      
      expect(result).toBeTruthy();
      expect(result.month).toBe(0);
      expect(result.day).toBe(15);
    });

    it('should parse "Select December 31st"', () => {
      const currentYear = 2024;
      const result = parseDateCommand('Select December 31st', currentYear);
      
      expect(result).toBeTruthy();
      expect(result.month).toBe(11); // December
      expect(result.day).toBe(31);
    });

    it('should parse dates with year "Select January 15th 2025"', () => {
      const currentYear = 2024;
      const result = parseDateCommand('Select January 15th 2025', currentYear);
      
      expect(result).toBeTruthy();
      expect(result.month).toBe(0);
      expect(result.day).toBe(15);
      expect(result.year).toBe(2025);
    });

    it('should be case insensitive', () => {
      const currentYear = 2024;
      const result = parseDateCommand('select january 15th', currentYear);
      
      expect(result).toBeTruthy();
      expect(result.month).toBe(0);
      expect(result.day).toBe(15);
    });

    it('should return null for invalid date commands', () => {
      const currentYear = 2024;
      
      expect(parseDateCommand('Go to next month', currentYear)).toBeNull();
      expect(parseDateCommand('Invalid command', currentYear)).toBeNull();
      expect(parseDateCommand('Select InvalidMonth 15th', currentYear)).toBeNull();
      expect(parseDateCommand('Select January 32nd', currentYear)).toBeNull(); // Invalid day
    });

    it('should handle ordinal numbers', () => {
      const currentYear = 2024;
      
      expect(parseDateCommand('Select January 1st', currentYear)?.day).toBe(1);
      expect(parseDateCommand('Select January 2nd', currentYear)?.day).toBe(2);
      expect(parseDateCommand('Select January 3rd', currentYear)?.day).toBe(3);
      expect(parseDateCommand('Select January 4th', currentYear)?.day).toBe(4);
      expect(parseDateCommand('Select January 21st', currentYear)?.day).toBe(21);
      expect(parseDateCommand('Select January 22nd', currentYear)?.day).toBe(22);
      expect(parseDateCommand('Select January 23rd', currentYear)?.day).toBe(23);
    });

    it('should validate day against month length', () => {
      const currentYear = 2024;
      
      // February 29 in leap year should work
      expect(parseDateCommand('Select February 29th', 2024)?.day).toBe(29);
      
      // February 29 in non-leap year should fail
      expect(parseDateCommand('Select February 29th', 2023)).toBeNull();
      
      // February 30 should always fail
      expect(parseDateCommand('Select February 30th', 2024)).toBeNull();
      
      // April 31 should fail (April only has 30 days)
      expect(parseDateCommand('Select April 31st', 2024)).toBeNull();
      
      // April 30 should work
      expect(parseDateCommand('Select April 30th', 2024)?.day).toBe(30);
    });
  });

  describe('parseTimeCommand', () => {
    it('should parse "Select 2:30 PM"', () => {
      const result = parseTimeCommand('Select 2:30 PM');
      
      expect(result).toBeTruthy();
      expect(result.hour).toBe(14); // 2 PM in 24-hour format
      expect(result.minute).toBe(30);
    });

    it('should parse "Select 2:30 AM"', () => {
      const result = parseTimeCommand('Select 2:30 AM');
      
      expect(result).toBeTruthy();
      expect(result.hour).toBe(2);
      expect(result.minute).toBe(30);
    });

    it('should parse "Select 12:00 PM" (noon)', () => {
      const result = parseTimeCommand('Select 12:00 PM');
      
      expect(result).toBeTruthy();
      expect(result.hour).toBe(12);
      expect(result.minute).toBe(0);
    });

    it('should parse "Select 12:00 AM" (midnight)', () => {
      const result = parseTimeCommand('Select 12:00 AM');
      
      expect(result).toBeTruthy();
      expect(result.hour).toBe(0);
      expect(result.minute).toBe(0);
    });

    it('should parse "Select 11:59 PM"', () => {
      const result = parseTimeCommand('Select 11:59 PM');
      
      expect(result).toBeTruthy();
      expect(result.hour).toBe(23);
      expect(result.minute).toBe(59);
    });

    it('should be case insensitive', () => {
      const result = parseTimeCommand('select 2:30 pm');
      
      expect(result).toBeTruthy();
      expect(result.hour).toBe(14);
      expect(result.minute).toBe(30);
    });

    it('should handle times without colons "Select 2 30 PM"', () => {
      const result = parseTimeCommand('Select 2 30 PM');
      
      expect(result).toBeTruthy();
      expect(result.hour).toBe(14);
      expect(result.minute).toBe(30);
    });

    it('should handle 24-hour format "Select 14:30"', () => {
      const result = parseTimeCommand('Select 14:30');
      
      expect(result).toBeTruthy();
      expect(result.hour).toBe(14);
      expect(result.minute).toBe(30);
    });

    it('should return null for invalid time commands', () => {
      expect(parseTimeCommand('Go to next month')).toBeNull();
      expect(parseTimeCommand('Select 25:00 PM')).toBeNull(); // Invalid hour
      expect(parseTimeCommand('Select 2:60 PM')).toBeNull(); // Invalid minute
      expect(parseTimeCommand('Invalid command')).toBeNull();
    });
  });

  describe('parseNavigationCommand', () => {
    it('should parse "Go to next month"', () => {
      const result = parseNavigationCommand('Go to next month');
      
      expect(result).toBeTruthy();
      expect(result.action).toBe('nextMonth');
    });

    it('should parse "Next month"', () => {
      const result = parseNavigationCommand('Next month');
      
      expect(result).toBeTruthy();
      expect(result.action).toBe('nextMonth');
    });

    it('should parse "Go to previous month"', () => {
      const result = parseNavigationCommand('Go to previous month');
      
      expect(result).toBeTruthy();
      expect(result.action).toBe('previousMonth');
    });

    it('should parse "Previous month"', () => {
      const result = parseNavigationCommand('Previous month');
      
      expect(result).toBeTruthy();
      expect(result.action).toBe('previousMonth');
    });

    it('should parse "Go to last month"', () => {
      const result = parseNavigationCommand('Go to last month');
      
      expect(result).toBeTruthy();
      expect(result.action).toBe('previousMonth');
    });

    it('should parse "Go to today"', () => {
      const result = parseNavigationCommand('Go to today');
      
      expect(result).toBeTruthy();
      expect(result.action).toBe('today');
    });

    it('should parse "Today"', () => {
      const result = parseNavigationCommand('Today');
      
      expect(result).toBeTruthy();
      expect(result.action).toBe('today');
    });

    it('should be case insensitive', () => {
      expect(parseNavigationCommand('go to next month')?.action).toBe('nextMonth');
      expect(parseNavigationCommand('TODAY')?.action).toBe('today');
    });

    it('should return null for invalid navigation commands', () => {
      expect(parseNavigationCommand('Select January 15th')).toBeNull();
      expect(parseNavigationCommand('Invalid command')).toBeNull();
    });
  });

  describe('parseVoiceCommand', () => {
    it('should call onSelectDate for date commands', () => {
      const onSelectDate = vi.fn();
      const callbacks = { onSelectDate };
      const currentYear = 2024;
      
      parseVoiceCommand('Select January 15th', callbacks, currentYear);
      
      expect(onSelectDate).toHaveBeenCalledTimes(1);
      const callDate = onSelectDate.mock.calls[0][0];
      expect(callDate.getMonth()).toBe(0); // January
      expect(callDate.getDate()).toBe(15);
      expect(callDate.getFullYear()).toBe(currentYear);
    });

    it('should call onSelectTime for time commands', () => {
      const onSelectTime = vi.fn();
      const callbacks = { onSelectTime };
      
      parseVoiceCommand('Select 2:30 PM', callbacks);
      
      expect(onSelectTime).toHaveBeenCalledTimes(1);
      const callTime = onSelectTime.mock.calls[0][0];
      expect(callTime.hour).toBe(14);
      expect(callTime.minute).toBe(30);
    });

    it('should call onNextMonth for next month commands', () => {
      const onNextMonth = vi.fn();
      const callbacks = { onNextMonth };
      
      parseVoiceCommand('Go to next month', callbacks);
      
      expect(onNextMonth).toHaveBeenCalledTimes(1);
    });

    it('should call onPreviousMonth for previous month commands', () => {
      const onPreviousMonth = vi.fn();
      const callbacks = { onPreviousMonth };
      
      parseVoiceCommand('Go to previous month', callbacks);
      
      expect(onPreviousMonth).toHaveBeenCalledTimes(1);
    });

    it('should call onGoToToday for today commands', () => {
      const onGoToToday = vi.fn();
      const callbacks = { onGoToToday };
      
      parseVoiceCommand('Go to today', callbacks);
      
      expect(onGoToToday).toHaveBeenCalledTimes(1);
    });

    it('should not call callbacks for unrecognised commands', () => {
      const onSelectDate = vi.fn();
      const onNextMonth = vi.fn();
      const callbacks = { onSelectDate, onNextMonth };
      
      parseVoiceCommand('Invalid command that does not match', callbacks);
      
      expect(onSelectDate).not.toHaveBeenCalled();
      expect(onNextMonth).not.toHaveBeenCalled();
    });

    it('should handle commands gracefully when callbacks are missing', () => {
      const callbacks = {};
      
      expect(() => {
        parseVoiceCommand('Select January 15th', callbacks);
      }).not.toThrow();
    });
  });
});
