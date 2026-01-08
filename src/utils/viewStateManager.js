/**
 * ViewStateManager
 * 
 * Manages the navigation state of the calendar views.
 * Tracks view hierarchy: year → monthDays → hours → minutes
 */
export class ViewStateManager {
  constructor() {
    /**
     * @type {Array<{name: string, context: Object}>}
     * Stack of views that have been navigated into.
     * The current view is the last item in the stack.
     */
    this.viewStack = [];
  }

  /**
   * Push a new view onto the stack
   * @param {string} viewName - Name of the view ('year', 'monthDays', 'hours', 'minutes')
   * @param {Object} context - Context data for the view (e.g., { monthIndex: 0 })
   */
  pushView(viewName, context = {}) {
    this.viewStack.push({
      name: viewName,
      context: context
    });
  }

  /**
   * Pop the current view and return to the previous view
   * @returns {{name: string, context: Object} | null} The previous view, or null if at root
   */
  popView() {
    if (this.viewStack.length === 0) {
      return null;
    }

    // Remove the last view (current) and return the new last view (previous)
    this.viewStack.pop();
    
    if (this.viewStack.length === 0) {
      return { name: 'year', context: {} };
    }
    
    // Return the new current view (which is the previous view before pop)
    return this.viewStack[this.viewStack.length - 1];
  }

  /**
   * Get the name of the current view
   * @returns {string} Current view name
   */
  getCurrentView() {
    if (this.viewStack.length === 0) {
      return 'year';
    }
    return this.viewStack[this.viewStack.length - 1].name;
  }

  /**
   * Check if navigation back is possible
   * @returns {boolean} True if can go back, false if at root
   */
  canGoBack() {
    return this.viewStack.length > 0;
  }

  /**
   * Peek at the current view without modifying the stack
   * @returns {{name: string, context: Object}} Current view object
   */
  peekCurrent() {
    if (this.viewStack.length === 0) {
      return { name: 'year', context: {} };
    }
    return this.viewStack[this.viewStack.length - 1];
  }

  /**
   * Get a copy of the view stack (for testing/debugging)
   * @returns {Array<{name: string, context: Object}>} Copy of the view stack
   */
  getViewStack() {
    return [...this.viewStack];
  }
}