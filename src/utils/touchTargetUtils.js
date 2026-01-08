/**
 * Touch Target Size Utilities
 * 
 * Utilities for measuring and verifying touch target sizes to ensure
 * WCAG 2.1 AA compliance (minimum 44×44px).
 */

// WCAG 2.1 AA minimum touch target size in pixels
const MIN_TOUCH_TARGET_SIZE = 44;

/**
 * Measure the dimensions of a touch target element
 * @param {Element} element - The element to measure
 * @returns {Object} Measurement object with width, height, area, and meetsRequirement
 */
export function measureTouchTarget(element) {
  if (!element) {
    throw new Error('Invalid element provided');
  }

  let width, height;

  // For SVG elements, use getBBox() which works better in test environments
  if (element.namespaceURI === 'http://www.w3.org/2000/svg' && typeof element.getBBox === 'function') {
    try {
      const bbox = element.getBBox();
      width = bbox.width;
      height = bbox.height;
    } catch (e) {
      // If getBBox fails (element not in DOM or not rendered), fall back to getBoundingClientRect
      if (typeof element.getBoundingClientRect === 'function') {
        const rect = element.getBoundingClientRect();
        width = rect.width;
        height = rect.height;
      } else {
        throw new Error('Element cannot be measured');
      }
    }
  } else if (typeof element.getBoundingClientRect === 'function') {
    const rect = element.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
  } else {
    throw new Error('Invalid element provided - no measurement method available');
  }

  const area = width * height;
  const meetsRequirement = width >= MIN_TOUCH_TARGET_SIZE && height >= MIN_TOUCH_TARGET_SIZE;

  return {
    width,
    height,
    area,
    meetsRequirement,
    minSize: MIN_TOUCH_TARGET_SIZE
  };
}

/**
 * Get the effective touch area for an element
 * This accounts for padding and spacing that may affect touch usability
 * @param {Element} element - The element to measure
 * @returns {number} Effective touch area in pixels²
 */
export function getEffectiveTouchArea(element) {
  const measurement = measureTouchTarget(element);
  
  // For SVG paths, the bounding rect might not represent the actual touchable area
  // Calculate based on the visible area
  const rect = element.getBoundingClientRect();
  const computedStyle = window.getComputedStyle ? window.getComputedStyle(element) : null;
  
  // Account for padding if it's an HTML element
  let effectiveWidth = rect.width;
  let effectiveHeight = rect.height;
  
  if (computedStyle) {
    const paddingTop = parseFloat(computedStyle.paddingTop) || 0;
    const paddingBottom = parseFloat(computedStyle.paddingBottom) || 0;
    const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0;
    const paddingRight = parseFloat(computedStyle.paddingRight) || 0;
    
    effectiveWidth = rect.width - paddingLeft - paddingRight;
    effectiveHeight = rect.height - paddingTop - paddingBottom;
  }
  
  return effectiveWidth * effectiveHeight;
}

/**
 * Verify all touch targets within a container meet the minimum size requirement
 * @param {Element} container - Container element to search within
 * @param {string|Array<string>} selectors - CSS selector(s) for interactive elements
 * @returns {Object} Verification results with total, passing, and failures
 */
export function verifyAllTouchTargets(container, selectors = null) {
  if (!container) {
    throw new Error('Container element is required');
  }

  // Default selectors for interactive calendar elements
  const defaultSelectors = [
    '.calendar-segment',
    '.day-segment',
    '.hour-segment',
    '.minute-segment',
    '.ampm-selector',
    'button',
    '[role="button"]',
    '[tabindex="0"]'
  ];

  const selectorList = Array.isArray(selectors) ? selectors : (selectors ? [selectors] : defaultSelectors);
  
  const allElements = [];
  selectorList.forEach(selector => {
    try {
      const elements = container.querySelectorAll(selector);
      elements.forEach(el => {
        // Only include elements that are actually interactive
        if (isInteractiveElement(el)) {
          allElements.push(el);
        }
      });
    } catch (e) {
      // Invalid selector, skip it
      console.warn(`Invalid selector: ${selector}`, e);
    }
  });

  // Remove duplicates
  const uniqueElements = [...new Set(allElements)];

  const results = {
    total: uniqueElements.length,
    passing: 0,
    failures: []
  };

  uniqueElements.forEach((element, index) => {
    try {
      const measurement = measureTouchTarget(element);
      
      if (measurement.meetsRequirement) {
        results.passing++;
      } else {
        results.failures.push({
          element,
          index,
          measurement,
          selector: getSelectorForElement(element),
          className: element.className || '',
          tagName: element.tagName
        });
      }
    } catch (e) {
      // Element might not be rendered yet or invalid
      console.warn(`Failed to measure element at index ${index}:`, e);
    }
  });

  return results;
}

