import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  prefersReducedMotion,
  shouldAnimate,
  addPulseAnimation,
  addRippleEffect,
  addHoverScale
} from '../src/utils/animationUtils.js';

describe('animationUtils', () => {
  let originalMatchMedia;

  beforeEach(() => {
    // Store original matchMedia
    originalMatchMedia = window.matchMedia;
  });

  afterEach(() => {
    // Restore original matchMedia
    window.matchMedia = originalMatchMedia;
    vi.restoreAllMocks();
  });

  describe('prefersReducedMotion', () => {
    it('should return true when prefers-reduced-motion is reduce', () => {
      window.matchMedia = vi.fn((query) => {
        if (query === '(prefers-reduced-motion: reduce)') {
          return { matches: true };
        }
        return { matches: false };
      });

      expect(prefersReducedMotion()).toBe(true);
    });

    it('should return false when prefers-reduced-motion is not reduce', () => {
      window.matchMedia = vi.fn((query) => {
        if (query === '(prefers-reduced-motion: reduce)') {
          return { matches: false };
        }
        return { matches: false };
      });

      expect(prefersReducedMotion()).toBe(false);
    });

    it('should handle missing matchMedia gracefully', () => {
      window.matchMedia = undefined;
      // Should not throw, returns false as fallback
      expect(prefersReducedMotion()).toBe(false);
    });
  });

  describe('shouldAnimate', () => {
    it('should return false when prefers-reduced-motion is reduce', () => {
      window.matchMedia = vi.fn((query) => {
        if (query === '(prefers-reduced-motion: reduce)') {
          return { matches: true };
        }
        return { matches: false };
      });

      expect(shouldAnimate()).toBe(false);
    });

    it('should return true when prefers-reduced-motion is not reduce', () => {
      window.matchMedia = vi.fn((query) => {
        if (query === '(prefers-reduced-motion: reduce)') {
          return { matches: false };
        }
        return { matches: false };
      });

      expect(shouldAnimate()).toBe(true);
    });
  });

  describe('addPulseAnimation', () => {
    it('should add pulse animation class when animation is enabled', () => {
      window.matchMedia = vi.fn(() => ({ matches: false }));

      const element = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      addPulseAnimation(element);

      expect(element.classList.contains('pulse-animation')).toBe(true);
    });

    it('should not add pulse animation class when prefers-reduced-motion is reduce', () => {
      window.matchMedia = vi.fn((query) => {
        if (query === '(prefers-reduced-motion: reduce)') {
          return { matches: true };
        }
        return { matches: false };
      });

      const element = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      addPulseAnimation(element);

      expect(element.classList.contains('pulse-animation')).toBe(false);
    });

    it('should remove animation class after duration', (done) => {
      window.matchMedia = vi.fn(() => ({ matches: false }));

      const element = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      addPulseAnimation(element, 50); // 50ms for testing

      expect(element.classList.contains('pulse-animation')).toBe(true);

      setTimeout(() => {
        expect(element.classList.contains('pulse-animation')).toBe(false);
        done();
      }, 60);
    });
  });

  describe('addRippleEffect', () => {
    it('should create ripple element when animation is enabled', () => {
      window.matchMedia = vi.fn(() => ({ matches: false }));

      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 100 100');
      const element = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      element.setAttribute('d', 'M 0 0 L 50 50');
      svg.appendChild(element);

      const event = {
        clientX: 25,
        clientY: 25
      };

      addRippleEffect(element, event, svg);

      const ripple = svg.querySelector('.ripple-effect');
      expect(ripple).toBeTruthy();
    });

    it('should not create ripple when prefers-reduced-motion is reduce', () => {
      window.matchMedia = vi.fn((query) => {
        if (query === '(prefers-reduced-motion: reduce)') {
          return { matches: true };
        }
        return { matches: false };
      });

      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 100 100');
      const element = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      svg.appendChild(element);

      const event = {
        clientX: 25,
        clientY: 25
      };

      addRippleEffect(element, event, svg);

      const ripple = svg.querySelector('.ripple-effect');
      expect(ripple).toBeFalsy();
    });

    it('should remove ripple element after animation completes', (done) => {
      window.matchMedia = vi.fn(() => ({ matches: false }));

      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 100 100');
      const element = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      element.setAttribute('d', 'M 0 0 L 50 50');
      svg.appendChild(element);

      const event = {
        clientX: 25,
        clientY: 25
      };

      addRippleEffect(element, event, svg, 50); // 50ms for testing

      setTimeout(() => {
        const ripple = svg.querySelector('.ripple-effect');
        expect(ripple).toBeFalsy();
        done();
      }, 60);
    });
  });

  describe('addHoverScale', () => {
    it('should add hover-scale class when animation is enabled', () => {
      window.matchMedia = vi.fn(() => ({ matches: false }));

      const element = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      addHoverScale(element);

      expect(element.classList.contains('hover-scale')).toBe(true);
    });

    it('should not add hover-scale class when prefers-reduced-motion is reduce', () => {
      window.matchMedia = vi.fn((query) => {
        if (query === '(prefers-reduced-motion: reduce)') {
          return { matches: true };
        }
        return { matches: false };
      });

      const element = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      addHoverScale(element);

      expect(element.classList.contains('hover-scale')).toBe(false);
    });
  });
});
