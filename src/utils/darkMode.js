/**
 * Dark Mode Utilities
 * Handles dark mode detection, toggle, and colour adaptation
 */

let systemPreferenceListener = null;
let systemPreferenceMediaQuery = null;

/**
 * Check if system prefers dark mode
 * @returns {boolean} True if system prefers dark mode
 */
export function prefersDarkMode() {
  if (!window.matchMedia) {
    return false;
  }
  
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch (e) {
    return false;
  }
}

/**
 * Get current dark mode state
 * @returns {boolean} True if dark mode is enabled
 */
export function getDarkMode() {
  const theme = document.documentElement.getAttribute('data-theme');
  return theme === 'dark';
}

/**
 * Set dark mode state
 * @param {boolean} enabled - Whether dark mode should be enabled
 */
export function setDarkMode(enabled) {
  const theme = enabled ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', theme);
  
  // Save preference to localStorage
  try {
    localStorage.setItem('darkMode', String(enabled));
  } catch (e) {
    // localStorage might not be available
    console.warn('Could not save dark mode preference:', e);
  }
}

/**
 * Get theme-appropriate colour
 * @param {number[]} lightColor - RGB array for light mode [r, g, b]
 * @param {number[]} darkColor - RGB array for dark mode [r, g, b] (optional)
 * @returns {number[]} RGB array for current theme
 */
export function getThemeColor(lightColor, darkColor) {
  if (!darkColor) {
    return lightColor;
  }
  
  return getDarkMode() ? darkColor : lightColor;
}

/**
 * Initialise dark mode from localStorage or system preference
 */
export function initDarkMode() {
  let shouldEnableDarkMode = false;
  
  // Check localStorage first
  try {
    const savedPreference = localStorage.getItem('darkMode');
    if (savedPreference !== null) {
      shouldEnableDarkMode = savedPreference === 'true';
    } else {
      // Use system preference if no saved preference
      shouldEnableDarkMode = prefersDarkMode();
    }
  } catch (e) {
    // If localStorage is unavailable, use system preference
    shouldEnableDarkMode = prefersDarkMode();
  }
  
  setDarkMode(shouldEnableDarkMode);
  
  // Listen for system preference changes (only when not manually set)
  if (window.matchMedia) {
    try {
      systemPreferenceMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleSystemPreferenceChange = (e) => {
        // Only update if user hasn't manually set a preference
        try {
          const savedPreference = localStorage.getItem('darkMode');
          if (savedPreference === null) {
            setDarkMode(e.matches);
          }
        } catch (err) {
          // If localStorage unavailable, always follow system preference
          setDarkMode(e.matches);
        }
      };
      
      // Use addEventListener if available (modern browsers)
      if (systemPreferenceMediaQuery.addEventListener) {
        systemPreferenceMediaQuery.addEventListener('change', handleSystemPreferenceChange);
        systemPreferenceListener = handleSystemPreferenceChange;
      } else {
        // Fallback for older browsers
        systemPreferenceMediaQuery.addListener(handleSystemPreferenceChange);
        systemPreferenceListener = handleSystemPreferenceChange;
      }
    } catch (e) {
      // matchMedia might not support addEventListener in some browsers
      console.warn('Could not set up system preference listener:', e);
    }
  }
}

/**
 * Cleanup event listeners
 */
export function cleanupDarkMode() {
  if (systemPreferenceMediaQuery && systemPreferenceListener) {
    try {
      if (systemPreferenceMediaQuery.removeEventListener) {
        systemPreferenceMediaQuery.removeEventListener('change', systemPreferenceListener);
      } else if (systemPreferenceMediaQuery.removeListener) {
        systemPreferenceMediaQuery.removeListener(systemPreferenceListener);
      }
    } catch (e) {
      console.warn('Could not remove system preference listener:', e);
    }
  }
  
  systemPreferenceListener = null;
  systemPreferenceMediaQuery = null;
}
