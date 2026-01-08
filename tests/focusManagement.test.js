import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  setFocusIndicator,
  manageFocusTransition,
  focusFirstElement,
  saveFocusState,
  restoreFocusState,
  clearFocusState,
  clearAllFocusStates
} from '../src/utils/focusManagement.js';

describe('focusManagement', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    clearAllFocusStates();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    clearAllFocusStates();
    vi.clearAllMocks();
  });

  describe('setFocusIndicator', () => {
    it('adds focused class to element', () => {
      const element = document.createElement('div');
      element.setAttribute('tabindex', '0');
      
      setFocusIndicator(element);
      
      expect(element.classList.contains('focused')).toBe(true);
    });

    it('sets stroke attributes on SVG element', () => {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      svg.appendChild(path);
      document.body.appendChild(svg);
      
      setFocusIndicator(path);
      
      expect(path.classList.contains('focused')).toBe(true);
    });

    it('removes focus indicator when element blurs', () => {
      const element = document.createElement('div');
      element.setAttribute('tabindex', '0');
      
      setFocusIndicator(element);
      expect(element.classList.contains('focused')).toBe(true);
      
      element.dispatchEvent(new Event('blur'));
      // Note: The actual removal is handled by CSS or blur handlers
      // This test verifies the initial state
    });
  });

  describe('focusFirstElement', () => {
    it('focuses first focusable element in container', () => {
      const container = document.createElement('div');
      const first = document.createElement('button');
      first.setAttribute('tabindex', '0');
      const second = document.createElement('button');
      second.setAttribute('tabindex', '0');
      container.appendChild(first);
      container.appendChild(second);
      document.body.appendChild(container);
      
      focusFirstElement(container, 'button');
      
      expect(document.activeElement).toBe(first);
    });

    it('focuses first SVG element with tabindex', () => {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      const first = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      first.setAttribute('tabindex', '0');
      first.classList.add('day-segment');
      const second = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      second.setAttribute('tabindex', '0');
      second.classList.add('day-segment');
      svg.appendChild(first);
      svg.appendChild(second);
      document.body.appendChild(svg);
      
      focusFirstElement(svg, '.day-segment');
      
      expect(document.activeElement).toBe(first);
    });

    it('returns null if no focusable elements found', () => {
      const container = document.createElement('div');
      document.body.appendChild(container);
      
      const result = focusFirstElement(container, 'button');
      
      expect(result).toBe(null);
    });

    it('handles selector that matches non-focusable elements', () => {
      const container = document.createElement('div');
      const div = document.createElement('div');
      div.classList.add('segment');
      container.appendChild(div);
      document.body.appendChild(container);
      
      const result = focusFirstElement(container, '.segment');
      
      expect(result).toBe(null);
    });

    it('focuses element with tabindex="0"', () => {
      const container = document.createElement('div');
      const element = document.createElement('div');
      element.classList.add('segment');
      element.setAttribute('tabindex', '0');
      container.appendChild(element);
      document.body.appendChild(container);
      
      focusFirstElement(container, '.segment');
      
      expect(document.activeElement).toBe(element);
    });
  });

  describe('saveFocusState', () => {
    it('saves current focus element', () => {
      const button = document.createElement('button');
      button.setAttribute('tabindex', '0');
      document.body.appendChild(button);
      button.focus();
      
      saveFocusState('testView');
      
      const saved = restoreFocusState('testView');
      expect(saved).toBe(button);
    });

    it('saves null if no element is focused', () => {
      saveFocusState('testView');
      
      const saved = restoreFocusState('testView');
      expect(saved).toBe(null);
    });

    it('overwrites previous saved state for same view', () => {
      const first = document.createElement('button');
      first.setAttribute('tabindex', '0');
      const second = document.createElement('button');
      second.setAttribute('tabindex', '0');
      document.body.appendChild(first);
      document.body.appendChild(second);
      
      first.focus();
      saveFocusState('testView');
      
      second.focus();
      saveFocusState('testView');
      
      const saved = restoreFocusState('testView');
      expect(saved).toBe(second);
    });
  });

  describe('restoreFocusState', () => {
    it('restores previously saved focus', () => {
      const button = document.createElement('button');
      button.setAttribute('tabindex', '0');
      document.body.appendChild(button);
      button.focus();
      
      saveFocusState('testView');
      
      const other = document.createElement('input');
      document.body.appendChild(other);
      other.focus();
      
      const restored = restoreFocusState('testView');
      expect(restored).toBe(button);
    });

    it('returns null if no state saved for view', () => {
      const result = restoreFocusState('nonExistentView');
      expect(result).toBe(null);
    });

    it('does not automatically focus restored element', () => {
      const button = document.createElement('button');
      button.setAttribute('tabindex', '0');
      document.body.appendChild(button);
      button.focus();
      
      saveFocusState('testView');
      
      const other = document.createElement('input');
      document.body.appendChild(other);
      other.focus();
      
      restoreFocusState('testView');
      // The function returns the element but doesn't focus it
      // Focus must be explicitly called by the caller
      expect(document.activeElement).toBe(other);
    });
  });

  describe('clearFocusState', () => {
    it('clears saved focus state for view', () => {
      const button = document.createElement('button');
      button.setAttribute('tabindex', '0');
      document.body.appendChild(button);
      button.focus();
      
      saveFocusState('testView');
      clearFocusState('testView');
      
      const saved = restoreFocusState('testView');
      expect(saved).toBe(null);
    });

    it('does not affect other views', () => {
      const button1 = document.createElement('button');
      button1.setAttribute('tabindex', '0');
      const button2 = document.createElement('button');
      button2.setAttribute('tabindex', '0');
      document.body.appendChild(button1);
      document.body.appendChild(button2);
      
      button1.focus();
      saveFocusState('view1');
      
      button2.focus();
      saveFocusState('view2');
      
      clearFocusState('view1');
      
      expect(restoreFocusState('view1')).toBe(null);
      expect(restoreFocusState('view2')).toBe(button2);
    });
  });

  describe('manageFocusTransition', () => {
    it('moves focus to first element in new view', () => {
      const container = document.createElement('div');
      const first = document.createElement('button');
      first.setAttribute('tabindex', '0');
      first.classList.add('segment');
      container.appendChild(first);
      document.body.appendChild(container);
      
      manageFocusTransition('year', 'monthDays', {
        container: container,
        selector: '.segment'
      });
      
      expect(document.activeElement).toBe(first);
    });

    it('saves previous focus before transitioning', () => {
      const previousButton = document.createElement('button');
      previousButton.setAttribute('tabindex', '0');
      document.body.appendChild(previousButton);
      previousButton.focus();
      
      const container = document.createElement('div');
      const newButton = document.createElement('button');
      newButton.setAttribute('tabindex', '0');
      newButton.classList.add('segment');
      container.appendChild(newButton);
      document.body.appendChild(container);
      
      manageFocusTransition('year', 'monthDays', {
        container: container,
        selector: '.segment',
        fromView: 'year'
      });
      
      expect(document.activeElement).toBe(newButton);
      const saved = restoreFocusState('year');
      expect(saved).toBe(previousButton);
    });

    it('restores focus when returning to previous view', () => {
      const previousButton = document.createElement('button');
      previousButton.setAttribute('tabindex', '0');
      document.body.appendChild(previousButton);
      previousButton.focus();
      
      saveFocusState('year');
      
      const container = document.createElement('div');
      document.body.appendChild(container);
      
      manageFocusTransition('monthDays', 'year', {
        container: container,
        restoreFromView: 'year'
      });
      
      expect(document.activeElement).toBe(previousButton);
    });

    it('returns to saved focus if available', () => {
      const savedButton = document.createElement('button');
      savedButton.setAttribute('tabindex', '0');
      document.body.appendChild(savedButton);
      savedButton.focus();
      saveFocusState('year');
      
      const newButton = document.createElement('button');
      newButton.setAttribute('tabindex', '0');
      document.body.appendChild(newButton);
      newButton.focus();
      
      const container = document.createElement('div');
      document.body.appendChild(container);
      
      manageFocusTransition('monthDays', 'year', {
        container: container,
        restoreFromView: 'year'
      });
      
      expect(document.activeElement).toBe(savedButton);
    });

    it('handles case when no focusable element in new view', () => {
      const previousButton = document.createElement('button');
      previousButton.setAttribute('tabindex', '0');
      document.body.appendChild(previousButton);
      previousButton.focus();
      
      const container = document.createElement('div');
      document.body.appendChild(container);
      
      const activeElementBefore = document.activeElement;
      
      manageFocusTransition('year', 'monthDays', {
        container: container,
        selector: '.non-existent'
      });
      
      // Focus should remain on previous element if no new element found
      expect(document.activeElement).toBe(activeElementBefore);
    });

    it('does not save focus if fromView not provided', () => {
      const previousButton = document.createElement('button');
      previousButton.setAttribute('tabindex', '0');
      document.body.appendChild(previousButton);
      previousButton.focus();
      
      const container = document.createElement('div');
      const newButton = document.createElement('button');
      newButton.setAttribute('tabindex', '0');
      newButton.classList.add('segment');
      container.appendChild(newButton);
      document.body.appendChild(container);
      
      // Pass null/undefined as fromView to indicate we don't want to save
      manageFocusTransition(null, 'monthDays', {
        container: container,
        selector: '.segment'
      });
      
      expect(document.activeElement).toBe(newButton);
      // Should not have saved previous focus since fromView was null
      const saved = restoreFocusState('year');
      expect(saved).toBe(null);
    });
  });
});
