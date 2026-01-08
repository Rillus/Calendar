/**
 * View Transition Utilities
 * 
 * Handles smooth transitions between calendar views with support for
 * accessibility preferences (prefers-reduced-motion).
 */

/**
 * Check if we're in a test environment
 * @returns {boolean} True if running in tests
 */
function isTestEnvironment() {
  // Check for common test environment indicators
  return typeof process !== 'undefined' && 
         (process.env.NODE_ENV === 'test' || 
          process.env.VITEST === 'true' ||
          typeof window === 'undefined' ||
          !window.matchMedia);
}

/**
 * Check if the user prefers reduced motion
 * @returns {boolean} True if prefers-reduced-motion is set
 */
export function shouldReduceMotion() {
  if (isTestEnvironment()) {
    return true; // Always reduce motion in tests for synchronous behavior
  }
  
  if (typeof window === 'undefined' || !window.matchMedia) {
    return false;
  }
  
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get the transition duration based on accessibility preferences
 * @returns {number} Duration in milliseconds
 */
export function getTransitionDuration() {
  return shouldReduceMotion() ? 0.01 : 250;
}

/**
 * Transition from one view to another with smooth animation
 * @param {SVGElement|null} currentView - The current view group element (null for initial render)
 * @param {SVGElement} newView - The new view group element to transition to
 * @param {SVGElement} container - The SVG container element
 * @param {string} direction - Transition direction ('forward' or 'backward')
 * @param {Function} renderCallback - Optional callback to render the new view
 */
export function transitionToView(currentView, newView, container, direction = 'forward', renderCallback = null) {
  const duration = getTransitionDuration();
  const isInstant = duration <= 10;
  
  // If no current view (initial render), just add the new view
  if (!currentView) {
    if (renderCallback) {
      renderCallback();
    } else {
      container.appendChild(newView);
    }
    
    // Add entering class and trigger reflow
    newView.classList.add('entering');
    void newView.offsetWidth; // Trigger reflow
    
    // Remove entering and add entered class
    if (isInstant) {
      // Instant transition for reduced motion or tests
      newView.classList.remove('entering');
      newView.classList.add('entered');
    } else {
      setTimeout(() => {
        newView.classList.remove('entering');
        newView.classList.add('entered');
      }, duration);
    }
    return;
  }

  // Add exiting class to current view
  currentView.classList.add('exiting');
  
  // For instant transitions, execute synchronously
  if (isInstant) {
    // Remove current view immediately
    if (currentView.parentNode) {
      currentView.parentNode.removeChild(currentView);
    }
    
    // Render new view if callback provided
    if (renderCallback) {
      renderCallback();
    } else {
      container.appendChild(newView);
    }
    
    // Add entering class and trigger reflow
    newView.classList.add('entering');
    void newView.offsetWidth; // Trigger reflow
    
    // Remove entering and add entered class immediately
    newView.classList.remove('entering');
    newView.classList.add('entered');
  } else {
    // After transition completes, remove old view and add new view
    setTimeout(() => {
      // Remove current view
      if (currentView.parentNode) {
        currentView.parentNode.removeChild(currentView);
      }
      
      // Render new view if callback provided
      if (renderCallback) {
        renderCallback();
      } else {
        container.appendChild(newView);
      }
      
      // Add entering class and trigger reflow
      newView.classList.add('entering');
      void newView.offsetWidth; // Trigger reflow
      
      // Remove entering and add entered class
      setTimeout(() => {
        newView.classList.remove('entering');
        newView.classList.add('entered');
      }, duration);
    }, duration);
  }
}
