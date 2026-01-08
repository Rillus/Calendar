/**
 * Tests for view transition utilities
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  transitionToView, 
  shouldReduceMotion,
  getTransitionDuration 
} from '../src/utils/viewTransitions.js';

describe('viewTransitions', () => {
  let mockSvg;
  let mockCurrentView;
  let mockNewView;

  beforeEach(() => {
    // Create mock SVG element
    mockSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    document.body.appendChild(mockSvg);

    // Create mock view groups
    mockCurrentView = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    mockCurrentView.setAttribute('class', 'segments-group');
    mockSvg.appendChild(mockCurrentView);

    mockNewView = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    mockNewView.setAttribute('class', 'day-segments-group');
  });

  afterEach(() => {
    document.body.removeChild(mockSvg);
    vi.clearAllTimers();
  });

  describe('shouldReduceMotion', () => {
    it('should return false when prefers-reduced-motion is not set', () => {
      // Mock window.matchMedia to return false
      window.matchMedia = vi.fn(() => ({
        matches: false,
        media: '(prefers-reduced-motion: reduce)'
      }));

      expect(shouldReduceMotion()).toBe(false);
    });

    it('should return true when prefers-reduced-motion is set', () => {
      window.matchMedia = vi.fn(() => ({
        matches: true,
        media: '(prefers-reduced-motion: reduce)'
      }));

      expect(shouldReduceMotion()).toBe(true);
    });
  });

  describe('getTransitionDuration', () => {
    it('should return reduced duration when motion should be reduced', () => {
      window.matchMedia = vi.fn(() => ({
        matches: true,
        media: '(prefers-reduced-motion: reduce)'
      }));

      expect(getTransitionDuration()).toBe(0.01);
    });

    it('should return normal duration when motion should not be reduced', () => {
      window.matchMedia = vi.fn(() => ({
        matches: false,
        media: '(prefers-reduced-motion: reduce)'
      }));

      expect(getTransitionDuration()).toBe(250);
    });
  });

  describe('transitionToView', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      window.matchMedia = vi.fn(() => ({
        matches: false,
        media: '(prefers-reduced-motion: reduce)'
      }));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should add exiting class to current view', () => {
      transitionToView(mockCurrentView, mockNewView, mockSvg, 'forward');
      
      expect(mockCurrentView.classList.contains('exiting')).toBe(true);
    });

    it('should remove current view and add new view after transition', () => {
      transitionToView(mockCurrentView, mockNewView, mockSvg, 'forward');
      
      // Fast-forward past transition
      vi.advanceTimersByTime(250);
      
      expect(mockSvg.contains(mockCurrentView)).toBe(false);
      expect(mockSvg.contains(mockNewView)).toBe(true);
    });

    it('should add entering class to new view', () => {
      transitionToView(mockCurrentView, mockNewView, mockSvg, 'forward');
      
      // Advance past first timeout (removal of old view)
      vi.advanceTimersByTime(250);
      
      // Advance past second timeout (removal of entering class)
      vi.advanceTimersByTime(250);
      
      expect(mockNewView.classList.contains('entering')).toBe(false); // Should be removed after animation
      expect(mockNewView.classList.contains('entered')).toBe(true);
    });

    it('should handle backward direction', () => {
      transitionToView(mockCurrentView, mockNewView, mockSvg, 'backward');
      
      expect(mockCurrentView.classList.contains('exiting')).toBe(true);
      
      vi.advanceTimersByTime(250);
      
      expect(mockSvg.contains(mockNewView)).toBe(true);
    });

    it('should use reduced duration when prefers-reduced-motion is set', () => {
      window.matchMedia = vi.fn(() => ({
        matches: true,
        media: '(prefers-reduced-motion: reduce)'
      }));

      transitionToView(mockCurrentView, mockNewView, mockSvg, 'forward');
      
      // Should complete almost instantly
      vi.advanceTimersByTime(1);
      
      expect(mockSvg.contains(mockNewView)).toBe(true);
    });

    it('should handle null current view (initial render)', () => {
      transitionToView(null, mockNewView, mockSvg, 'forward');
      
      vi.advanceTimersByTime(250);
      
      expect(mockSvg.contains(mockNewView)).toBe(true);
      expect(mockNewView.classList.contains('entered')).toBe(true);
    });

    it('should trigger reflow before removing entering class', () => {
      // Create a mock that tracks property access
      let offsetWidthAccessed = false;
      Object.defineProperty(mockNewView, 'offsetWidth', {
        get: function() {
          offsetWidthAccessed = true;
          return 0;
        },
        configurable: true
      });
      
      transitionToView(mockCurrentView, mockNewView, mockSvg, 'forward');
      
      vi.advanceTimersByTime(250);
      
      // Should access offsetWidth to trigger reflow
      expect(offsetWidthAccessed).toBe(true);
    });
  });
});
