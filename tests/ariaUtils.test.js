import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  setAriaLabel,
  setAriaRole,
  announceToScreenReader,
  setAriaCurrent,
  setAriaExpanded,
  setAriaHidden,
  createAriaLiveRegion,
  generateMonthLabel,
  generateDayLabel,
  generateHourLabel,
  generateMinuteLabel
} from '../src/utils/ariaUtils.js';

describe('ariaUtils', () => {
  let mockSvg;
  let liveRegion;

  beforeEach(() => {
    mockSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    document.body.appendChild(mockSvg);
    liveRegion = createAriaLiveRegion(mockSvg);
  });

  afterEach(() => {
    if (mockSvg && mockSvg.parentNode) {
      mockSvg.parentNode.removeChild(mockSvg);
    }
  });

  describe('setAriaLabel', () => {
    it('should set aria-label attribute on SVG element', () => {
      const element = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      setAriaLabel(element, 'Select January');
      expect(element.getAttribute('aria-label')).toBe('Select January');
    });

    it('should update existing aria-label', () => {
      const element = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      setAriaLabel(element, 'Select January');
      setAriaLabel(element, 'Select February');
      expect(element.getAttribute('aria-label')).toBe('Select February');
    });

    it('should handle empty string', () => {
      const element = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      setAriaLabel(element, '');
      expect(element.getAttribute('aria-label')).toBe('');
    });
  });

  describe('setAriaRole', () => {
    it('should set role attribute on SVG element', () => {
      const element = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      setAriaRole(element, 'button');
      expect(element.getAttribute('role')).toBe('button');
    });

    it('should update existing role', () => {
      const element = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      setAriaRole(element, 'button');
      setAriaRole(element, 'group');
      expect(element.getAttribute('role')).toBe('group');
    });
  });

  describe('setAriaCurrent', () => {
    it('should set aria-current attribute', () => {
      const element = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      setAriaCurrent(element, 'date');
      expect(element.getAttribute('aria-current')).toBe('date');
    });

    it('should update existing aria-current', () => {
      const element = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      setAriaCurrent(element, 'date');
      setAriaCurrent(element, 'time');
      expect(element.getAttribute('aria-current')).toBe('time');
    });

    it('should remove aria-current when set to null', () => {
      const element = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      setAriaCurrent(element, 'date');
      setAriaCurrent(element, null);
      expect(element.getAttribute('aria-current')).toBeNull();
    });
  });

  describe('setAriaExpanded', () => {
    it('should set aria-expanded attribute to true', () => {
      const element = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      setAriaExpanded(element, true);
      expect(element.getAttribute('aria-expanded')).toBe('true');
    });

    it('should set aria-expanded attribute to false', () => {
      const element = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      setAriaExpanded(element, false);
      expect(element.getAttribute('aria-expanded')).toBe('false');
    });

    it('should update existing aria-expanded', () => {
      const element = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      setAriaExpanded(element, true);
      setAriaExpanded(element, false);
      expect(element.getAttribute('aria-expanded')).toBe('false');
    });

    it('should remove aria-expanded when set to null', () => {
      const element = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      setAriaExpanded(element, true);
      setAriaExpanded(element, null);
      expect(element.getAttribute('aria-expanded')).toBeNull();
    });
  });

  describe('setAriaHidden', () => {
    it('should set aria-hidden attribute to true', () => {
      const element = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      setAriaHidden(element, true);
      expect(element.getAttribute('aria-hidden')).toBe('true');
    });

    it('should set aria-hidden attribute to false', () => {
      const element = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      setAriaHidden(element, false);
      expect(element.getAttribute('aria-hidden')).toBe('false');
    });

    it('should update existing aria-hidden', () => {
      const element = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      setAriaHidden(element, true);
      setAriaHidden(element, false);
      expect(element.getAttribute('aria-hidden')).toBe('false');
    });

    it('should remove aria-hidden when set to null', () => {
      const element = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      setAriaHidden(element, true);
      setAriaHidden(element, null);
      expect(element.getAttribute('aria-hidden')).toBeNull();
    });
  });

  describe('createAriaLiveRegion', () => {
    it('should create aria-live region with correct attributes', () => {
      const region = createAriaLiveRegion(mockSvg);
      expect(region).not.toBeNull();
      expect(region.getAttribute('aria-live')).toBe('polite');
      expect(region.getAttribute('aria-atomic')).toBe('true');
      expect(region.getAttribute('id')).toBe('aria-live-region');
      expect(region.classList.contains('sr-only')).toBe(true);
    });

    it('should append live region to SVG', () => {
      const region = createAriaLiveRegion(mockSvg);
      const found = mockSvg.querySelector('#aria-live-region');
      expect(found).toBe(region);
    });
  });

  describe('announceToScreenReader', () => {
    it('should update live region text content', async () => {
      const region = createAriaLiveRegion(mockSvg);
      announceToScreenReader('Selected January 15, 2024', mockSvg);
      // Wait for setTimeout to complete
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(region.textContent).toBe('Selected January 15, 2024');
    });

    it('should use polite priority by default', () => {
      const region = createAriaLiveRegion(mockSvg);
      announceToScreenReader('Test message', mockSvg);
      expect(region.getAttribute('aria-live')).toBe('polite');
    });

    it('should allow assertive priority', () => {
      const region = createAriaLiveRegion(mockSvg);
      announceToScreenReader('Critical error', mockSvg, 'assertive');
      expect(region.getAttribute('aria-live')).toBe('assertive');
    });

    it('should create live region if it does not exist', async () => {
      announceToScreenReader('Test message', mockSvg);
      const region = mockSvg.querySelector('#aria-live-region');
      expect(region).not.toBeNull();
      // Wait for setTimeout to complete
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(region.textContent).toBe('Test message');
    });
  });

  describe('generateMonthLabel', () => {
    it('should generate label for month with days and year', () => {
      const label = generateMonthLabel(0, 2024); // January
      expect(label).toContain('January');
      expect(label).toContain('31');
      expect(label).toContain('days');
      expect(label).toContain('2024');
    });

    it('should handle February in leap year', () => {
      const label = generateMonthLabel(1, 2024); // February 2024 (leap year)
      expect(label).toContain('February');
      expect(label).toContain('29');
    });

    it('should handle February in non-leap year', () => {
      const label = generateMonthLabel(1, 2023); // February 2023
      expect(label).toContain('February');
      expect(label).toContain('28');
    });
  });

  describe('generateDayLabel', () => {
    it('should generate label for day with month and year', () => {
      const label = generateDayLabel(15, 0, 2024); // January 15, 2024
      expect(label).toContain('January');
      expect(label).toContain('15');
      expect(label).toContain('2024');
    });

    it('should handle single digit days', () => {
      const label = generateDayLabel(5, 0, 2024);
      expect(label).toContain('5');
    });
  });

  describe('generateHourLabel', () => {
    it('should generate 24-hour format label', () => {
      const label = generateHourLabel(14, false, 'AM');
      expect(label).toContain('14');
      expect(label).toContain('00');
    });

    it('should generate 12-hour format label with AM', () => {
      const label = generateHourLabel(2, true, 'AM');
      expect(label).toContain('2');
      expect(label).toContain('AM');
    });

    it('should generate 12-hour format label with PM', () => {
      const label = generateHourLabel(2, true, 'PM');
      expect(label).toContain('2');
      expect(label).toContain('PM');
    });

    it('should handle hour 12 in 12-hour format', () => {
      const label = generateHourLabel(12, true, 'PM');
      expect(label).toContain('12');
      expect(label).toContain('PM');
    });
  });

  describe('generateMinuteLabel', () => {
    it('should generate label with hour and minute in 24-hour format', () => {
      const label = generateMinuteLabel(14, 30, false, 'AM');
      expect(label).toContain('14');
      expect(label).toContain('30');
    });

    it('should generate label with hour and minute in 12-hour format', () => {
      const label = generateMinuteLabel(2, 30, true, 'PM');
      expect(label).toContain('2');
      expect(label).toContain('30');
      expect(label).toContain('PM');
    });

    it('should pad minutes with zero when needed', () => {
      const label = generateMinuteLabel(14, 5, false, 'AM');
      expect(label).toContain('05');
    });
  });
});
