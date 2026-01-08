/**
 * Dark Mode Tests
 * Tests for dark mode detection, toggle, and color adaptation
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  initDarkMode,
  getDarkMode,
  setDarkMode,
  prefersDarkMode,
  getThemeColor,
  cleanupDarkMode
} from '../src/utils/darkMode.js';

describe('Dark Mode', () => {
  let originalDocumentElement;
  let originalLocalStorage;
  let mockLocalStorage;

  beforeEach(() => {
    // Reset document element
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.className = '';
    
    // Mock localStorage
    mockLocalStorage = {};
    originalLocalStorage = window.localStorage;
    window.localStorage = {
      getItem: vi.fn((key) => mockLocalStorage[key] || null),
      setItem: vi.fn((key, value) => { mockLocalStorage[key] = value; }),
      removeItem: vi.fn((key) => { delete mockLocalStorage[key]; }),
      clear: vi.fn(() => { mockLocalStorage = {}; })
    };
  });

  afterEach(() => {
    // Reset document element
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.className = '';
    
    // Restore localStorage
    window.localStorage = originalLocalStorage;
    
    // Cleanup
    cleanupDarkMode();
  });

  describe('prefersDarkMode', () => {
    it('should return true when prefers-color-scheme is dark', () => {
      // Mock matchMedia
      const mockMatchMedia = vi.fn(() => ({
        matches: true,
        media: '(prefers-color-scheme: dark)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
      }));
      window.matchMedia = mockMatchMedia;

      expect(prefersDarkMode()).toBe(true);
    });

    it('should return false when prefers-color-scheme is light', () => {
      // Mock matchMedia
      const mockMatchMedia = vi.fn(() => ({
        matches: false,
        media: '(prefers-color-scheme: dark)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
      }));
      window.matchMedia = mockMatchMedia;

      expect(prefersDarkMode()).toBe(false);
    });

    it('should return false when prefers-color-scheme is not supported', () => {
      window.matchMedia = undefined;
      expect(prefersDarkMode()).toBe(false);
    });
  });

  describe('getDarkMode', () => {
    it('should return false by default', () => {
      expect(getDarkMode()).toBe(false);
    });

    it('should return true when data-theme is dark', () => {
      document.documentElement.setAttribute('data-theme', 'dark');
      expect(getDarkMode()).toBe(true);
    });

    it('should return false when data-theme is light', () => {
      document.documentElement.setAttribute('data-theme', 'light');
      expect(getDarkMode()).toBe(false);
    });
  });

  describe('setDarkMode', () => {
    it('should set data-theme to dark when enabled is true', () => {
      setDarkMode(true);
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
      expect(getDarkMode()).toBe(true);
    });

    it('should set data-theme to light when enabled is false', () => {
      setDarkMode(false);
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
      expect(getDarkMode()).toBe(false);
    });

    it('should save preference to localStorage when enabled', () => {
      setDarkMode(true);
      expect(window.localStorage.setItem).toHaveBeenCalledWith('darkMode', 'true');
    });

    it('should save preference to localStorage when disabled', () => {
      setDarkMode(false);
      expect(window.localStorage.setItem).toHaveBeenCalledWith('darkMode', 'false');
    });
  });

  describe('initDarkMode', () => {
    it('should initialise from localStorage preference', () => {
      mockLocalStorage['darkMode'] = 'true';
      initDarkMode();
      expect(getDarkMode()).toBe(true);
    });

    it('should use system preference when no localStorage value', () => {
      mockLocalStorage['darkMode'] = null;
      
      // Mock matchMedia for dark preference
      const mockMatchMedia = vi.fn(() => ({
        matches: true,
        media: '(prefers-color-scheme: dark)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
      }));
      window.matchMedia = mockMatchMedia;

      initDarkMode();
      expect(getDarkMode()).toBe(true);
    });

    it('should use light mode when no localStorage and system prefers light', () => {
      mockLocalStorage['darkMode'] = null;
      
      // Mock matchMedia for light preference
      const mockMatchMedia = vi.fn(() => ({
        matches: false,
        media: '(prefers-color-scheme: dark)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
      }));
      window.matchMedia = mockMatchMedia;

      initDarkMode();
      expect(getDarkMode()).toBe(false);
    });

    it('should listen for system preference changes', () => {
      const mockAddEventListener = vi.fn();
      const mockMatchMedia = vi.fn(() => ({
        matches: false,
        media: '(prefers-color-scheme: dark)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: mockAddEventListener,
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
      }));
      window.matchMedia = mockMatchMedia;

      initDarkMode();
      expect(mockAddEventListener).toHaveBeenCalled();
    });
  });

  describe('getThemeColor', () => {
    beforeEach(() => {
      initDarkMode();
    });

    it('should return light color when dark mode is disabled', () => {
      setDarkMode(false);
      const lightColor = [72, 88, 154]; // JAN - #48589a
      const darkColor = [107, 123, 184]; // JAN dark - #6b7bb8
      
      expect(getThemeColor(lightColor, darkColor)).toEqual(lightColor);
    });

    it('should return dark color when dark mode is enabled', () => {
      setDarkMode(true);
      const lightColor = [72, 88, 154]; // JAN - #48589a
      const darkColor = [107, 123, 184]; // JAN dark - #6b7bb8
      
      expect(getThemeColor(lightColor, darkColor)).toEqual(darkColor);
    });

    it('should default to light color if dark color not provided', () => {
      setDarkMode(true);
      const lightColor = [72, 88, 154];
      
      expect(getThemeColor(lightColor)).toEqual(lightColor);
    });
  });

  describe('cleanupDarkMode', () => {
    it('should remove event listeners', () => {
      const mockRemoveEventListener = vi.fn();
      const mockMatchMedia = vi.fn(() => ({
        matches: false,
        media: '(prefers-color-scheme: dark)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: mockRemoveEventListener,
        dispatchEvent: vi.fn()
      }));
      window.matchMedia = mockMatchMedia;

      initDarkMode();
      cleanupDarkMode();
      
      expect(mockRemoveEventListener).toHaveBeenCalled();
    });
  });
});
