/**
 * Keyboard Navigation Utilities for SVG Elements
 * 
 * Provides functions to make SVG elements keyboard accessible and handle
 * keyboard navigation between segments.
 */

/**
 * Makes an SVG element focusable and adds keyboard event handlers
 * 
 * @param {SVGElement} element - The SVG element to make focusable
 * @param {Object} options - Configuration options
 * @param {number} [options.tabindex=0] - Tab index value
 * @param {Function} [options.onActivate] - Callback for Enter/Space activation
 * @param {Function} [options.onArrowKey] - Callback for arrow key navigation (direction: 'left'|'right'|'up'|'down')
 * @param {Function} [options.onHome] - Callback for Home key
 * @param {Function} [options.onEnd] - Callback for End key
 */
export function makeSvgElementFocusable(element, options = {}) {
  const {
    tabindex = 0,
    onActivate,
    onArrowKey,
    onHome,
    onEnd
  } = options;

  // Make element focusable
  element.setAttribute('tabindex', String(tabindex));

  // Add focus/blur handlers for visual indicators
  element.addEventListener('focus', () => {
    element.classList.add('focused');
  });

  element.addEventListener('blur', () => {
    element.classList.remove('focused');
  });

  // Add keyboard event handler
  element.addEventListener('keydown', (event) => {
    const { key } = event;

    // Handle activation keys (Enter, Space)
    if (handleActivationKey(event)) {
      if (onActivate) {
        event.preventDefault();
        onActivate();
      }
      return;
    }

    // Handle arrow keys
    if (key === 'ArrowRight' || key === 'ArrowLeft' || key === 'ArrowUp' || key === 'ArrowDown') {
      if (onArrowKey) {
        event.preventDefault();
        let direction;
        if (key === 'ArrowRight') direction = 'right';
        else if (key === 'ArrowLeft') direction = 'left';
        else if (key === 'ArrowUp') direction = 'up';
        else if (key === 'ArrowDown') direction = 'down';
        onArrowKey(direction);
      }
      return;
    }

    // Handle Home key
    if (key === 'Home') {
      if (onHome) {
        event.preventDefault();
        onHome();
      }
      return;
    }

    // Handle End key
    if (key === 'End') {
      if (onEnd) {
        event.preventDefault();
        onEnd();
      }
      return;
    }
  });
}

/**
 * Handles arrow key navigation between segments
 * 
 * @param {string} direction - Direction of navigation ('left'|'right'|'up'|'down')
 * @param {number} currentIndex - Current segment index
 * @param {number} totalSegments - Total number of segments
 * @param {Object} options - Navigation options
 * @param {boolean} [options.wrap=true] - Whether to wrap around at boundaries
 * @returns {number} - New segment index
 */
export function handleArrowKeyNavigation(direction, currentIndex, totalSegments, options = {}) {
  const { wrap = true } = options;

  if (direction === 'right' || direction === 'down') {
    return getNextSegmentIndex(currentIndex, totalSegments, wrap);
  } else if (direction === 'left' || direction === 'up') {
    return getPreviousSegmentIndex(currentIndex, totalSegments, wrap);
  }

  return currentIndex;
}

/**
 * Checks if the key event is an activation key (Enter or Space)
 * 
 * @param {KeyboardEvent} event - Keyboard event
 * @returns {boolean} - True if Enter or Space key
 */
export function handleActivationKey(event) {
  return event.key === 'Enter' || event.key === ' ';
}

/**
 * Gets the next segment index with wrapping
 * 
 * @param {number} currentIndex - Current index
 * @param {number} totalSegments - Total number of segments
 * @param {boolean} [wrap=true] - Whether to wrap around
 * @returns {number} - Next index
 */
export function getNextSegmentIndex(currentIndex, totalSegments, wrap = true) {
  if (totalSegments <= 1) return 0;
  
  const next = currentIndex + 1;
  if (next >= totalSegments) {
    return wrap ? 0 : currentIndex;
  }
  return next;
}

/**
 * Gets the previous segment index with wrapping
 * 
 * @param {number} currentIndex - Current index
 * @param {number} totalSegments - Total number of segments
 * @param {boolean} [wrap=true] - Whether to wrap around
 * @returns {number} - Previous index
 */
export function getPreviousSegmentIndex(currentIndex, totalSegments, wrap = true) {
  if (totalSegments <= 1) return 0;
  
  const prev = currentIndex - 1;
  if (prev < 0) {
    return wrap ? totalSegments - 1 : currentIndex;
  }
  return prev;
}
