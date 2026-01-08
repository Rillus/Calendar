import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  makeSvgElementFocusable,
  handleArrowKeyNavigation,
  handleActivationKey,
  getNextSegmentIndex,
  getPreviousSegmentIndex,
  handleYearViewNavigation,
  handleDaySelectionNavigation,
  handleHourSelectionNavigation,
  handleMinuteSelectionNavigation
} from '../src/utils/keyboardNavigation.js';

describe('keyboardNavigation', () => {
  describe('makeSvgElementFocusable', () => {
    let path;

    beforeEach(() => {
      path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    });

    it('adds tabindex="0" to element', () => {
      makeSvgElementFocusable(path);
      expect(path.getAttribute('tabindex')).toBe('0');
    });

    it('handles Enter key activation', () => {
      let activated = false;
      makeSvgElementFocusable(path, {
        onActivate: () => { activated = true; }
      });
      
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
      path.dispatchEvent(enterEvent);
      
      expect(activated).toBe(true);
    });

    it('handles Space key activation', () => {
      let activated = false;
      makeSvgElementFocusable(path, {
        onActivate: () => { activated = true; }
      });
      
      const spaceEvent = new KeyboardEvent('keydown', { key: ' ', bubbles: true });
      path.dispatchEvent(spaceEvent);
      
      expect(activated).toBe(true);
    });

    it('prevents default on Space key', () => {
      const spaceEvent = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });
      const preventDefaultSpy = vi.spyOn(spaceEvent, 'preventDefault');
      
      makeSvgElementFocusable(path, {
        onActivate: () => {}
      });
      
      path.dispatchEvent(spaceEvent);
      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('handles ArrowRight key navigation', () => {
      let navigated = false;
      makeSvgElementFocusable(path, {
        onArrowKey: (direction) => {
          navigated = true;
          expect(direction).toBe('right');
        }
      });
      
      const arrowEvent = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true });
      path.dispatchEvent(arrowEvent);
      
      expect(navigated).toBe(true);
    });

    it('handles ArrowLeft key navigation', () => {
      let navigated = false;
      makeSvgElementFocusable(path, {
        onArrowKey: (direction) => {
          navigated = true;
          expect(direction).toBe('left');
        }
      });
      
      const arrowEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true });
      path.dispatchEvent(arrowEvent);
      
      expect(navigated).toBe(true);
    });

    it('handles ArrowUp key navigation', () => {
      let navigated = false;
      makeSvgElementFocusable(path, {
        onArrowKey: (direction) => {
          navigated = true;
          expect(direction).toBe('up');
        }
      });
      
      const arrowEvent = new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true });
      path.dispatchEvent(arrowEvent);
      
      expect(navigated).toBe(true);
    });

    it('handles ArrowDown key navigation', () => {
      let navigated = false;
      makeSvgElementFocusable(path, {
        onArrowKey: (direction) => {
          navigated = true;
          expect(direction).toBe('down');
        }
      });
      
      const arrowEvent = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true });
      path.dispatchEvent(arrowEvent);
      
      expect(navigated).toBe(true);
    });

    it('handles Home key to jump to first segment', () => {
      let jumped = false;
      makeSvgElementFocusable(path, {
        onHome: () => { jumped = true; }
      });
      
      const homeEvent = new KeyboardEvent('keydown', { key: 'Home', bubbles: true });
      path.dispatchEvent(homeEvent);
      
      expect(jumped).toBe(true);
    });

    it('handles End key to jump to last segment', () => {
      let jumped = false;
      makeSvgElementFocusable(path, {
        onEnd: () => { jumped = true; }
      });
      
      const endEvent = new KeyboardEvent('keydown', { key: 'End', bubbles: true });
      path.dispatchEvent(endEvent);
      
      expect(jumped).toBe(true);
    });

    it('handles PageUp key', () => {
      let pagedUp = false;
      makeSvgElementFocusable(path, {
        onPageUp: () => { pagedUp = true; }
      });
      
      const pageUpEvent = new KeyboardEvent('keydown', { key: 'PageUp', bubbles: true });
      path.dispatchEvent(pageUpEvent);
      
      expect(pagedUp).toBe(true);
    });

    it('handles PageDown key', () => {
      let pagedDown = false;
      makeSvgElementFocusable(path, {
        onPageDown: () => { pagedDown = true; }
      });
      
      const pageDownEvent = new KeyboardEvent('keydown', { key: 'PageDown', bubbles: true });
      path.dispatchEvent(pageDownEvent);
      
      expect(pagedDown).toBe(true);
    });

    it('adds focus class on focus event', () => {
      makeSvgElementFocusable(path);
      
      const focusEvent = new Event('focus', { bubbles: true });
      path.dispatchEvent(focusEvent);
      
      expect(path.classList.contains('focused')).toBe(true);
    });

    it('removes focus class on blur event', () => {
      makeSvgElementFocusable(path);
      path.classList.add('focused');
      
      const blurEvent = new Event('blur', { bubbles: true });
      path.dispatchEvent(blurEvent);
      
      expect(path.classList.contains('focused')).toBe(false);
    });

    it('does not handle non-keyboard keys', () => {
      let activated = false;
      makeSvgElementFocusable(path, {
        onActivate: () => { activated = true; }
      });
      
      const otherEvent = new KeyboardEvent('keydown', { key: 'a', bubbles: true });
      path.dispatchEvent(otherEvent);
      
      expect(activated).toBe(false);
    });
  });

  describe('handleArrowKeyNavigation', () => {
    it('returns next index for right arrow', () => {
      const segments = [0, 1, 2, 3];
      const result = handleArrowKeyNavigation('right', 1, segments.length);
      expect(result).toBe(2);
    });

    it('returns previous index for left arrow', () => {
      const segments = [0, 1, 2, 3];
      const result = handleArrowKeyNavigation('left', 2, segments.length);
      expect(result).toBe(1);
    });

    it('wraps to first index when at end for right arrow', () => {
      const segments = [0, 1, 2, 3];
      const result = handleArrowKeyNavigation('right', 3, segments.length);
      expect(result).toBe(0);
    });

    it('wraps to last index when at start for left arrow', () => {
      const segments = [0, 1, 2, 3];
      const result = handleArrowKeyNavigation('left', 0, segments.length);
      expect(result).toBe(3);
    });

    it('handles single segment', () => {
      const result = handleArrowKeyNavigation('right', 0, 1);
      expect(result).toBe(0);
    });
  });

  describe('handleActivationKey', () => {
    it('returns true for Enter key', () => {
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      expect(handleActivationKey(event)).toBe(true);
    });

    it('returns true for Space key', () => {
      const event = new KeyboardEvent('keydown', { key: ' ' });
      expect(handleActivationKey(event)).toBe(true);
    });

    it('returns false for other keys', () => {
      const event = new KeyboardEvent('keydown', { key: 'a' });
      expect(handleActivationKey(event)).toBe(false);
    });
  });

  describe('getNextSegmentIndex', () => {
    it('returns next index', () => {
      expect(getNextSegmentIndex(1, 5)).toBe(2);
    });

    it('wraps to 0 when at end', () => {
      expect(getNextSegmentIndex(4, 5)).toBe(0);
    });

    it('handles single segment', () => {
      expect(getNextSegmentIndex(0, 1)).toBe(0);
    });
  });

  describe('getPreviousSegmentIndex', () => {
    it('returns previous index', () => {
      expect(getPreviousSegmentIndex(2, 5)).toBe(1);
    });

    it('wraps to last when at start', () => {
      expect(getPreviousSegmentIndex(0, 5)).toBe(4);
    });

    it('handles single segment', () => {
      expect(getPreviousSegmentIndex(0, 1)).toBe(0);
    });
  });

  describe('handleYearViewNavigation', () => {
    it('moves to next month with ArrowRight', () => {
      const result = handleYearViewNavigation('right', 2, 12);
      expect(result).toBe(3);
    });

    it('moves to previous month with ArrowLeft', () => {
      const result = handleYearViewNavigation('left', 5, 12);
      expect(result).toBe(4);
    });

    it('wraps to first month when at end with ArrowRight', () => {
      const result = handleYearViewNavigation('right', 11, 12);
      expect(result).toBe(0);
    });

    it('wraps to last month when at start with ArrowLeft', () => {
      const result = handleYearViewNavigation('left', 0, 12);
      expect(result).toBe(11);
    });

    it('moves 6 months forward with ArrowDown (opposite side)', () => {
      const result = handleYearViewNavigation('down', 0, 12);
      expect(result).toBe(6);
    });

    it('moves 6 months backward with ArrowUp (opposite side)', () => {
      const result = handleYearViewNavigation('up', 6, 12);
      expect(result).toBe(0);
    });

    it('wraps when moving 6 months forward crosses boundary', () => {
      const result = handleYearViewNavigation('down', 8, 12);
      expect(result).toBe(2); // 8 + 6 = 14, wraps to 2
    });

    it('wraps when moving 6 months backward crosses boundary', () => {
      const result = handleYearViewNavigation('up', 2, 12);
      expect(result).toBe(8); // 2 - 6 = -4, wraps to 8
    });

    it('returns first month index (0) with Home', () => {
      const result = handleYearViewNavigation('home', 5, 12);
      expect(result).toBe(0);
    });

    it('returns last month index (11) with End', () => {
      const result = handleYearViewNavigation('end', 5, 12);
      expect(result).toBe(11);
    });
  });

  describe('handleDaySelectionNavigation', () => {
    const daysInMonth = 31;

    it('moves to next day with ArrowRight', () => {
      const result = handleDaySelectionNavigation('right', 5, daysInMonth);
      expect(result).toBe(6);
    });

    it('moves to previous day with ArrowLeft', () => {
      const result = handleDaySelectionNavigation('left', 10, daysInMonth);
      expect(result).toBe(9);
    });

    it('wraps to first day when at end with ArrowRight', () => {
      const result = handleDaySelectionNavigation('right', daysInMonth - 1, daysInMonth);
      expect(result).toBe(0);
    });

    it('wraps to last day when at start with ArrowLeft', () => {
      const result = handleDaySelectionNavigation('left', 0, daysInMonth);
      expect(result).toBe(daysInMonth - 1);
    });

    it('moves 7 days forward (one week) with ArrowDown', () => {
      const result = handleDaySelectionNavigation('down', 5, daysInMonth);
      expect(result).toBe(12);
    });

    it('moves 7 days backward (one week) with ArrowUp', () => {
      const result = handleDaySelectionNavigation('up', 15, daysInMonth);
      expect(result).toBe(8);
    });

    it('wraps when moving 7 days forward crosses month boundary', () => {
      const result = handleDaySelectionNavigation('down', 28, daysInMonth);
      expect(result).toBe(4); // 28 + 7 = 35, wraps to 4 (35 % 31 = 4)
    });

    it('wraps when moving 7 days backward crosses month boundary', () => {
      const result = handleDaySelectionNavigation('up', 3, daysInMonth);
      expect(result).toBe(27); // 3 - 7 = -4, wraps to 27
    });

    it('returns first day index (0) with Home', () => {
      const result = handleDaySelectionNavigation('home', 15, daysInMonth);
      expect(result).toBe(0);
    });

    it('returns last day index with End', () => {
      const result = handleDaySelectionNavigation('end', 10, daysInMonth);
      expect(result).toBe(daysInMonth - 1);
    });
  });

  describe('handleHourSelectionNavigation', () => {
    const hoursInDay = 24;

    it('moves to next hour with ArrowRight', () => {
      const result = handleHourSelectionNavigation('right', 10, hoursInDay);
      expect(result).toBe(11);
    });

    it('moves to previous hour with ArrowLeft', () => {
      const result = handleHourSelectionNavigation('left', 15, hoursInDay);
      expect(result).toBe(14);
    });

    it('wraps to first hour when at end with ArrowRight', () => {
      const result = handleHourSelectionNavigation('right', hoursInDay - 1, hoursInDay);
      expect(result).toBe(0);
    });

    it('wraps to last hour when at start with ArrowLeft', () => {
      const result = handleHourSelectionNavigation('left', 0, hoursInDay);
      expect(result).toBe(hoursInDay - 1);
    });

    it('moves 6 hours forward with ArrowDown', () => {
      const result = handleHourSelectionNavigation('down', 5, hoursInDay);
      expect(result).toBe(11);
    });

    it('moves 6 hours backward with ArrowUp', () => {
      const result = handleHourSelectionNavigation('up', 15, hoursInDay);
      expect(result).toBe(9);
    });

    it('wraps when moving 6 hours forward crosses boundary', () => {
      const result = handleHourSelectionNavigation('down', 20, hoursInDay);
      expect(result).toBe(2); // 20 + 6 = 26, wraps to 2
    });

    it('wraps when moving 6 hours backward crosses boundary', () => {
      const result = handleHourSelectionNavigation('up', 2, hoursInDay);
      expect(result).toBe(20); // 2 - 6 = -4, wraps to 20
    });

    it('returns first hour index (0) with Home', () => {
      const result = handleHourSelectionNavigation('home', 12, hoursInDay);
      expect(result).toBe(0);
    });

    it('returns last hour index with End', () => {
      const result = handleHourSelectionNavigation('end', 5, hoursInDay);
      expect(result).toBe(hoursInDay - 1);
    });
  });

  describe('handleMinuteSelectionNavigation', () => {
    const minutesInHour = 60;

    it('moves to next minute with ArrowRight', () => {
      const result = handleMinuteSelectionNavigation('right', 30, minutesInHour);
      expect(result).toBe(31);
    });

    it('moves to previous minute with ArrowLeft', () => {
      const result = handleMinuteSelectionNavigation('left', 45, minutesInHour);
      expect(result).toBe(44);
    });

    it('wraps to first minute when at end with ArrowRight', () => {
      const result = handleMinuteSelectionNavigation('right', minutesInHour - 1, minutesInHour);
      expect(result).toBe(0);
    });

    it('wraps to last minute when at start with ArrowLeft', () => {
      const result = handleMinuteSelectionNavigation('left', 0, minutesInHour);
      expect(result).toBe(minutesInHour - 1);
    });

    it('moves 15 minutes forward with ArrowDown', () => {
      const result = handleMinuteSelectionNavigation('down', 10, minutesInHour);
      expect(result).toBe(25);
    });

    it('moves 15 minutes backward with ArrowUp', () => {
      const result = handleMinuteSelectionNavigation('up', 40, minutesInHour);
      expect(result).toBe(25);
    });

    it('wraps when moving 15 minutes forward crosses boundary', () => {
      const result = handleMinuteSelectionNavigation('down', 50, minutesInHour);
      expect(result).toBe(5); // 50 + 15 = 65, wraps to 5
    });

    it('wraps when moving 15 minutes backward crosses boundary', () => {
      const result = handleMinuteSelectionNavigation('up', 5, minutesInHour);
      expect(result).toBe(50); // 5 - 15 = -10, wraps to 50
    });

    it('returns first minute index (0) with Home', () => {
      const result = handleMinuteSelectionNavigation('home', 30, minutesInHour);
      expect(result).toBe(0);
    });

    it('returns last minute index with End', () => {
      const result = handleMinuteSelectionNavigation('end', 15, minutesInHour);
      expect(result).toBe(minutesInHour - 1);
    });
  });
});
