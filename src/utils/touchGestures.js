/**
 * Touch Gesture Utilities
 * 
 * Provides swipe gesture detection for touch devices.
 * Supports horizontal swipe gestures (left/right) with configurable thresholds.
 */

const SWIPE_MIN_DISTANCE = 50; // pixels
const SWIPE_MAX_TIME = 300; // milliseconds

// Store gesture state per element
const gestureState = new WeakMap();

/**
 * Sets up swipe gesture detection on an element.
 * 
 * @param {HTMLElement} element - The element to attach swipe detection to
 * @param {Object} callbacks - Callback functions
 * @param {Function} [callbacks.onSwipeLeft] - Called when a left swipe is detected
 * @param {Function} [callbacks.onSwipeRight] - Called when a right swipe is detected
 */
export function setupSwipeGesture(element, callbacks = {}) {
  if (!element) {
    throw new Error('Element is required');
  }

  // Clean up any existing gesture handlers
  cleanupSwipeGesture(element);

  let startX = 0;
  let startY = 0;
  let startTime = 0;

  const handleTouchStart = (e) => {
    if (e.touches.length === 0) return;
    
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    startTime = Date.now();
  };

  const handleTouchEnd = (e) => {
    if (e.changedTouches.length === 0) return;

    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const endTime = Date.now();

    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const deltaTime = endTime - startTime;

    // Check if this is a horizontal swipe
    const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY);
    const meetsDistanceThreshold = Math.abs(deltaX) >= SWIPE_MIN_DISTANCE;
    const meetsTimeThreshold = deltaTime < SWIPE_MAX_TIME;

    if (isHorizontalSwipe && meetsDistanceThreshold && meetsTimeThreshold) {
      if (deltaX > 0) {
        // Swipe right
        if (callbacks.onSwipeRight) {
          callbacks.onSwipeRight();
        }
      } else {
        // Swipe left
        if (callbacks.onSwipeLeft) {
          callbacks.onSwipeLeft();
        }
      }
    }
  };

  // Store handlers for cleanup
  gestureState.set(element, {
    handleTouchStart,
    handleTouchEnd
  });

  // Attach event listeners
  element.addEventListener('touchstart', handleTouchStart, { passive: true });
  element.addEventListener('touchend', handleTouchEnd, { passive: true });
}

/**
 * Removes swipe gesture detection from an element.
 * 
 * @param {HTMLElement} element - The element to remove swipe detection from
 */
export function cleanupSwipeGesture(element) {
  if (!element) return;

  const state = gestureState.get(element);
  if (state) {
    element.removeEventListener('touchstart', state.handleTouchStart);
    element.removeEventListener('touchend', state.handleTouchEnd);
    gestureState.delete(element);
  }
}
