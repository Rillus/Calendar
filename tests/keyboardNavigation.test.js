import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  makeSvgElementFocusable,
  handleArrowKeyNavigation,
  handleActivationKey,
  getNextSegmentIndex,
  getPreviousSegmentIndex
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
});
