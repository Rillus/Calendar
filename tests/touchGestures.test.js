import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setupSwipeGesture, cleanupSwipeGesture } from '../src/utils/touchGestures.js';

describe('touchGestures', () => {
  let element;
  let callbacks;

  beforeEach(() => {
    // Create a test element
    element = document.createElement('div');
    document.body.appendChild(element);
    
    // Create mock callbacks
    callbacks = {
      onSwipeLeft: vi.fn(),
      onSwipeRight: vi.fn()
    };
  });

  afterEach(() => {
    // Cleanup
    if (element && element.parentNode) {
      cleanupSwipeGesture(element);
      element.parentNode.removeChild(element);
    }
  });

  describe('setupSwipeGesture', () => {
    it('should detect a left swipe (deltaX < 0)', () => {
      setupSwipeGesture(element, callbacks);

      // Simulate touch start
      const touchStart = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 50 }],
        cancelable: true,
        bubbles: true
      });
      element.dispatchEvent(touchStart);

      // Simulate touch end with left swipe (> 50px in < 300ms)
      const touchEnd = new TouchEvent('touchend', {
        changedTouches: [{ clientX: 40, clientY: 50 }], // 60px left
        cancelable: true,
        bubbles: true
      });
      element.dispatchEvent(touchEnd);

      expect(callbacks.onSwipeLeft).toHaveBeenCalledTimes(1);
      expect(callbacks.onSwipeRight).not.toHaveBeenCalled();
    });

    it('should detect a right swipe (deltaX > 0)', () => {
      setupSwipeGesture(element, callbacks);

      // Simulate touch start
      const touchStart = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 50 }],
        cancelable: true,
        bubbles: true
      });
      element.dispatchEvent(touchStart);

      // Simulate touch end with right swipe
      const touchEnd = new TouchEvent('touchend', {
        changedTouches: [{ clientX: 160, clientY: 50 }], // 60px right
        cancelable: true,
        bubbles: true
      });
      element.dispatchEvent(touchEnd);

      expect(callbacks.onSwipeRight).toHaveBeenCalledTimes(1);
      expect(callbacks.onSwipeLeft).not.toHaveBeenCalled();
    });

    it('should not trigger callback for swipe less than minimum distance (50px)', () => {
      setupSwipeGesture(element, callbacks);

      const touchStart = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 50 }],
        cancelable: true,
        bubbles: true
      });
      element.dispatchEvent(touchStart);

      const touchEnd = new TouchEvent('touchend', {
        changedTouches: [{ clientX: 140, clientY: 50 }], // 40px right (< 50px)
        cancelable: true,
        bubbles: true
      });
      element.dispatchEvent(touchEnd);

      expect(callbacks.onSwipeLeft).not.toHaveBeenCalled();
      expect(callbacks.onSwipeRight).not.toHaveBeenCalled();
    });

    it('should not trigger callback for swipe taking too long (> 300ms)', async () => {
      setupSwipeGesture(element, callbacks);

      const touchStart = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 50 }],
        cancelable: true,
        bubbles: true
      });
      element.dispatchEvent(touchStart);

      // Wait longer than 300ms
      await new Promise(resolve => setTimeout(resolve, 350));

      const touchEnd = new TouchEvent('touchend', {
        changedTouches: [{ clientX: 160, clientY: 50 }], // 60px right
        cancelable: true,
        bubbles: true
      });
      element.dispatchEvent(touchEnd);

      expect(callbacks.onSwipeLeft).not.toHaveBeenCalled();
      expect(callbacks.onSwipeRight).not.toHaveBeenCalled();
    });

    it('should not trigger callback for vertical swipe (not horizontal)', () => {
      setupSwipeGesture(element, callbacks);

      const touchStart = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 50 }],
        cancelable: true,
        bubbles: true
      });
      element.dispatchEvent(touchStart);

      // Vertical swipe (deltaY > deltaX)
      const touchEnd = new TouchEvent('touchend', {
        changedTouches: [{ clientX: 110, clientY: 130 }], // 80px down, 10px right
        cancelable: true,
        bubbles: true
      });
      element.dispatchEvent(touchEnd);

      expect(callbacks.onSwipeLeft).not.toHaveBeenCalled();
      expect(callbacks.onSwipeRight).not.toHaveBeenCalled();
    });

    it('should handle multiple swipes', () => {
      setupSwipeGesture(element, callbacks);

      // First swipe left
      element.dispatchEvent(new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 50 }],
        cancelable: true,
        bubbles: true
      }));
      element.dispatchEvent(new TouchEvent('touchend', {
        changedTouches: [{ clientX: 40, clientY: 50 }],
        cancelable: true,
        bubbles: true
      }));

      // Second swipe right
      element.dispatchEvent(new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 50 }],
        cancelable: true,
        bubbles: true
      }));
      element.dispatchEvent(new TouchEvent('touchend', {
        changedTouches: [{ clientX: 160, clientY: 50 }],
        cancelable: true,
        bubbles: true
      }));

      expect(callbacks.onSwipeLeft).toHaveBeenCalledTimes(1);
      expect(callbacks.onSwipeRight).toHaveBeenCalledTimes(1);
    });

    it('should handle missing callbacks gracefully', () => {
      setupSwipeGesture(element, {});

      const touchStart = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 50 }],
        cancelable: true,
        bubbles: true
      });
      element.dispatchEvent(touchStart);

      const touchEnd = new TouchEvent('touchend', {
        changedTouches: [{ clientX: 40, clientY: 50 }],
        cancelable: true,
        bubbles: true
      });
      
      // Should not throw
      expect(() => element.dispatchEvent(touchEnd)).not.toThrow();
    });

    it('should handle touchmove without preventing default (for scrolling)', () => {
      setupSwipeGesture(element, callbacks);

      const touchStart = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 50 }],
        cancelable: true,
        bubbles: true
      });
      element.dispatchEvent(touchStart);

      // Touch move should not interfere
      const touchMove = new TouchEvent('touchmove', {
        touches: [{ clientX: 90, clientY: 60 }],
        cancelable: true,
        bubbles: true
      });
      element.dispatchEvent(touchMove);

      // Complete the swipe
      const touchEnd = new TouchEvent('touchend', {
        changedTouches: [{ clientX: 40, clientY: 50 }],
        cancelable: true,
        bubbles: true
      });
      element.dispatchEvent(touchEnd);

      expect(callbacks.onSwipeLeft).toHaveBeenCalledTimes(1);
    });

    it('should cleanup event listeners when cleanupSwipeGesture is called', () => {
      setupSwipeGesture(element, callbacks);
      cleanupSwipeGesture(element);

      // After cleanup, events should not trigger callbacks
      element.dispatchEvent(new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 50 }],
        cancelable: true,
        bubbles: true
      }));
      element.dispatchEvent(new TouchEvent('touchend', {
        changedTouches: [{ clientX: 40, clientY: 50 }],
        cancelable: true,
        bubbles: true
      }));

      expect(callbacks.onSwipeLeft).not.toHaveBeenCalled();
      expect(callbacks.onSwipeRight).not.toHaveBeenCalled();
    });
  });
});
