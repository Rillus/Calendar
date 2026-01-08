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
 * @param {Function} [options.onPageUp] - Callback for Page Up key
 * @param {Function} [options.onPageDown] - Callback for Page Down key
 */
export function makeSvgElementFocusable(element, options = {}) {
  const {
    tabindex = 0,
    onActivate,
    onArrowKey,
    onHome,
    onEnd,
    onPageUp,
    onPageDown
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

    // Handle Page Up key
    if (key === 'PageUp') {
      if (onPageUp) {
        event.preventDefault();
        onPageUp();
      }
      return;
    }

    // Handle Page Down key
    if (key === 'PageDown') {
      if (onPageDown) {
        event.preventDefault();
        onPageDown();
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

/**
 * Handles arrow key navigation for year view (month segments)
 * - Left/Right: Previous/next month (clockwise/counter-clockwise)
 * - Up/Down: 6 months (opposite side)
 * - Home: First month (January, index 0)
 * - End: Last month (December, index 11)
 * 
 * @param {string} direction - Direction of navigation ('left'|'right'|'up'|'down'|'home'|'end')
 * @param {number} currentIndex - Current month index (0-11)
 * @param {number} totalSegments - Total number of months (12)
 * @returns {number} - New month index
 */
export function handleYearViewNavigation(direction, currentIndex, totalSegments) {
  if (direction === 'home') {
    return 0;
  }
  
  if (direction === 'end') {
    return totalSegments - 1;
  }
  
  if (direction === 'right') {
    return getNextSegmentIndex(currentIndex, totalSegments, true);
  }
  
  if (direction === 'left') {
    return getPreviousSegmentIndex(currentIndex, totalSegments, true);
  }
  
  // Up/Down: Move 6 months (opposite side)
  if (direction === 'down') {
    const newIndex = (currentIndex + 6) % totalSegments;
    return newIndex;
  }
  
  if (direction === 'up') {
    const newIndex = (currentIndex - 6 + totalSegments) % totalSegments;
    return newIndex;
  }
  
  return currentIndex;
}

/**
 * Handles arrow key navigation for day selection view
 * - Left/Right: Previous/next day
 * - Up/Down: Previous/next week (7 days)
 * - Home: First day of month (index 0)
 * - End: Last day of month
 * 
 * @param {string} direction - Direction of navigation ('left'|'right'|'up'|'down'|'home'|'end')
 * @param {number} currentIndex - Current day index (0-based, where 0 = day 1)
 * @param {number} totalSegments - Total number of days in month
 * @returns {number} - New day index
 */
export function handleDaySelectionNavigation(direction, currentIndex, totalSegments) {
  if (direction === 'home') {
    return 0;
  }
  
  if (direction === 'end') {
    return totalSegments - 1;
  }
  
  if (direction === 'right') {
    return getNextSegmentIndex(currentIndex, totalSegments, true);
  }
  
  if (direction === 'left') {
    return getPreviousSegmentIndex(currentIndex, totalSegments, true);
  }
  
  // Up/Down: Move 7 days (one week)
  if (direction === 'down') {
    const newIndex = (currentIndex + 7) % totalSegments;
    return newIndex;
  }
  
  if (direction === 'up') {
    const newIndex = (currentIndex - 7 + totalSegments) % totalSegments;
    return newIndex;
  }
  
  return currentIndex;
}

/**
 * Handles arrow key navigation for hour selection view
 * - Left/Right: Previous/next hour
 * - Up/Down: Previous/next 6 hours
 * - Home: First hour (index 0)
 * - End: Last hour (index 23)
 * 
 * @param {string} direction - Direction of navigation ('left'|'right'|'up'|'down'|'home'|'end')
 * @param {number} currentIndex - Current hour index (0-23)
 * @param {number} totalSegments - Total number of hours (24)
 * @returns {number} - New hour index
 */
export function handleHourSelectionNavigation(direction, currentIndex, totalSegments) {
  if (direction === 'home') {
    return 0;
  }
  
  if (direction === 'end') {
    return totalSegments - 1;
  }
  
  if (direction === 'right') {
    return getNextSegmentIndex(currentIndex, totalSegments, true);
  }
  
  if (direction === 'left') {
    return getPreviousSegmentIndex(currentIndex, totalSegments, true);
  }
  
  // Up/Down: Move 6 hours
  if (direction === 'down') {
    const newIndex = (currentIndex + 6) % totalSegments;
    return newIndex;
  }
  
  if (direction === 'up') {
    const newIndex = (currentIndex - 6 + totalSegments) % totalSegments;
    return newIndex;
  }
  
  return currentIndex;
}

/**
 * Handles arrow key navigation for minute selection view
 * - Left/Right: Previous/next minute
 * - Up/Down: Previous/next 15 minutes
 * - Home: First minute (index 0)
 * - End: Last minute (index 59)
 * 
 * @param {string} direction - Direction of navigation ('left'|'right'|'up'|'down'|'home'|'end')
 * @param {number} currentIndex - Current minute index (0-59)
 * @param {number} totalSegments - Total number of minutes (60)
 * @returns {number} - New minute index
 */
export function handleMinuteSelectionNavigation(direction, currentIndex, totalSegments) {
  if (direction === 'home') {
    return 0;
  }
  
  if (direction === 'end') {
    return totalSegments - 1;
  }
  
  if (direction === 'right') {
    return getNextSegmentIndex(currentIndex, totalSegments, true);
  }
  
  if (direction === 'left') {
    return getPreviousSegmentIndex(currentIndex, totalSegments, true);
  }
  
  // Up/Down: Move 15 minutes
  if (direction === 'down') {
    const newIndex = (currentIndex + 15) % totalSegments;
    return newIndex;
  }
  
  if (direction === 'up') {
    const newIndex = (currentIndex - 15 + totalSegments) % totalSegments;
    return newIndex;
  }
  
  return currentIndex;
}