/**
 * Check if an element is interactive
 * @param {Element} element - Element to check
 * @returns {boolean} True if element is interactive
 */
function isInteractiveElement(element) {
  if (!element) return false;

  // Check for interactive roles
  const role = element.getAttribute('role');
  if (role === 'button' || role === 'link' || role === 'tab') {
    return true;
  }

  // Check for interactive tag names
  const tagName = element.tagName.toLowerCase();
  if (tagName === 'button' || tagName === 'a' || tagName === 'input' || tagName === 'select') {
    return true;
  }

  // Check for tabindex (focusable)
  const tabIndex = element.getAttribute('tabindex');
  if (tabIndex !== null && tabIndex !== '-1') {
    return true;
  }

  // Check for click handlers (basic check)
  if (element.onclick !== null || element.getAttribute('onclick')) {
    return true;
  }

  // Check for cursor pointer (suggests interactivity)
  const style = window.getComputedStyle ? window.getComputedStyle(element) : null;
  if (style && style.cursor === 'pointer') {
    return true;
  }

  // For SVG paths and other elements with class names that suggest interactivity
  const className = element.className || '';
  if (typeof className === 'string') {
    const interactiveClasses = ['segment', 'button', 'clickable', 'interactive'];
    if (interactiveClasses.some(cls => className.includes(cls))) {
      return true;
    }
  }

  return false;
}

/**
 * Get a CSS selector for an element (for reporting)
 * @param {Element} element - Element to get selector for
 * @returns {string} CSS selector
 */
function getSelectorForElement(element) {
  if (!element) return '';

  // Try ID first
  if (element.id) {
    return `#${element.id}`;
  }

  // Try class name
  const className = element.className;
  if (className && typeof className === 'string') {
    const classes = className.split(' ').filter(c => c).slice(0, 1);
    if (classes.length > 0) {
      return `.${classes[0]}`;
    }
  }

  // Fall back to tag name
  return element.tagName.toLowerCase();
}

/**
 * Get recommended minimum spacing between touch targets
 * @returns {number} Recommended spacing in pixels
 */
export function getRecommendedSpacing() {
  return 8; // WCAG 2.1 recommends at least 8px spacing
}

/**
 * Check if spacing between two elements is adequate
 * @param {Element} element1 - First element
 * @param {Element} element2 - Second element
 * @param {number} minSpacing - Minimum spacing in pixels (default: 8)
 * @returns {Object} Spacing check result
 */
export function checkSpacing(element1, element2, minSpacing = getRecommendedSpacing()) {
  if (!element1 || !element2) {
    throw new Error('Both elements are required');
  }

  const rect1 = element1.getBoundingClientRect();
  const rect2 = element2.getBoundingClientRect();

  // Calculate distance between elements
  const horizontalDistance = Math.max(0, Math.max(rect1.left - rect2.right, rect2.left - rect1.right));
  const verticalDistance = Math.max(0, Math.max(rect1.top - rect2.bottom, rect2.top - rect1.bottom));

  // If elements overlap, distance is 0
  const actualDistance = Math.max(horizontalDistance, verticalDistance);
  const meetsRequirement = actualDistance >= minSpacing;

  return {
    distance: actualDistance,
    minSpacing,
    meetsRequirement,
    horizontalDistance,
    verticalDistance
  };
}
