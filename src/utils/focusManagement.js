/**
 * Focus Management Utilities
 * 
 * Provides functions to manage focus indicators and handle focus transitions
 * between calendar views. Ensures WCAG 2.1 AA compliance for focus management.
 */

// Storage for saved focus states per view
const savedFocusStates = new Map();

/**
 * Sets focus indicator on an element
 * Adds the 'focused' class which is styled via CSS
 * 
 * @param {Element} element - The element to add focus indicator to
 * @param {Object} options - Configuration options
 * @param {boolean} [options.force=false] - Force add indicator even if element not focused
 */
export function setFocusIndicator(element, options = {}) {
  if (!element) return;
  
  const { force = false } = options;
  
  // Add focused class - CSS will handle the visual styling
  element.classList.add('focused');
  
  // For SVG elements, we might need to set attributes directly
  if (element.namespaceURI === 'http://www.w3.org/2000/svg') {
    // The CSS :focus pseudo-class should handle this, but we ensure class is set
    // Additional attributes can be set if needed
  }
}

/**
 * Removes focus indicator from an element
 * 
 * @param {Element} element - The element to remove focus indicator from
 */
export function removeFocusIndicator(element) {
  if (!element) return;
  
  element.classList.remove('focused');
}

/**
 * Focuses the first focusable element in a container
 * 
 * @param {Element} container - Container element to search within
 * @param {string} selector - CSS selector for focusable elements
 * @returns {Element|null} - The focused element, or null if none found
 */
export function focusFirstElement(container, selector) {
  if (!container || !selector) return null;
  
  const elements = container.querySelectorAll(selector);
  
  for (const element of elements) {
    // Check if element is focusable (has tabindex="0" or is naturally focusable)
    const tabindex = element.getAttribute('tabindex');
    const isFocusable = 
      tabindex === '0' ||
      (tabindex === null && 
       (element.tagName === 'BUTTON' || 
        element.tagName === 'A' || 
        element.tagName === 'INPUT' ||
        element.tagName === 'SELECT' ||
        element.tagName === 'TEXTAREA'));
    
    if (isFocusable) {
      element.focus();
      return element;
    }
  }
  
  return null;
}

/**
 * Saves the current focus state for a view
 * 
 * @param {string} viewName - Name of the view to save focus for
 */
export function saveFocusState(viewName) {
  if (!viewName) return;
  
  const activeElement = document.activeElement;
  
  // Only save if activeElement is actually a DOM element (not body or document)
  if (activeElement && activeElement !== document.body && activeElement !== document.documentElement) {
    savedFocusStates.set(viewName, activeElement);
  } else {
    savedFocusStates.set(viewName, null);
  }
}

/**
 * Restores the saved focus state for a view
 * Does not automatically focus the element - caller must call .focus() if needed
 * 
 * @param {string} viewName - Name of the view to restore focus for
 * @returns {Element|null} - The saved element, or null if not found
 */
export function restoreFocusState(viewName) {
  if (!viewName) return null;
  
  return savedFocusStates.get(viewName) || null;
}

/**
 * Clears saved focus state for a view
 * 
 * @param {string} viewName - Name of the view to clear focus state for
 */
export function clearFocusState(viewName) {
  if (!viewName) return;
  
  savedFocusStates.delete(viewName);
}

/**
 * Clears all saved focus states
 * Primarily used for testing
 */
export function clearAllFocusStates() {
  savedFocusStates.clear();
}

/**
 * Manages focus transition between views
 * 
 * @param {string} fromView - Name of the view transitioning from
 * @param {string} toView - Name of the view transitioning to
 * @param {Object} options - Configuration options
 * @param {Element} [options.container] - Container element for the new view
 * @param {string} [options.selector] - CSS selector for focusable elements in new view
 * @param {string} [options.restoreFromView] - View name to restore focus from (if going back)
 * @returns {Element|null} - The element that received focus, or null
 */
export function manageFocusTransition(fromView, toView, options = {}) {
  const {
    container,
    selector,
    restoreFromView
  } = options;
  
  // If restoring to a previous view, restore the saved focus
  if (restoreFromView) {
    const savedElement = restoreFocusState(restoreFromView);
    if (savedElement) {
      // Check if element still exists in DOM
      if (document.body.contains(savedElement) || document.contains(savedElement)) {
        savedElement.focus();
        return savedElement;
      } else {
        // Element no longer exists, clear the saved state
        clearFocusState(restoreFromView);
      }
    }
  }
  
  // Save current focus before transitioning
  if (fromView) {
    saveFocusState(fromView);
  }
  
  // Focus first element in new view
  if (container && selector) {
    const focusedElement = focusFirstElement(container, selector);
    if (focusedElement) {
      return focusedElement;
    }
  }
  
  return null;
}
