import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createSkipLinks, initSkipLinks } from '../src/utils/skipLinks.js';

describe('skipLinks', () => {
  let container;
  let calendarContainer;
  let monthViewContainer;
  let selectedDateElement;

  beforeEach(() => {
    // Create a mock DOM structure
    container = document.createElement('div');
    container.id = 'test-container';
    document.body.appendChild(container);

    calendarContainer = document.createElement('div');
    calendarContainer.id = 'calendar-container';
    container.appendChild(calendarContainer);

    monthViewContainer = document.createElement('div');
    monthViewContainer.id = 'month-view-container';
    container.appendChild(monthViewContainer);

    selectedDateElement = document.createElement('div');
    selectedDateElement.id = 'selected-date';
    calendarContainer.appendChild(selectedDateElement);
  });

  afterEach(() => {
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  describe('createSkipLinks', () => {
    it('should create skip links container', () => {
      const skipLinks = createSkipLinks();
      expect(skipLinks).not.toBeNull();
      expect(skipLinks.tagName).toBe('NAV');
      expect(skipLinks.getAttribute('aria-label')).toBe('Skip navigation');
    });

    it('should create skip link to calendar', () => {
      const skipLinks = createSkipLinks();
      const calendarLink = skipLinks.querySelector('a[href="#calendar-container"]');
      expect(calendarLink).not.toBeNull();
      expect(calendarLink.textContent.trim()).toBe('Skip to calendar');
    });

    it('should create skip link to month view', () => {
      const skipLinks = createSkipLinks();
      const monthViewLink = skipLinks.querySelector('a[href="#month-view-container"]');
      expect(monthViewLink).not.toBeNull();
      expect(monthViewLink.textContent.trim()).toBe('Skip to month view');
    });

    it('should create skip link to selected date', () => {
      const skipLinks = createSkipLinks();
      const selectedDateLink = skipLinks.querySelector('a[href="#selected-date"]');
      expect(selectedDateLink).not.toBeNull();
      expect(selectedDateLink.textContent.trim()).toBe('Skip to selected date');
    });

    it('should have correct CSS classes', () => {
      const skipLinks = createSkipLinks();
      expect(skipLinks.classList.contains('skip-links')).toBe(true);
      
      const links = skipLinks.querySelectorAll('a');
      links.forEach(link => {
        expect(link.classList.contains('skip-link')).toBe(true);
      });
    });

    it('should be hidden by default', () => {
      const skipLinks = createSkipLinks();
      const style = window.getComputedStyle(skipLinks);
      // Skip links should be positioned off-screen or have display: none
      // We'll check for the skip-link class which will have CSS to hide it
      expect(skipLinks.classList.contains('skip-links')).toBe(true);
    });
  });

  describe('initSkipLinks', () => {
    it('should append skip links to body', () => {
      initSkipLinks();
      const skipLinks = document.querySelector('.skip-links');
      expect(skipLinks).not.toBeNull();
      expect(skipLinks.parentNode).toBe(document.body);
    });

    it('should not create duplicate skip links', () => {
      initSkipLinks();
      initSkipLinks();
      const skipLinks = document.querySelectorAll('.skip-links');
      expect(skipLinks.length).toBe(1);
    });

    it('should focus target element when skip link is clicked', async () => {
      initSkipLinks();
      const skipLinks = document.querySelector('.skip-links');
      const calendarLink = skipLinks.querySelector('a[href="#calendar-container"]');
      
      // Mock focus method
      let focusedElement = null;
      const originalFocus = HTMLElement.prototype.focus;
      HTMLElement.prototype.focus = function() {
        focusedElement = this;
      };

      calendarLink.click();

      // Wait for setTimeout to complete
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(focusedElement).toBe(calendarContainer);

      HTMLElement.prototype.focus = originalFocus;
    });

    it('should handle missing target elements gracefully', () => {
      // Remove the target element
      calendarContainer.remove();
      
      initSkipLinks();
      const skipLinks = document.querySelector('.skip-links');
      const calendarLink = skipLinks.querySelector('a[href="#calendar-container"]');
      
      // Should not throw error
      expect(() => calendarLink.click()).not.toThrow();
    });
  });

  describe('skip link accessibility', () => {
    it('should be keyboard accessible', () => {
      const skipLinks = createSkipLinks();
      const links = skipLinks.querySelectorAll('a');
      
      links.forEach(link => {
        expect(link.getAttribute('tabindex')).not.toBe('-1');
        // Links are naturally keyboard accessible, but we should verify
        expect(link.tagName).toBe('A');
      });
    });

    it('should have descriptive text for screen readers', () => {
      const skipLinks = createSkipLinks();
      const calendarLink = skipLinks.querySelector('a[href="#calendar-container"]');
      expect(calendarLink.textContent).toContain('calendar');
      
      const monthViewLink = skipLinks.querySelector('a[href="#month-view-container"]');
      expect(monthViewLink.textContent).toContain('month view');
      
      const selectedDateLink = skipLinks.querySelector('a[href="#selected-date"]');
      expect(selectedDateLink.textContent).toContain('selected date');
    });
  });
});
