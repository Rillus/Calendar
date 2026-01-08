/*********************/
/* ARIA Utilities */
/*********************/

import { getDaysInMonth } from './dateUtils.js';
import { months } from '../config/config.js';

// Full month names for ARIA labels (better for screen readers)
const fullMonthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Sets the aria-label attribute on an SVG element
 * @param {SVGElement} element - The SVG element to set the label on
 * @param {string} label - The label text
 */
export function setAriaLabel(element, label) {
  element.setAttribute('aria-label', label);
}

/**
 * Sets the role attribute on an SVG element
 * @param {SVGElement} element - The SVG element to set the role on
 * @param {string} role - The role value (e.g., 'button', 'group')
 */
export function setAriaRole(element, role) {
  element.setAttribute('role', role);
}

/**
 * Sets the aria-current attribute on an element
 * @param {SVGElement} element - The SVG element to set the current state on
 * @param {string|null} value - The current value ('date', 'time', etc.) or null to remove
 */
export function setAriaCurrent(element, value) {
  if (value === null) {
    element.removeAttribute('aria-current');
  } else {
    element.setAttribute('aria-current', value);
  }
}

/**
 * Sets the aria-expanded attribute on an element
 * @param {SVGElement} element - The SVG element to set the expanded state on
 * @param {boolean|null} value - The expanded state (true/false) or null to remove
 */
export function setAriaExpanded(element, value) {
  if (value === null) {
    element.removeAttribute('aria-expanded');
  } else {
    element.setAttribute('aria-expanded', String(value));
  }
}

/**
 * Sets the aria-hidden attribute on an element
 * @param {SVGElement} element - The SVG element to set the hidden state on
 * @param {boolean|null} value - The hidden state (true/false) or null to remove
 */
export function setAriaHidden(element, value) {
  if (value === null) {
    element.removeAttribute('aria-hidden');
  } else {
    element.setAttribute('aria-hidden', String(value));
  }
}

/**
 * Creates an ARIA live region for screen reader announcements
 * @param {SVGElement} svg - The SVG element to append the live region to
 * @returns {SVGTextElement} The created live region element
 */
export function createAriaLiveRegion(svg) {
  // Check if live region already exists
  let liveRegion = svg.querySelector('#aria-live-region');
  if (liveRegion) {
    return liveRegion;
  }

  liveRegion = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  liveRegion.setAttribute('id', 'aria-live-region');
  liveRegion.setAttribute('aria-live', 'polite');
  liveRegion.setAttribute('aria-atomic', 'true');
  liveRegion.setAttribute('class', 'sr-only');
  liveRegion.style.position = 'absolute';
  liveRegion.style.left = '-10000px';
  liveRegion.style.width = '1px';
  liveRegion.style.height = '1px';
  liveRegion.style.overflow = 'hidden';
  liveRegion.textContent = '';

  svg.appendChild(liveRegion);
  return liveRegion;
}

/**
 * Announces a message to screen readers via the ARIA live region
 * @param {string} message - The message to announce
 * @param {SVGElement} svg - The SVG element containing the live region
 * @param {string} priority - The priority level ('polite' or 'assertive'), defaults to 'polite'
 */
export function announceToScreenReader(message, svg, priority = 'polite') {
  let liveRegion = svg.querySelector('#aria-live-region');
  if (!liveRegion) {
    liveRegion = createAriaLiveRegion(svg);
  }

  liveRegion.setAttribute('aria-live', priority);
  // Clear and set text to trigger announcement
  liveRegion.textContent = '';
  // Use setTimeout to ensure the clear is processed before setting new content
  setTimeout(() => {
    liveRegion.textContent = message;
  }, 0);
}

/**
 * Generates an ARIA label for a month segment
 * @param {number} monthIndex - Zero-based month index (0-11)
 * @param {number} year - The year
 * @returns {string} The generated label
 */
export function generateMonthLabel(monthIndex, year) {
  const monthName = fullMonthNames[monthIndex];
  const days = getDaysInMonth(monthIndex, year);
  return `Select ${monthName}, ${days} days, ${year}`;
}

/**
 * Generates an ARIA label for a day segment
 * @param {number} day - The day number (1-31)
 * @param {number} monthIndex - Zero-based month index (0-11)
 * @param {number} year - The year
 * @returns {string} The generated label
 */
export function generateDayLabel(day, monthIndex, year) {
  const monthName = fullMonthNames[monthIndex];
  return `Select ${monthName} ${day}, ${year}`;
}

/**
 * Generates an ARIA label for an hour segment
 * @param {number} hour - The hour value (0-23 for 24h, 1-12 for 12h)
 * @param {boolean} useTwelveHourClock - Whether to use 12-hour format
 * @param {string} meridiem - 'AM' or 'PM' (only used in 12-hour format)
 * @returns {string} The generated label
 */
export function generateHourLabel(hour, useTwelveHourClock, meridiem) {
  if (useTwelveHourClock) {
    return `Select ${hour} ${meridiem}`;
  }
  return `Select ${String(hour).padStart(2, '0')}:00`;
}

/**
 * Generates an ARIA label for a minute segment
 * @param {number} hour - The hour value (0-23 for 24h, 1-12 for 12h)
 * @param {number} minute - The minute value (0, 5, 10, ..., 55)
 * @param {boolean} useTwelveHourClock - Whether to use 12-hour format
 * @param {string} meridiem - 'AM' or 'PM' (only used in 12-hour format)
 * @returns {string} The generated label
 */
export function generateMinuteLabel(hour, minute, useTwelveHourClock, meridiem) {
  if (useTwelveHourClock) {
    return `Select ${hour}:${String(minute).padStart(2, '0')} ${meridiem}`;
  }
  return `Select ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}
