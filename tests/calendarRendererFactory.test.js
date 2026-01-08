import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createCalendarRenderer } from '../src/renderer/calendarRenderer.js';

describe('createCalendarRenderer', () => {
  let svgA;
  let svgB;

  beforeEach(() => {
    svgA = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgB = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    document.body.appendChild(svgA);
    document.body.appendChild(svgB);
  });

  afterEach(() => {
    svgA?.remove();
    svgB?.remove();
  });

  it('should isolate state per renderer instance', () => {
    const a = createCalendarRenderer(svgA);
    const b = createCalendarRenderer(svgB);

    a.drawCalendar();
    b.drawCalendar();

    a.selectDate(new Date(2026, 0, 10));

    expect(svgA.querySelector('.sun-icon')).not.toBeNull();
    expect(svgB.querySelector('.sun-icon')).toBeNull();
  });
});


describe('Calendar Renderer Validation Integration', () => {
  let mockSvg;

  beforeEach(() => {
    mockSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    document.body.appendChild(mockSvg);
  });

  afterEach(() => {
    mockSvg?.remove();
  });

  describe('Date validation', () => {
    it('should accept valid dates when no restrictions are set', () => {
      const renderer = createCalendarRenderer(mockSvg);
      const validDate = new Date(2024, 5, 15);
      
      expect(() => renderer.selectDate(validDate)).not.toThrow();
    });

    it('should prevent selection of past dates when allowPast is false', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const renderer = createCalendarRenderer(mockSvg, {
        validationOptions: { allowPast: false }
      });
      
      const dateChangeListener = vi.fn();
      renderer.subscribeToDateChanges(dateChangeListener);
      
      renderer.selectDate(yesterday);
      
      expect(dateChangeListener).not.toHaveBeenCalled();
    });

    it('should allow today when allowPast is false', () => {
      const today = new Date();
      today.setHours(12, 0, 0, 0);
      
      const renderer = createCalendarRenderer(mockSvg, {
        validationOptions: { allowPast: false }
      });
      
      const dateChangeListener = vi.fn();
      renderer.subscribeToDateChanges(dateChangeListener);
      
      renderer.selectDate(today);
      
      expect(dateChangeListener).toHaveBeenCalled();
    });

    it('should prevent selection of dates before minDate', () => {
      const minDate = new Date(2024, 5, 20);
      const beforeMinDate = new Date(2024, 5, 15);
      
      const renderer = createCalendarRenderer(mockSvg, {
        validationOptions: { minDate }
      });
      
      const dateChangeListener = vi.fn();
      renderer.subscribeToDateChanges(dateChangeListener);
      
      renderer.selectDate(beforeMinDate);
      
      expect(dateChangeListener).not.toHaveBeenCalled();
    });

    it('should prevent selection of dates after maxDate', () => {
      const maxDate = new Date(2024, 5, 20);
      const afterMaxDate = new Date(2024, 5, 25);
      
      const renderer = createCalendarRenderer(mockSvg, {
        validationOptions: { maxDate }
      });
      
      const dateChangeListener = vi.fn();
      renderer.subscribeToDateChanges(dateChangeListener);
      
      renderer.selectDate(afterMaxDate);
      
      expect(dateChangeListener).not.toHaveBeenCalled();
    });

    it('should allow dates within valid range', () => {
      const minDate = new Date(2024, 5, 10);
      const maxDate = new Date(2024, 5, 20);
      const validDate = new Date(2024, 5, 15);
      
      const renderer = createCalendarRenderer(mockSvg, {
        validationOptions: { minDate, maxDate }
      });
      
      const dateChangeListener = vi.fn();
      renderer.subscribeToDateChanges(dateChangeListener);
      
      renderer.selectDate(validDate);
      
      expect(dateChangeListener).toHaveBeenCalled();
    });
  });

  describe('Error messages', () => {
    it('should create error message element when validation fails', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const renderer = createCalendarRenderer(mockSvg, {
        validationOptions: { allowPast: false }
      });
      
      renderer.selectDate(yesterday);
      
      const errorMessage = mockSvg.querySelector('[role="alert"]');
      expect(errorMessage).not.toBeNull();
      expect(errorMessage.getAttribute('class')).toBe('error-message');
      
      const errorText = errorMessage.querySelector('.error-text');
      expect(errorText).not.toBeNull();
      expect(errorText.textContent).toContain('Past dates are not allowed');
    });
  });
});
