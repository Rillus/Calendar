/*********************/
/* Calendar Renderer */
/*********************/

import {
  segments,
  monthColors,
  monthColorsHover,
  monthColorsDark,
  monthColorsHoverDark,
  months,
  deg,
  fullRadius,
  notchedRadius30,
  notchedRadiusFeb,
  notchedRadiusFebLeap,
  svgSize,
  sunDistance,
  moonDistance,
  padding
} from '../config/config.js';
import { rgbToHex, getContrastColor } from '../utils/colorUtils.js';
import { getThemeColor, getDarkMode } from '../utils/darkMode.js';
import { degreesToRadians, sumTo, polarToCartesian } from '../utils/mathUtils.js';
import { createArcPath, getMoonShadowDx } from '../utils/svgUtils.js';
import { getDaysInMonth } from '../utils/dateUtils.js';
import { getMoonPhase, getMoonPhaseAngle, getMoonPhaseName } from '../utils/moonPhase.js';
import { validateDate, isDateRestricted, createValidationOptions } from '../utils/dateValidation.js';
import { ViewStateManager } from '../utils/viewStateManager.js';
import {
  setAriaLabel,
  setAriaRole,
  announceToScreenReader,
  setAriaCurrent,
  setAriaExpanded,
  setAriaHidden,
  createAriaLiveRegion,
  generateMonthLabel,
  generateDayLabel,
  generateHourLabel,
  generateMinuteLabel
} from '../utils/ariaUtils.js';
import { setupSwipeGesture, cleanupSwipeGesture } from '../utils/touchGestures.js';
import { transitionToView } from '../utils/viewTransitions.js';
import {
  makeSvgElementFocusable,
  handleArrowKeyNavigation,
  handleYearViewNavigation,
  handleDaySelectionNavigation,
  handleHourSelectionNavigation,
  handleMinuteSelectionNavigation
} from '../utils/keyboardNavigation.js';
import {
  manageFocusTransition,
  focusFirstElement
} from '../utils/focusManagement.js';
import {
  addPulseAnimation,
  addRippleEffect,
  addHoverScale
} from '../utils/animationUtils.js';
import { getWeekStartDate, getWeekDates } from '../utils/weekViewUtils.js';

// Full month names for announcements (better for screen readers)
const fullMonthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const createSafeDateCopy = (date) => new Date(date.getTime());
const normaliseTwelveHourClock = (value) => {
  if (typeof value === 'boolean') return value;

  const raw = String(value ?? '').trim().toLowerCase();
  if (raw === '' || raw === 'false' || raw === '0') return false;
  if (raw === 'true' || raw === '1') return true;
  return false;
};

/**
 * Get stroke color based on current theme
 * @returns {string} Hex color for stroke
 */
const getStrokeColor = () => {
  return getDarkMode() ? '#333' : '#fff';
};

/**
 * Get CSS variable value or fallback
 * @param {string} varName - CSS variable name
 * @param {string} fallback - Fallback value
 * @returns {string} CSS variable value or fallback
 */
const getCssVariable = (varName, fallback) => {
  if (typeof window === 'undefined' || !window.getComputedStyle) {
    return fallback;
  }
  const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return value || fallback;
};

export function createCalendarRenderer(svgElement, options = {}) {
  if (!svgElement) {
    throw new Error('SVG element is required');
  }

  // Per-instance state
  const data = [];
  const labels = [];
  const colours = [];
  const dateChangeListeners = new Set();

  let svg = svgElement;
  let centerX = svgSize / 2;
  let centerY = svgSize / 2;
  let radius = (svgSize / 2) - sunDistance - padding;
  let currentYear = new Date().getFullYear();
  let moonClipIdCounter = 0;
  let activeView = 'year';
  let activeMonthIndex = null;
  let timeSelectionEnabled = Boolean(options.timeSelectionEnabled);
  let useTwelveHourClock = normaliseTwelveHourClock(options.is12HourClock);
  let weekViewEnabled = Boolean(options.weekViewEnabled);
  let pendingDate = null;
  let pendingMeridiem = 'AM'; // only used in 12h mode
  let pendingHour24 = 0;
  let validationOptions = createValidationOptions(options.validationOptions || {});
  const viewStateManager = new ViewStateManager();
  let isRestoringView = false; // Flag to prevent pushing views during restore

  const notifyDateChanged = (date) => {
    const safeDate = createSafeDateCopy(date);
    for (const listener of dateChangeListeners) {
      try {
        listener(safeDate);
      } catch (err) {
        console.error('Date change listener failed', err);
      }
    }
  };

  const removeIfPresent = (selector) => {
    const el = svg.querySelector(selector);
    if (el) el.remove();
  };

  const removeAllIfPresent = (selector) => {
    const els = svg.querySelectorAll(selector);
    els.forEach((el) => el.remove());
  };

  const clearDaySelectionView = () => {
    removeIfPresent('.day-segments-group');
  };

  const clearWeekView = () => {
    removeIfPresent('.week-segments-group');
  };

  const clearTimeSelectionView = () => {
    removeIfPresent('.hour-segments-group');
    removeIfPresent('.minute-segments-group');
    removeIfPresent('.ampm-selector-group');
  };

  const clearYearView = () => {
    removeIfPresent('.segments-group');
    hideSunAndMoon();
  };

  const subscribeToDateChanges = (listener) => {
    dateChangeListeners.add(listener);
    return () => dateChangeListeners.delete(listener);
  };

  const showErrorMessage = (message) => {
    // Remove existing error message
    removeIfPresent('.error-message');
    
    if (!message) return;
    
    // Create error message element
    const errorGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    errorGroup.setAttribute('class', 'error-message');
    errorGroup.setAttribute('role', 'alert');
    errorGroup.setAttribute('aria-live', 'assertive');
    
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', centerX);
    text.setAttribute('y', centerY + 60);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'middle');
    text.setAttribute('class', 'error-text');
    text.setAttribute('fill', '#d32f2f');
    text.style.fontSize = `${svgSize / 30}px`;
    text.style.fontFamily = 'Helvetica, Arial, sans-serif';
    text.textContent = message;
    
    errorGroup.appendChild(text);
    svg.appendChild(errorGroup);
    
    // Auto-remove error after 5 seconds
    setTimeout(() => {
      removeIfPresent('.error-message');
    }, 5000);
  };

  const handleEscapeKey = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      
      if (!viewStateManager.canGoBack()) {
        return; // Already at root (year view)
      }

      const currentViewName = viewStateManager.getCurrentView();
      const previousView = viewStateManager.popView();
      
      // Set flag to prevent pushing views during restore
      isRestoringView = true;
      
      try {
        switch (previousView.name) {
          case 'year':
            drawCalendar();
            drawCircle();
            // Restore focus to saved year view focus (if any)
            setTimeout(() => {
              manageFocusTransition(currentViewName, 'year', {
                restoreFromView: 'year'
              });
            }, 0);
            break;
          case 'monthDays':
            // Return to day selection for that month (without pushing to stack)
            showMonthDaySelection(previousView.context.monthIndex, true);
            // Focus will be restored in showMonthDaySelection
            break;
          case 'week':
            // Return to week view (without pushing to stack)
            const weekDate = previousView.context.date ? new Date(previousView.context.date) : new Date();
            showWeekView(weekDate, true);
            // Focus will be restored in showWeekView
            break;
          case 'hours':
            // Return to hour selection (without pushing to stack)
            showHourSelection(true);
            // Focus will be restored in showHourSelection
            break;
          case 'minutes':
            // Return to minute selection (without pushing to stack)
            showMinuteSelection(true);
            // Focus will be restored in showMinuteSelection
            break;
          default:
            // Unknown view, fall back to year view
            drawCalendar();
            drawCircle();
        }
      } finally {
        isRestoringView = false;
      }
    }
  };

  const initRenderer = (svgEl) => {
    svg = svgEl;
    centerX = svgSize / 2;
    centerY = svgSize / 2;
    radius = (svgSize / 2) - sunDistance - padding;
    // Create ARIA live region for screen reader announcements
    createAriaLiveRegion(svg);
    // Add Escape key event listener
    svg.addEventListener('keydown', handleEscapeKey);
  };

  const drawCalendar = () => {
    // Switching back to year view clears any day selection overlay.
    clearDaySelectionView();
    clearWeekView();
    clearTimeSelectionView();
    activeView = 'year';
    activeMonthIndex = null;
    // Reset view state to year (root)
    viewStateManager.viewStack = [];

    // Get current view group (could be any view type)
    const currentViewGroup = svg.querySelector('.segments-group, .day-segments-group, .week-segments-group, .hour-segments-group, .minute-segments-group');
    
    // Create new segments group
    const segmentsGroupEl = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    segmentsGroupEl.setAttribute('class', 'segments-group');
    setAriaRole(segmentsGroupEl, 'group');
    setAriaExpanded(segmentsGroupEl, false); // Year view is collapsed (not expanded into days)

    // Render function that builds the year view
    const renderYearView = () => {
      data.length = 0;
      labels.length = 0;
      colours.length = 0;

      for (let i = 0; i < segments; i++) {
        const monthColor = getThemeColor(monthColors[i], monthColorsDark[i]);
        const monthColorHover = getThemeColor(monthColorsHover[i], monthColorsHoverDark[i]);
        const newColourHex = rgbToHex(monthColor);
        const hoverColourHex = rgbToHex(monthColorHover);

        data.push(deg);
        colours.push(newColourHex);
        labels.push(months[i]);

        const days = getDaysInMonth(i, currentYear);
        let outerRadiusRatio;
        if (days === 31) {
          outerRadiusRatio = fullRadius;
        } else if (days === 28) {
          outerRadiusRatio = notchedRadiusFeb;
        } else if (days === 29) {
          outerRadiusRatio = notchedRadiusFebLeap;
        } else {
          outerRadiusRatio = notchedRadius30;
        }

        const startingAngle = -degreesToRadians(sumTo(data, i)) + degreesToRadians(45);
        const arcSize = degreesToRadians(data[i]);
        const endingAngle = startingAngle + arcSize;

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', createArcPath(centerX, centerY, radius, startingAngle, endingAngle, outerRadiusRatio));
        path.setAttribute('fill', newColourHex);
        path.setAttribute('stroke', getStrokeColor());
        path.setAttribute('stroke-width', '1');
        path.setAttribute('data-segment-index', i);
        path.setAttribute('class', 'calendar-segment');
        path.setAttribute('data-base-color', newColourHex);
        path.setAttribute('data-hover-color', hoverColourHex);
        path.style.cursor = 'pointer';

        // Add ARIA attributes
        setAriaRole(path, 'button');
        setAriaLabel(path, generateMonthLabel(i, currentYear));

        // Add hover scale effect
        addHoverScale(path);

        path.addEventListener('mouseenter', (e) => {
          e.target.setAttribute('fill', hoverColourHex);
        });
        path.addEventListener('mouseleave', (e) => {
          e.target.setAttribute('fill', newColourHex);
        });

        path.addEventListener('click', (e) => {
          e.preventDefault();
          // Add ripple effect and pulse animation
          addRippleEffect(path, e, svg);
          addPulseAnimation(path);
          // Month tap/click switches to day selection view for that month.
          showMonthDaySelection(i);
        });

        // Make keyboard accessible
        makeSvgElementFocusable(path, {
          onActivate: () => {
            showMonthDaySelection(i);
          },
          onArrowKey: (direction) => {
            const nextIndex = handleYearViewNavigation(direction, i, segments);
            const nextPath = segmentsGroupEl.querySelector(`[data-segment-index="${nextIndex}"]`);
            if (nextPath) {
              nextPath.focus();
            }
          },
          onHome: () => {
            const firstPath = segmentsGroupEl.querySelector('[data-segment-index="0"]');
            if (firstPath) {
              firstPath.focus();
            }
          },
          onEnd: () => {
            const lastPath = segmentsGroupEl.querySelector(`[data-segment-index="${segments - 1}"]`);
            if (lastPath) {
              lastPath.focus();
            }
          },
          onPageUp: () => {
            // Page Up: Previous year
            setYear(currentYear - 1);
            drawCalendar();
            drawCircle();
          },
          onPageDown: () => {
            // Page Down: Next year
            setYear(currentYear + 1);
            drawCalendar();
            drawCircle();
          }
        });

        segmentsGroupEl.appendChild(path);

        const labelAngle = -degreesToRadians(sumTo(data, i)) + degreesToRadians(45) + (arcSize / 2);
        const labelRadius = radius * outerRadiusRatio * 0.95;
        const labelPos = polarToCartesian(centerX, centerY, labelRadius, labelAngle);

        let textRotation = (labelAngle * 180 / Math.PI) + 90;
        if (labelAngle > Math.PI / 2 && labelAngle < 3 * Math.PI / 2) {
          textRotation += 180;
        }

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', labelPos[0]);
        text.setAttribute('y', labelPos[1]);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'middle');
        text.setAttribute('transform', `rotate(${textRotation} ${labelPos[0]} ${labelPos[1]})`);
        text.setAttribute('class', 'segment-label');
        text.setAttribute('data-segment-index', i);
        text.textContent = labels[i];
        text.style.fontSize = `${svgSize / 35}px`;
        text.style.fontFamily = 'Helvetica, Arial, sans-serif';
        text.style.fontWeight = 'bold';
        text.style.pointerEvents = 'none';
        // Text label is decorative - ARIA info is on the path element
        setAriaHidden(text, true);

        const contrastColor = getContrastColor(monthColor);
        text.style.fill = contrastColor;
        // Only add drop shadow for white text (dark backgrounds)
        if (contrastColor === '#fff') {
          text.style.filter = 'drop-shadow(0px 0px 5px rgba(255, 255, 255, 0.2))';
        }

        segmentsGroupEl.appendChild(text);
      }

      svg.appendChild(segmentsGroupEl);
      announceToScreenReader(`Year view, ${currentYear}`, svg);
    };

    // Use transition if there's a current view, otherwise render directly
    if (currentViewGroup) {
      transitionToView(currentViewGroup, segmentsGroupEl, svg, 'backward', renderYearView);
    } else {
      renderYearView();
      // Add entered class for initial render
      segmentsGroupEl.classList.add('entered');
    }
  };

  const showMonthCentre = (monthIndex) => {
    const monthColour = getThemeColor(monthColors[monthIndex], monthColorsDark[monthIndex]);
    const monthColourHex = rgbToHex(monthColour);

    removeIfPresent('.center-circle');
    removeAllIfPresent('.center-text');

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    const innerRadius = radius / 3;
    circle.setAttribute('cx', centerX);
    circle.setAttribute('cy', centerY);
    circle.setAttribute('r', innerRadius);
    circle.setAttribute('fill', monthColourHex);
    circle.setAttribute('class', 'center-circle');
    svg.appendChild(circle);

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', centerX);
    text.setAttribute('y', centerY);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'middle');
    text.setAttribute('class', 'center-text');
    text.textContent = months[monthIndex];
    text.style.fontSize = '16px';
    text.style.fontFamily = 'Helvetica, Arial, sans-serif';
    text.style.fontWeight = 'bold';
    text.style.fill = getContrastColor(monthColour);
    svg.appendChild(text);
  };

  const showMonthDaySelection = (monthIndex, skipStatePush = false) => {
    activeView = 'monthDays';
    activeMonthIndex = monthIndex;
    // Track view state (unless we're restoring from Escape)
    if (!skipStatePush && !isRestoringView) {
      viewStateManager.pushView('monthDays', { monthIndex });
    }

    // Get current view group
    const currentViewGroup = svg.querySelector('.segments-group, .day-segments-group, .week-segments-group, .hour-segments-group, .minute-segments-group');
    
    // Clear other views (but not the one we're transitioning from)
    if (currentViewGroup) {
      if (currentViewGroup.classList.contains('segments-group')) {
        clearDaySelectionView();
        clearWeekView();
        clearTimeSelectionView();
      } else if (currentViewGroup.classList.contains('day-segments-group')) {
        clearWeekView();
        clearTimeSelectionView();
      } else if (currentViewGroup.classList.contains('week-segments-group')) {
        clearTimeSelectionView();
      }
    } else {
      clearYearView();
      clearDaySelectionView();
      clearWeekView();
      clearTimeSelectionView();
    }

    const days = getDaysInMonth(monthIndex, currentYear);
    const monthColour = getThemeColor(monthColors[monthIndex], monthColorsDark[monthIndex]);
    const monthColourHex = rgbToHex(monthColour);
    const dayLabelColour = getContrastColor(monthColour);

    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('class', 'day-segments-group');
    group.setAttribute('data-month-index', String(monthIndex));
    setAriaRole(group, 'group');
    setAriaExpanded(group, true); // Day selection view is expanded (showing days)

    // Render function that builds the day selection view
    const renderDaySelectionView = () => {
      const degreesPerDay = 360 / days;
      for (let i = 0; i < days; i++) {
        const day = i + 1;
        const startingAngle = -degreesToRadians(degreesPerDay * i) + degreesToRadians(45);
        const arcSize = degreesToRadians(degreesPerDay);
        const endingAngle = startingAngle + arcSize;

        const dateForDay = new Date(currentYear, monthIndex, day);
        const isRestricted = isDateRestricted(dateForDay, validationOptions);

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', createArcPath(centerX, centerY, radius, startingAngle, endingAngle, fullRadius));
        
      // Apply visual styling for restricted dates
      if (isRestricted) {
        path.setAttribute('fill', getCssVariable('--svg-restricted-fill', '#cccccc'));
        path.setAttribute('opacity', '0.5');
          path.setAttribute('class', 'day-segment day-segment--restricted');
          path.style.cursor = 'not-allowed';
          path.setAttribute('aria-disabled', 'true');
        } else {
          path.setAttribute('fill', monthColourHex);
          path.setAttribute('class', 'day-segment');
          path.style.cursor = 'pointer';
        }
        
      path.setAttribute('stroke', getStrokeColor());
      path.setAttribute('stroke-width', '1');
      path.setAttribute('data-day', String(day));

        // Add ARIA attributes
        setAriaRole(path, 'button');
        const dayLabel = generateDayLabel(day, monthIndex, currentYear);
        setAriaLabel(path, isRestricted ? `${dayLabel} (not available)` : dayLabel);

        // Add hover scale effect (only for non-restricted dates)
        if (!isRestricted) {
          addHoverScale(path);
        }

        const handleDayActivation = () => {
          // Prevent selection of restricted dates
          if (isRestricted) {
            const validation = validateDate(dateForDay, validationOptions);
            if (!validation.valid) {
              showErrorMessage(validation.error);
            }
            return;
          }
          
          const selected = new Date(currentYear, monthIndex, day);
          
          // If week view is enabled, navigate to week view first
          if (weekViewEnabled) {
            showWeekView(selected);
            return;
          }
          
          // Otherwise, use the original behavior (direct to hour selection or date selection)
          if (timeSelectionEnabled) {
            pendingDate = selected;
            pendingMeridiem = 'AM';
            pendingHour24 = 0;
            clearDaySelectionView();
            showHourSelection();
            announceToScreenReader(`Selected ${fullMonthNames[monthIndex]} ${day}, ${currentYear}`, svg);
            return;
          }

          drawCalendar();
          drawCircle();
          selectDate(selected);
        };

        path.addEventListener('click', (e) => {
          e.preventDefault();
          // Add ripple effect and pulse animation (only for non-restricted dates)
          if (!isRestricted) {
            addRippleEffect(path, e, svg);
            addPulseAnimation(path);
          }
          handleDayActivation();
        });

        // Make keyboard accessible (only if not restricted)
        if (!isRestricted) {
          makeSvgElementFocusable(path, {
            onActivate: handleDayActivation,
            onArrowKey: (direction) => {
              const nextDayIndex = handleDaySelectionNavigation(direction, i, days);
              const nextPath = group.querySelector(`[data-day="${nextDayIndex + 1}"]`);
              if (nextPath && !nextPath.classList.contains('day-segment--restricted')) {
                nextPath.focus();
              }
            },
            onHome: () => {
              const firstPath = group.querySelector('[data-day="1"]');
              if (firstPath && !firstPath.classList.contains('day-segment--restricted')) {
                firstPath.focus();
              }
            },
            onEnd: () => {
              const lastPath = group.querySelector(`[data-day="${days}"]`);
              if (lastPath && !lastPath.classList.contains('day-segment--restricted')) {
                lastPath.focus();
              }
            },
            onPageUp: () => {
              // Page Up: Previous month
              if (currentSelectedDate) {
                navigatePreviousMonth();
              }
            },
            onPageDown: () => {
              // Page Down: Next month
              if (currentSelectedDate) {
                navigateNextMonth();
              }
            }
          });
        }

        group.appendChild(path);

        // Day number labels around the outside, similar to month labels.
        const labelAngle = startingAngle + (arcSize / 2);
        const labelRadius = radius * fullRadius * 0.95;
        const labelPos = polarToCartesian(centerX, centerY, labelRadius, labelAngle);

        let textRotation = (labelAngle * 180 / Math.PI) + 90;
        if (labelAngle > Math.PI / 2 && labelAngle < 3 * Math.PI / 2) {
          textRotation += 180;
        }

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', labelPos[0]);
        text.setAttribute('y', labelPos[1]);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'middle');
        text.setAttribute('transform', `rotate(${textRotation} ${labelPos[0]} ${labelPos[1]})`);
        text.setAttribute('class', 'day-label');
        text.setAttribute('data-day', String(day));
        text.textContent = String(day);
        text.style.fontSize = `${svgSize / 40}px`;
        text.style.fontFamily = 'Helvetica, Arial, sans-serif';
        text.style.fontWeight = 'bold';
        text.style.pointerEvents = 'none';
        text.style.fill = dayLabelColour;
        if (dayLabelColour === '#fff') {
          text.style.filter = 'drop-shadow(0px 0px 5px rgba(255, 255, 255, 0.2))';
        }
        // Text label is decorative - ARIA info is on the path element
        setAriaHidden(text, true);

        group.appendChild(text);
      }

      svg.appendChild(group);
      showMonthCentre(monthIndex);
      announceToScreenReader(`Entering day selection for ${fullMonthNames[monthIndex]}, ${currentYear}`, svg);
      
      // Manage focus after rendering
      setTimeout(() => {
        if (isRestoringView) {
          // Restore focus when going back
          const restored = manageFocusTransition(null, 'monthDays', {
            container: svg,
            selector: '.day-segment:not(.day-segment--restricted)',
            restoreFromView: 'monthDays'
          });
          if (!restored) {
            // Fallback to first element if restore failed
            const firstDayPath = group.querySelector('.day-segment:not(.day-segment--restricted)');
            if (firstDayPath) {
              firstDayPath.focus();
            }
          }
        } else {
          // Focus first day segment when going forward
          const firstDayPath = group.querySelector('.day-segment:not(.day-segment--restricted)');
          if (firstDayPath) {
            firstDayPath.focus();
          }
        }
      }, 0);
    };

    // Save current focus before transitioning (if going forward from year view)
    const isComingFromYearView = currentViewGroup && currentViewGroup.classList.contains('segments-group');
    if (!isRestoringView && isComingFromYearView) {
      manageFocusTransition('year', 'monthDays', {
        container: svg,
        selector: '.day-segment:not(.day-segment--restricted)'
      });
    }

    // Use transition if there's a current view, otherwise render directly
    if (currentViewGroup) {
      transitionToView(currentViewGroup, group, svg, 'forward', renderDaySelectionView);
    } else {
      renderDaySelectionView();
      // Add entered class for initial render
      group.classList.add('entered');
    }
  };

  const showWeekView = (date, skipStatePush = false) => {
    activeView = 'week';
    // Track view state (unless we're restoring from Escape)
    if (!skipStatePush && !isRestoringView) {
      viewStateManager.pushView('week', { date: date.getTime() });
    }

    // Get current view group
    const currentViewGroup = svg.querySelector('.segments-group, .day-segments-group, .week-segments-group, .hour-segments-group, .minute-segments-group');
    
    // Clear other views
    if (currentViewGroup) {
      if (currentViewGroup.classList.contains('day-segments-group')) {
        clearTimeSelectionView();
      } else if (currentViewGroup.classList.contains('week-segments-group')) {
        clearTimeSelectionView();
      } else {
        clearDaySelectionView();
        clearTimeSelectionView();
      }
    } else {
      clearYearView();
      clearDaySelectionView();
      clearTimeSelectionView();
    }

    const weekStart = getWeekStartDate(date);
    const weekDates = getWeekDates(weekStart);
    
    // Use the month colour of the first day of the week
    const firstDayMonthIndex = weekDates[0].getMonth();
    const monthColour = getThemeColor(monthColors[firstDayMonthIndex], monthColorsDark[firstDayMonthIndex]);
    const monthColourHex = rgbToHex(monthColour);
    const dayLabelColour = getContrastColor(monthColour);

    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('class', 'week-segments-group');
    group.setAttribute('data-week-start', weekStart.toISOString());
    setAriaRole(group, 'group');
    setAriaExpanded(group, true); // Week view is expanded (showing days)

    // Render function that builds the week view
    const renderWeekView = () => {
      const degreesPerDay = 360 / 7;
      for (let i = 0; i < 7; i++) {
        const dayDate = weekDates[i];
        const day = dayDate.getDate();
        const dayMonthIndex = dayDate.getMonth();
        const dayYear = dayDate.getFullYear();
        
        const startingAngle = -degreesToRadians(degreesPerDay * i) + degreesToRadians(45);
        const arcSize = degreesToRadians(degreesPerDay);
        const endingAngle = startingAngle + arcSize;

        const isRestricted = isDateRestricted(dayDate, validationOptions);

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', createArcPath(centerX, centerY, radius, startingAngle, endingAngle, fullRadius));
        
        // Apply visual styling for restricted dates
        if (isRestricted) {
          path.setAttribute('fill', getCssVariable('--svg-restricted-fill', '#cccccc'));
          path.setAttribute('opacity', '0.5');
          path.setAttribute('class', 'week-day-segment week-day-segment--restricted');
          path.style.cursor = 'not-allowed';
          path.setAttribute('aria-disabled', 'true');
        } else {
          // Use month colour for the day's month
          const dayMonthColour = getThemeColor(monthColors[dayMonthIndex], monthColorsDark[dayMonthIndex]);
          const dayMonthColourHex = rgbToHex(dayMonthColour);
          path.setAttribute('fill', dayMonthColourHex);
          path.setAttribute('class', 'week-day-segment');
          path.style.cursor = 'pointer';
        }
        
        path.setAttribute('stroke', getStrokeColor());
        path.setAttribute('stroke-width', '1');
        path.setAttribute('data-day', String(day));
        path.setAttribute('data-date', dayDate.toISOString());
        path.setAttribute('data-day-index', String(i));

        // Add ARIA attributes
        setAriaRole(path, 'button');
        const dayLabel = generateDayLabel(day, dayMonthIndex, dayYear);
        setAriaLabel(path, isRestricted ? `${dayLabel} (not available)` : dayLabel);

        // Add hover scale effect (only for non-restricted dates)
        if (!isRestricted) {
          addHoverScale(path);
        }

        const handleWeekDayActivation = () => {
          // Prevent selection of restricted dates
          if (isRestricted) {
            const validation = validateDate(dayDate, validationOptions);
            if (!validation.valid) {
              showErrorMessage(validation.error);
            }
            return;
          }
          
          if (timeSelectionEnabled) {
            pendingDate = dayDate;
            pendingMeridiem = 'AM';
            pendingHour24 = 0;
            clearWeekView();
            showHourSelection();
            announceToScreenReader(`Selected ${fullMonthNames[dayMonthIndex]} ${day}, ${dayYear}`, svg);
            return;
          }

          drawCalendar();
          drawCircle();
          selectDate(dayDate);
        };

        path.addEventListener('click', (e) => {
          e.preventDefault();
          // Add ripple effect and pulse animation (only for non-restricted dates)
          if (!isRestricted) {
            addRippleEffect(path, e, svg);
            addPulseAnimation(path);
          }
          handleWeekDayActivation();
        });

        // Make keyboard accessible (only if not restricted)
        if (!isRestricted) {
          makeSvgElementFocusable(path, {
            onActivate: handleWeekDayActivation,
            onArrowKey: (direction) => {
              const nextDayIndex = handleArrowKeyNavigation(direction, i, 7);
              const nextPath = group.querySelector(`[data-day-index="${nextDayIndex}"]`);
              if (nextPath && !nextPath.classList.contains('week-day-segment--restricted')) {
                nextPath.focus();
              }
            },
            onHome: () => {
              const firstPath = group.querySelector('[data-day-index="0"]');
              if (firstPath && !firstPath.classList.contains('week-day-segment--restricted')) {
                firstPath.focus();
              }
            },
            onEnd: () => {
              const lastPath = group.querySelector('[data-day-index="6"]');
              if (lastPath && !lastPath.classList.contains('week-day-segment--restricted')) {
                lastPath.focus();
              }
            }
          });
        }

        group.appendChild(path);

        // Day number labels around the outside
        const labelAngle = startingAngle + (arcSize / 2);
        const labelRadius = radius * fullRadius * 0.95;
        const labelPos = polarToCartesian(centerX, centerY, labelRadius, labelAngle);

        let textRotation = (labelAngle * 180 / Math.PI) + 90;
        if (labelAngle > Math.PI / 2 && labelAngle < 3 * Math.PI / 2) {
          textRotation += 180;
        }

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', labelPos[0]);
        text.setAttribute('y', labelPos[1]);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'middle');
        text.setAttribute('transform', `rotate(${textRotation} ${labelPos[0]} ${labelPos[1]})`);
        text.setAttribute('class', 'week-day-label');
        text.setAttribute('data-day-index', String(i));
        text.textContent = String(day);
        text.style.fontSize = `${svgSize / 40}px`;
        text.style.fontFamily = 'Helvetica, Arial, sans-serif';
        text.style.fontWeight = 'bold';
        text.style.pointerEvents = 'none';
        text.style.fill = dayLabelColour;
        if (dayLabelColour === '#fff') {
          text.style.filter = 'drop-shadow(0px 0px 5px rgba(255, 255, 255, 0.2))';
        }
        // Text label is decorative - ARIA info is on the path element
        setAriaHidden(text, true);

        group.appendChild(text);
      }

      svg.appendChild(group);
      
      // Show week information in centre
      const weekStartMonth = fullMonthNames[weekStart.getMonth()];
      const weekStartDay = weekStart.getDate();
      const weekEnd = weekDates[6];
      const weekEndMonth = fullMonthNames[weekEnd.getMonth()];
      const weekEndDay = weekEnd.getDate();
      const weekYear = weekStart.getFullYear();
      
      const weekLabel = weekStartMonth === weekEndMonth
        ? `${weekStartDay}-${weekEndDay} ${weekStartMonth} ${weekYear}`
        : `${weekStartDay} ${weekStartMonth} - ${weekEndDay} ${weekEndMonth} ${weekYear}`;
      
      announceToScreenReader(`Week view, ${weekLabel}`, svg);
      
      // Manage focus after rendering
      setTimeout(() => {
        if (isRestoringView) {
          // Restore focus when going back
          const restored = manageFocusTransition(null, 'week', {
            container: svg,
            selector: '.week-day-segment:not(.week-day-segment--restricted)',
            restoreFromView: 'week'
          });
          if (!restored) {
            // Fallback to first element if restore failed
            const firstDayPath = group.querySelector('.week-day-segment:not(.week-day-segment--restricted)');
            if (firstDayPath) {
              firstDayPath.focus();
            }
          }
        } else {
          // Focus first day segment when going forward
          const firstDayPath = group.querySelector('.week-day-segment:not(.week-day-segment--restricted)');
          if (firstDayPath) {
            firstDayPath.focus();
          }
        }
      }, 0);
    };

    // Save current focus before transitioning (if going forward from day selection)
    const isComingFromDaySelection = currentViewGroup && currentViewGroup.classList.contains('day-segments-group');
    if (!isRestoringView && isComingFromDaySelection) {
      manageFocusTransition('monthDays', 'week', {
        container: svg,
        selector: '.week-day-segment:not(.week-day-segment--restricted)'
      });
    }

    // Use transition if there's a current view, otherwise render directly
    if (currentViewGroup && currentViewGroup.classList.contains('day-segments-group')) {
      transitionToView(currentViewGroup, group, svg, 'forward', renderWeekView);
    } else {
      renderWeekView();
      // Add entered class for initial render
      group.classList.add('entered');
    }
  };

  const renderAmPmSelector = () => {
    removeIfPresent('.ampm-selector-group');

    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('class', 'ampm-selector-group');

    const makeLabel = (label, xOffset) => {
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', String(centerX + xOffset));
      text.setAttribute('y', String(centerY + 32));
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'middle');
      text.setAttribute('class', 'ampm-selector');
      text.setAttribute('data-meridiem', label);
      text.textContent = label;
      text.style.fontFamily = 'Helvetica, Arial, sans-serif';
      text.style.fontSize = '12px';
      text.style.cursor = 'pointer';
      const selected = pendingMeridiem === label;
      text.style.fontWeight = selected ? 'bold' : 'normal';
      text.style.fill = selected ? getCssVariable('--svg-center-text-main', '#111') : getCssVariable('--svg-center-text-day', '#666');

      text.addEventListener('click', (e) => {
        e.preventDefault();
        pendingMeridiem = label;
        renderAmPmSelector();
      });
      return text;
    };

    group.appendChild(makeLabel('AM', -18));
    group.appendChild(makeLabel('PM', 18));
    svg.appendChild(group);
  };

  const showHourSelection = (skipStatePush = false) => {
    activeView = 'hours';
    // Track view state (unless we're restoring from Escape)
    if (!skipStatePush && !isRestoringView) {
      viewStateManager.pushView('hours', {});
    }

    // Get current view group
    const currentViewGroup = svg.querySelector('.day-segments-group, .week-segments-group, .hour-segments-group, .minute-segments-group');
    
    // Clear other time views if not transitioning from them
    if (!currentViewGroup || (!currentViewGroup.classList.contains('day-segments-group') && !currentViewGroup.classList.contains('week-segments-group'))) {
      clearTimeSelectionView();
    }

    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('class', 'hour-segments-group');
    setAriaRole(group, 'group');
    setAriaExpanded(group, true); // Hour selection view is expanded (showing hours)

    // Render function that builds the hour selection view
    const renderHourSelectionView = () => {
      const count = useTwelveHourClock ? 12 : 24;
      const degreesPer = 360 / count;
      const outerRadiusRatio = 0.62;
      const innerRadius = radius * 0.34;

      for (let i = 0; i < count; i++) {
      const displayHour = useTwelveHourClock ? (i + 1) : i;
      const startingAngle = -degreesToRadians(degreesPer * i) + degreesToRadians(45);
      const arcSize = degreesToRadians(degreesPer);
      const endingAngle = startingAngle + arcSize;

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', createArcPath(centerX, centerY, radius, startingAngle, endingAngle, outerRadiusRatio, innerRadius));
      path.setAttribute('fill', getCssVariable('--svg-day-bg', '#f7f7f7'));
      path.setAttribute('stroke', getCssVariable('--svg-stroke', getDarkMode() ? '#444' : '#ddd'));
      path.setAttribute('stroke-width', '1');
      path.setAttribute('class', 'hour-segment');
      path.setAttribute('data-hour', String(displayHour));
      path.style.cursor = 'pointer';

      // Add ARIA attributes
      setAriaRole(path, 'button');
      setAriaLabel(path, generateHourLabel(displayHour, useTwelveHourClock, pendingMeridiem));

      // Add hover scale effect
      addHoverScale(path);

      path.addEventListener('mouseenter', (e) => {
        e.target.setAttribute('fill', getCssVariable('--svg-day-bg-hover', '#eee'));
      });
      path.addEventListener('mouseleave', (e) => {
        e.target.setAttribute('fill', getCssVariable('--svg-day-bg', '#f7f7f7'));
      });

      const handleHourActivation = () => {
        const hourValue = Number(path.getAttribute('data-hour'));
        if (!Number.isFinite(hourValue)) return;

        if (useTwelveHourClock) {
          const hour12 = hourValue === 12 ? 0 : hourValue;
          pendingHour24 = pendingMeridiem === 'PM' ? (hour12 + 12) : hour12;
        } else {
          pendingHour24 = Math.max(0, Math.min(23, hourValue));
        }

        showMinuteSelection();
      };

      path.addEventListener('click', (e) => {
        e.preventDefault();
        // Add ripple effect and pulse animation
        addRippleEffect(path, e, svg);
        addPulseAnimation(path);
        handleHourActivation();
      });

      // Make keyboard accessible
      makeSvgElementFocusable(path, {
        onActivate: handleHourActivation,
        onArrowKey: (direction) => {
          const nextIndex = handleHourSelectionNavigation(direction, i, count);
          const allHourPaths = Array.from(group.querySelectorAll('.hour-segment'));
          if (allHourPaths[nextIndex]) {
            allHourPaths[nextIndex].focus();
          }
        },
        onHome: () => {
          const allHourPaths = Array.from(group.querySelectorAll('.hour-segment'));
          if (allHourPaths[0]) {
            allHourPaths[0].focus();
          }
        },
        onEnd: () => {
          const allHourPaths = Array.from(group.querySelectorAll('.hour-segment'));
          if (allHourPaths[count - 1]) {
            allHourPaths[count - 1].focus();
          }
        }
      });

      group.appendChild(path);

      const labelAngle = startingAngle + (arcSize / 2);
      const labelRadius = radius * outerRadiusRatio * 0.90;
      const labelPos = polarToCartesian(centerX, centerY, labelRadius, labelAngle);

      let textRotation = (labelAngle * 180 / Math.PI) + 90;
      if (labelAngle > Math.PI / 2 && labelAngle < 3 * Math.PI / 2) {
        textRotation += 180;
      }

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', labelPos[0]);
      text.setAttribute('y', labelPos[1]);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'middle');
      text.setAttribute('transform', `rotate(${textRotation} ${labelPos[0]} ${labelPos[1]})`);
      text.setAttribute('class', 'hour-label');
      text.textContent = String(displayHour).padStart(2, '0');
      text.style.fontSize = `${svgSize / 55}px`;
      text.style.fontFamily = 'Helvetica, Arial, sans-serif';
      text.style.fontWeight = 'bold';
      text.style.pointerEvents = 'none';
      text.style.fill = getCssVariable('--svg-center-text-day', '#333');
      // Text label is decorative - ARIA info is on the path element
      setAriaHidden(text, true);
      group.appendChild(text);
    }

    svg.appendChild(group);
    announceToScreenReader('Hour selection', svg);

      if (useTwelveHourClock) {
        renderAmPmSelector();
      }
      
      // Manage focus after rendering
      setTimeout(() => {
        if (isRestoringView) {
          // Restore focus when going back
          const restored = manageFocusTransition(null, 'hours', {
            container: svg,
            selector: '.hour-segment',
            restoreFromView: 'hours'
          });
          if (!restored) {
            // Fallback to first element if restore failed
            const firstHourPath = group.querySelector('.hour-segment');
            if (firstHourPath) {
              firstHourPath.focus();
            }
          }
        } else {
          // Focus first hour segment when going forward
          const firstHourPath = group.querySelector('.hour-segment');
          if (firstHourPath) {
            firstHourPath.focus();
          }
        }
      }, 0);
    };

    // Save current focus before transitioning (if going forward from day/week selection)
    const isComingFromDaySelection = currentViewGroup && (currentViewGroup.classList.contains('day-segments-group') || currentViewGroup.classList.contains('week-segments-group'));
    if (!isRestoringView && isComingFromDaySelection) {
      manageFocusTransition('week', 'hours', {
        container: svg,
        selector: '.hour-segment'
      });
    }

    // Use transition if there's a current view, otherwise render directly
    if (currentViewGroup && currentViewGroup.classList.contains('day-segments-group')) {
      transitionToView(currentViewGroup, group, svg, 'forward', renderHourSelectionView);
    } else {
      renderHourSelectionView();
      // Add entered class for initial render
      group.classList.add('entered');
    }
  };

  const showMinuteSelection = (skipStatePush = false) => {
    activeView = 'minutes';
    // Track view state (unless we're restoring from Escape)
    if (!skipStatePush && !isRestoringView) {
      viewStateManager.pushView('minutes', {});
    }

    // Get current view group
    const currentViewGroup = svg.querySelector('.hour-segments-group, .minute-segments-group');
    
    // Clear other time views if not transitioning from them
    if (!currentViewGroup || !currentViewGroup.classList.contains('hour-segments-group')) {
      removeIfPresent('.minute-segments-group');
      removeIfPresent('.hour-segments-group');
      removeIfPresent('.ampm-selector-group');
    } else {
      // Only clear minute and ampm if transitioning from hour view
      removeIfPresent('.minute-segments-group');
      removeIfPresent('.ampm-selector-group');
    }

    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('class', 'minute-segments-group');
    setAriaRole(group, 'group');
    setAriaExpanded(group, true); // Minute selection view is expanded (showing minutes)

    // Render function that builds the minute selection view
    const renderMinuteSelectionView = () => {
      const minutes = Array.from({ length: 12 }, (_, i) => i * 5);
      const count = minutes.length;
      const degreesPer = 360 / count;
      const outerRadiusRatio = 0.78;
      const innerRadius = radius * 0.52;

      for (let i = 0; i < count; i++) {
      const minute = minutes[i];
      const startingAngle = -degreesToRadians(degreesPer * i) + degreesToRadians(45);
      const arcSize = degreesToRadians(degreesPer);
      const endingAngle = startingAngle + arcSize;

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', createArcPath(centerX, centerY, radius, startingAngle, endingAngle, outerRadiusRatio, innerRadius));
      path.setAttribute('fill', getCssVariable('--svg-time-bg', '#ffffff'));
      path.setAttribute('stroke', getCssVariable('--svg-stroke', getDarkMode() ? '#444' : '#ddd'));
      path.setAttribute('stroke-width', '1');
      path.setAttribute('class', 'minute-segment');
      path.setAttribute('data-minute', String(minute));
      path.style.cursor = 'pointer';

      // Add ARIA attributes
      setAriaRole(path, 'button');
      setAriaLabel(path, generateMinuteLabel(pendingHour24, minute, useTwelveHourClock, pendingMeridiem));

      // Add hover scale effect
      addHoverScale(path);

      path.addEventListener('mouseenter', (e) => {
        e.target.setAttribute('fill', getCssVariable('--svg-time-bg-hover', '#f1f1f1'));
      });
      path.addEventListener('mouseleave', (e) => {
        e.target.setAttribute('fill', getCssVariable('--svg-time-bg', '#ffffff'));
      });

      const handleMinuteActivation = () => {
        if (!pendingDate) return;
        const minuteValue = Number(path.getAttribute('data-minute'));
        if (!Number.isFinite(minuteValue)) return;

        const final = new Date(
          pendingDate.getFullYear(),
          pendingDate.getMonth(),
          pendingDate.getDate(),
          pendingHour24,
          minuteValue,
          0,
          0
        );

        const dateStr = final.toLocaleDateString('en-GB', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: useTwelveHourClock ? 'numeric' : '2-digit',
          minute: '2-digit',
          hour12: useTwelveHourClock
        });
        announceToScreenReader(`Selected ${dateStr}`, svg);

        pendingDate = null;
        clearTimeSelectionView();
        drawCalendar();
        drawCircle();
        selectDate(final);
      };

      path.addEventListener('click', (e) => {
        e.preventDefault();
        // Add ripple effect and pulse animation
        addRippleEffect(path, e, svg);
        addPulseAnimation(path);
        handleMinuteActivation();
      });

      // Make keyboard accessible
      makeSvgElementFocusable(path, {
        onActivate: handleMinuteActivation,
        onArrowKey: (direction) => {
          const nextIndex = handleMinuteSelectionNavigation(direction, i, count);
          const allMinutePaths = Array.from(group.querySelectorAll('.minute-segment'));
          if (allMinutePaths[nextIndex]) {
            allMinutePaths[nextIndex].focus();
          }
        },
        onHome: () => {
          const allMinutePaths = Array.from(group.querySelectorAll('.minute-segment'));
          if (allMinutePaths[0]) {
            allMinutePaths[0].focus();
          }
        },
        onEnd: () => {
          const allMinutePaths = Array.from(group.querySelectorAll('.minute-segment'));
          if (allMinutePaths[count - 1]) {
            allMinutePaths[count - 1].focus();
          }
        }
      });

      group.appendChild(path);

      const labelAngle = startingAngle + (arcSize / 2);
      const labelRadius = radius * outerRadiusRatio * 0.92;
      const labelPos = polarToCartesian(centerX, centerY, labelRadius, labelAngle);

      let textRotation = (labelAngle * 180 / Math.PI) + 90;
      if (labelAngle > Math.PI / 2 && labelAngle < 3 * Math.PI / 2) {
        textRotation += 180;
      }

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', labelPos[0]);
      text.setAttribute('y', labelPos[1]);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'middle');
      text.setAttribute('transform', `rotate(${textRotation} ${labelPos[0]} ${labelPos[1]})`);
      text.setAttribute('class', 'minute-label');
      text.textContent = String(minute);

      const base = svgSize / 70;
      const fontSize =
        minute === 0 || minute === 30 ? base * 1.8
          : (minute === 15 || minute === 45 ? base * 1.35 : base);

      text.style.fontSize = `${fontSize}px`;
      text.style.fontFamily = 'Helvetica, Arial, sans-serif';
      text.style.fontWeight = minute === 0 || minute === 30 ? 'bold' : 'normal';
      text.style.pointerEvents = 'none';
      text.style.fill = getCssVariable('--svg-center-text-day', '#333');
      // Text label is decorative - ARIA info is on the path element
      setAriaHidden(text, true);
      group.appendChild(text);
      }

      svg.appendChild(group);
      announceToScreenReader('Minute selection', svg);
      
      // Manage focus after rendering
      setTimeout(() => {
        if (isRestoringView) {
          // Restore focus when going back
          const restored = manageFocusTransition(null, 'minutes', {
            container: svg,
            selector: '.minute-segment',
            restoreFromView: 'minutes'
          });
          if (!restored) {
            // Fallback to first element if restore failed
            const firstMinutePath = group.querySelector('.minute-segment');
            if (firstMinutePath) {
              firstMinutePath.focus();
            }
          }
        } else {
          // Focus first minute segment when going forward
          const firstMinutePath = group.querySelector('.minute-segment');
          if (firstMinutePath) {
            firstMinutePath.focus();
          }
        }
      }, 0);
    };

    // Save current focus before transitioning (if going forward from hour selection)
    const isComingFromHourSelection = currentViewGroup && currentViewGroup.classList.contains('hour-segments-group');
    if (!isRestoringView && isComingFromHourSelection) {
      manageFocusTransition('hours', 'minutes', {
        container: svg,
        selector: '.minute-segment'
      });
    }

    // Use transition if there's a current view, otherwise render directly
    if (currentViewGroup && currentViewGroup.classList.contains('hour-segments-group')) {
      transitionToView(currentViewGroup, group, svg, 'forward', renderMinuteSelectionView);
    } else {
      renderMinuteSelectionView();
      // Add entered class for initial render
      group.classList.add('entered');
    }
  };

  const drawCircle = () => {
    const existingCircle = svg.querySelector('.center-circle');
    if (existingCircle) existingCircle.remove();

    const existingText = svg.querySelector('.center-text');
    if (existingText) existingText.remove();

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    const innerRadius = radius / 3;
    circle.setAttribute('cx', centerX);
    circle.setAttribute('cy', centerY);
    circle.setAttribute('r', innerRadius);
    circle.setAttribute('fill', getCssVariable('--card-bg', '#ffffff'));
    circle.setAttribute('class', 'center-circle');

    svg.appendChild(circle);
  };

  const writeSegmentName = (segment, date = null) => {
    drawCircle();

    const existingTexts = svg.querySelectorAll('.center-text');
    existingTexts.forEach((text) => text.remove());

    const mainFontSize = 16;
    const smallFontSize = 10;
    const lineSpacing = 6;

    const mainY = centerY;
    const dayOfWeekY = mainY - (mainFontSize / 2) - lineSpacing;
    const yearY = mainY + (mainFontSize / 2) + lineSpacing;

    if (date) {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayOfWeek = dayNames[date.getDay()];

      const dayText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      dayText.setAttribute('x', centerX);
      dayText.setAttribute('y', dayOfWeekY);
      dayText.setAttribute('text-anchor', 'middle');
      dayText.setAttribute('dominant-baseline', 'middle');
      dayText.setAttribute('class', 'center-text');
      dayText.textContent = dayOfWeek;
      dayText.style.fontSize = `${smallFontSize}px`;
      dayText.style.fontFamily = 'Helvetica, Arial, sans-serif';
      dayText.style.fill = getCssVariable('--svg-center-text-day', '#333');
      svg.appendChild(dayText);
    }

    const mainText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    mainText.setAttribute('x', centerX);
    mainText.setAttribute('y', mainY);
    mainText.setAttribute('text-anchor', 'middle');
    mainText.setAttribute('dominant-baseline', 'middle');
    mainText.setAttribute('class', 'center-text');

    let textContent = segment;
    if (date) {
      const day = date.getDate();
      textContent = `${segment} ${day}`;
    }

    mainText.textContent = textContent;
    mainText.style.fontSize = `${mainFontSize}px`;
    mainText.style.fontFamily = 'Helvetica, Arial, sans-serif';
    mainText.style.fill = getCssVariable('--svg-center-text-main', '#333');
    svg.appendChild(mainText);

    if (date) {
      const year = date.getFullYear();

      const yearText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      yearText.setAttribute('x', centerX);
      yearText.setAttribute('y', yearY);
      yearText.setAttribute('text-anchor', 'middle');
      yearText.setAttribute('dominant-baseline', 'middle');
      yearText.setAttribute('class', 'center-text');
      yearText.textContent = year.toString();
      yearText.style.fontSize = `${smallFontSize}px`;
      yearText.style.fontFamily = 'Helvetica, Arial, sans-serif';
      yearText.style.fill = getCssVariable('--svg-center-text-day', '#333');
      svg.appendChild(yearText);

      const moonPhaseName = getMoonPhaseName(date);
      const moonPhaseY = yearY + smallFontSize + lineSpacing;

      const moonPhaseText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      moonPhaseText.setAttribute('x', centerX);
      moonPhaseText.setAttribute('y', moonPhaseY);
      moonPhaseText.setAttribute('text-anchor', 'middle');
      moonPhaseText.setAttribute('dominant-baseline', 'middle');
      moonPhaseText.setAttribute('class', 'center-text');
      moonPhaseText.textContent = moonPhaseName;
      moonPhaseText.style.fontSize = `${smallFontSize}px`;
      moonPhaseText.style.fontFamily = 'Helvetica, Arial, sans-serif';
      moonPhaseText.style.fill = getCssVariable('--svg-center-text-moon', '#666');
      svg.appendChild(moonPhaseText);
    }
  };

  const hideSunAndMoon = () => {
    const sun = svg.querySelector('.sun-icon');
    const moon = svg.querySelector('.moon-icon');
    if (sun) sun.remove();
    if (moon) moon.remove();
  };

  const setupSunDragHandlers = (sunGroup) => {
    let isDragging = false;

    const getEventPos = (e) => {
      if (e.touches && e.touches.length > 0) {
        return { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
      return { x: e.clientX, y: e.clientY };
    };

    const getAngleFromEvent = (e) => {
      const svgRect = svg.getBoundingClientRect();
      const pos = getEventPos(e);
      const mouseX = pos.x - svgRect.left;
      const mouseY = pos.y - svgRect.top;

      const viewBox = svg.viewBox.baseVal;
      const svgWidth = svgRect.width;
      const svgHeight = svgRect.height;

      const mouseSvgX = (mouseX / svgWidth) * viewBox.width;
      const mouseSvgY = (mouseY / svgHeight) * viewBox.height;

      const dx = mouseSvgX - centerX;
      const dy = mouseSvgY - centerY;
      let angle = Math.atan2(dy, dx);

      if (angle < 0) {
        angle += 2 * Math.PI;
      }

      return angle;
    };

    const updateSunPosition = (angle) => {
      const segmentStartAngles = [];
      for (let i = 0; i < segments; i++) {
        const startAngle = -degreesToRadians(sumTo(data, i)) + degreesToRadians(45);
        let normalized = startAngle;
        while (normalized < 0) normalized += 2 * Math.PI;
        while (normalized >= 2 * Math.PI) normalized -= 2 * Math.PI;
        segmentStartAngles.push({ month: i, angle: normalized });
      }

      let monthIndex = 0;
      let angleInSegment = 0;

      for (let i = 0; i < segmentStartAngles.length; i++) {
        const currentStart = segmentStartAngles[i].angle;
        let segmentEnd = currentStart + degreesToRadians(deg);
        if (segmentEnd > 2 * Math.PI) {
          segmentEnd -= 2 * Math.PI;
        }

        let inSegment = false;
        if (currentStart < segmentEnd) {
          inSegment = angle >= currentStart && angle < segmentEnd;
        } else {
          inSegment = angle >= currentStart || angle < segmentEnd;
        }

        if (inSegment) {
          monthIndex = segmentStartAngles[i].month;
          angleInSegment = angle - currentStart;
          if (angleInSegment < 0) {
            angleInSegment += 2 * Math.PI;
          }
          break;
        }
      }

      const segmentSize = degreesToRadians(deg);
      angleInSegment = Math.max(0, Math.min(angleInSegment, segmentSize));
      const positionInSegment = 1 - (angleInSegment / segmentSize);
      const daysInMonth = getDaysInMonth(monthIndex, currentYear);
      const dayInMonth = Math.max(1, Math.min(daysInMonth, Math.floor(positionInSegment * daysInMonth) + 1));

      const date = new Date(currentYear, monthIndex, dayInMonth);
      writeSegmentName(labels[monthIndex], date);
      notifyDateChanged(date);

      const sunRadius = radius + sunDistance;
      const sunPos = polarToCartesian(centerX, centerY, sunRadius, angle);

      const moonPhaseAngle = getMoonPhaseAngle(date);
      const moonPhase = getMoonPhase(date);
      const moonAngle = angle - moonPhaseAngle;
      const moonRadius = radius + moonDistance;
      const moonPos = polarToCartesian(centerX, centerY, moonRadius, moonAngle);

      sunGroup.setAttribute('transform', `translate(${sunPos[0]}, ${sunPos[1]})`);

      const moonGroup = svg.querySelector('.moon-icon');
      if (moonGroup) {
        moonGroup.setAttribute('transform', `translate(${moonPos[0]}, ${moonPos[1]})`);

        const moonIconRadius = 6;
        const shadowDx = getMoonShadowDx(moonIconRadius, moonPhase);
        const shadow = moonGroup.querySelector?.('.moon-icon__shadow');
        if (shadow) {
          shadow.setAttribute('cx', String(shadowDx));
        }
      }
    };

    sunGroup.addEventListener('mousedown', (e) => {
      isDragging = true;
      sunGroup.style.cursor = 'grabbing';
      e.preventDefault();
      e.stopPropagation();
    });

    const handleMouseMove = (e) => {
      if (isDragging) {
        const angle = getAngleFromEvent(e);
        updateSunPosition(angle);
        e.preventDefault();
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        isDragging = false;
        sunGroup.style.cursor = 'grab';
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    sunGroup.addEventListener('touchstart', (e) => {
      isDragging = true;
      e.preventDefault();
    }, { passive: false });

    document.addEventListener('touchmove', (e) => {
      if (isDragging) {
        const angle = getAngleFromEvent(e);
        updateSunPosition(angle);
        e.preventDefault();
      }
    }, { passive: false });

    document.addEventListener('touchend', () => {
      if (isDragging) {
        isDragging = false;
      }
    }, { passive: true });
  };

  const showSunAndMoon = (sunPos, moonPos, makeDraggable = false, moonPhase = null) => {
    hideSunAndMoon();

    const sunGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    sunGroup.setAttribute('class', 'sun-icon');
    sunGroup.setAttribute('transform', `translate(${sunPos[0]}, ${sunPos[1]})`);
    if (makeDraggable) {
      sunGroup.style.cursor = 'grab';
      sunGroup.setAttribute('data-draggable', 'true');
      sunGroup.style.pointerEvents = 'all';
    }

    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      const ray = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      const startX = Math.cos(angle) * 8;
      const startY = Math.sin(angle) * 8;
      const endX = Math.cos(angle) * 12;
      const endY = Math.sin(angle) * 12;
      ray.setAttribute('x1', startX);
      ray.setAttribute('y1', startY);
      ray.setAttribute('x2', endX);
      ray.setAttribute('y2', endY);
      ray.setAttribute('stroke', '#ffd700');
      ray.setAttribute('stroke-width', '2');
      ray.setAttribute('stroke-linecap', 'round');
      sunGroup.appendChild(ray);
    }

    const sunCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    sunCircle.setAttribute('r', '8');
    sunCircle.setAttribute('fill', '#ffd700');
    sunCircle.setAttribute('stroke', '#ffaa00');
    sunCircle.setAttribute('stroke-width', '1');
    sunGroup.appendChild(sunCircle);

    const moonGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    moonGroup.setAttribute('class', 'moon-icon');
    moonGroup.setAttribute('transform', `translate(${moonPos[0]}, ${moonPos[1]})`);

    const moonRadius = 6;
    const clipId = `moon-clip-${moonClipIdCounter++}`;
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const clipPath = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
    clipPath.setAttribute('id', clipId);
    const clipCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    clipCircle.setAttribute('cx', '0');
    clipCircle.setAttribute('cy', '0');
    clipCircle.setAttribute('r', String(moonRadius));
    clipPath.appendChild(clipCircle);
    defs.appendChild(clipPath);
    moonGroup.appendChild(defs);

    const moonDisc = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    moonDisc.setAttribute('cx', '0');
    moonDisc.setAttribute('cy', '0');
    moonDisc.setAttribute('r', String(moonRadius));
    moonDisc.setAttribute('fill', '#f5f5f5');
    moonDisc.setAttribute('class', 'moon-icon__disc');
    moonGroup.appendChild(moonDisc);

    const phaseValue = Number.isFinite(Number(moonPhase)) ? Number(moonPhase) : 0;
    const shadowDx = getMoonShadowDx(moonRadius, phaseValue);

    const moonShadow = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    moonShadow.setAttribute('cx', String(shadowDx));
    moonShadow.setAttribute('cy', '0');
    moonShadow.setAttribute('r', String(moonRadius));
    moonShadow.setAttribute('fill', '#111');
    moonShadow.setAttribute('clip-path', `url(#${clipId})`);
    moonShadow.setAttribute('class', 'moon-icon__shadow');
    moonGroup.appendChild(moonShadow);

    const moonOutline = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    moonOutline.setAttribute('cx', '0');
    moonOutline.setAttribute('cy', '0');
    moonOutline.setAttribute('r', String(moonRadius));
    moonOutline.setAttribute('fill', 'none');
    moonOutline.setAttribute('stroke', '#999');
    moonOutline.setAttribute('stroke-width', '1');
    moonOutline.setAttribute('class', 'moon-icon__outline');
    moonGroup.appendChild(moonOutline);

    svg.appendChild(sunGroup);
    svg.appendChild(moonGroup);

    if (makeDraggable) {
      setupSunDragHandlers(sunGroup);
    }
  };

  const showSunAndMoonForDate = (date) => {
    const monthIndex = date.getMonth();
    const dayInMonth = date.getDate();
    const year = date.getFullYear();

    const segmentStartAngle = -degreesToRadians(sumTo(data, monthIndex)) + degreesToRadians(45);
    const segmentSize = degreesToRadians(deg);

    const daysInMonth = getDaysInMonth(monthIndex, year);
    const positionInSegment = 1 - ((dayInMonth - 1) / daysInMonth);
    const angleInSegment = positionInSegment * segmentSize;
    const angleForDate = segmentStartAngle + angleInSegment;

    let normalizedAngle = angleForDate;
    while (normalizedAngle < 0) normalizedAngle += 2 * Math.PI;
    while (normalizedAngle >= 2 * Math.PI) normalizedAngle += 2 * Math.PI;

    const sunRadius = radius + sunDistance;
    const sunPos = polarToCartesian(centerX, centerY, sunRadius, normalizedAngle);

    const moonPhase = getMoonPhase(date);
    const moonPhaseAngle = getMoonPhaseAngle(date);
    const moonAngle = normalizedAngle - moonPhaseAngle;
    const moonRadius = radius + moonDistance;
    const moonPos = polarToCartesian(centerX, centerY, moonRadius, moonAngle);

    showSunAndMoon(sunPos, moonPos, true, moonPhase);
  };

  // Track currently selected date for navigation functions
  let currentSelectedDate = new Date();

  const selectDate = (date) => {
    const safeDate = createSafeDateCopy(date);
    currentSelectedDate = safeDate; // Track selected date
    
    // Validate date
    const validation = validateDate(safeDate, validationOptions);
    if (!validation.valid) {
      showErrorMessage(validation.error);
      return;
    }
    
    // Clear any existing error messages
    removeIfPresent('.error-message');
    
    const monthIndex = safeDate.getMonth();

    // If we're in a day selection view, restore the year view before selecting.
    if (activeView === 'monthDays') {
      clearDaySelectionView();
      drawCalendar();
    }

    // Set aria-current on the selected month segment
    const segmentsGroup = svg.querySelector('.segments-group');
    if (segmentsGroup) {
      // Clear aria-current from all segments
      const allSegments = segmentsGroup.querySelectorAll('path');
      allSegments.forEach(segment => setAriaCurrent(segment, null));
      // Set aria-current on selected month
      const selectedSegment = segmentsGroup.querySelector(`path[data-segment-index="${monthIndex}"]`);
      if (selectedSegment) {
        setAriaCurrent(selectedSegment, 'date');
      }
    }

    showSunAndMoonForDate(safeDate);
    writeSegmentName(labels[monthIndex] ?? months[monthIndex], safeDate);
    notifyDateChanged(safeDate);
  };

  const setTimeSelectionOptions = (next = {}) => {
    timeSelectionEnabled = Boolean(next.timeSelectionEnabled);
    useTwelveHourClock = normaliseTwelveHourClock(next.is12HourClock);
    // If options change mid-flow, reset any in-progress selection overlays.
    pendingDate = null;
    clearTimeSelectionView();
  };

  const setYear = (year) => {
    currentYear = year;
    const today = new Date();
    if (year === today.getFullYear()) {
      showSunAndMoonForDate(today);
      writeSegmentName(labels[today.getMonth()], today);
      notifyDateChanged(today);
    } else {
      const midYearDate = new Date(year, 5, 15);
      showSunAndMoonForDate(midYearDate);
      writeSegmentName(labels[midYearDate.getMonth()], midYearDate);
      notifyDateChanged(midYearDate);
    }
  };

  const goToToday = () => {
    const today = new Date();
    const todayYear = today.getFullYear();
    
    // Update year if needed
    if (todayYear !== currentYear) {
      setYear(todayYear);
      drawCalendar();
      drawCircle();
    }
    
    // Select today's date
    selectDate(today);
  };

  // Set up touch gestures for swipe navigation
  const setupTouchGestures = () => {
    const callbacks = {
      onSwipeLeft: () => {
        const view = viewStateManager.getCurrentView();
        if (view === 'year' || view === 'monthDays') {
          navigateNextMonth();
        } else if (view === 'hours') {
          navigateNextDay();
        }
      },
      onSwipeRight: () => {
        const view = viewStateManager.getCurrentView();
        if (view === 'year' || view === 'monthDays') {
          navigatePreviousMonth();
        } else if (view === 'hours') {
          navigatePreviousDay();
        }
      }
    };
    setupSwipeGesture(svg, callbacks);
  };

  // Ensure instance is initialised with given SVG.
  initRenderer(svgElement);
  
  // Set up touch gestures
  setupTouchGestures();

  // Navigation functions for keyboard and swipe gestures
  const navigateNextMonth = () => {
    if (!currentSelectedDate) return;
    const nextMonth = new Date(currentSelectedDate);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    if (nextMonth.getFullYear() !== currentYear) {
      setYear(nextMonth.getFullYear());
      drawCalendar();
      drawCircle();
    }
    
    selectDate(nextMonth);
  };

  const navigatePreviousMonth = () => {
    if (!currentSelectedDate) return;
    const prevMonth = new Date(currentSelectedDate);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    
    if (prevMonth.getFullYear() !== currentYear) {
      setYear(prevMonth.getFullYear());
      drawCalendar();
      drawCircle();
    }
    
    selectDate(prevMonth);
  };

  const navigateNextDay = () => {
    if (!currentSelectedDate) return;
    const nextDay = new Date(currentSelectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    if (nextDay.getFullYear() !== currentYear) {
      setYear(nextDay.getFullYear());
      drawCalendar();
      drawCircle();
    }
    
    selectDate(nextDay);
  };

  const navigatePreviousDay = () => {
    if (!currentSelectedDate) return;
    const prevDay = new Date(currentSelectedDate);
    prevDay.setDate(prevDay.getDate() - 1);
    
    if (prevDay.getFullYear() !== currentYear) {
      setYear(prevDay.getFullYear());
      drawCalendar();
      drawCircle();
    }
    
    selectDate(prevDay);
  };

  return {
    initRenderer,
    drawCalendar,
    drawCircle,
    writeSegmentName,
    setYear,
    setTimeSelectionOptions,
    showSunAndMoonForDate,
    selectDate,
    subscribeToDateChanges,
    goToToday
  };
}

let defaultRenderer = null;

const requireDefaultRenderer = () => {
  if (!defaultRenderer) {
    throw new Error('Renderer not initialised. Call initRenderer(svgElement) first.');
  }
  return defaultRenderer;
};

export function initRenderer(svgElement, options = {}) {
  defaultRenderer = createCalendarRenderer(svgElement, options);
}

export function drawCalendar() {
  requireDefaultRenderer().drawCalendar();
}

export function drawCircle() {
  requireDefaultRenderer().drawCircle();
}

export function writeSegmentName(segment, date = null) {
  requireDefaultRenderer().writeSegmentName(segment, date);
}

export function setYear(year) {
  requireDefaultRenderer().setYear(year);
}

export function showSunAndMoonForDate(date) {
  requireDefaultRenderer().showSunAndMoonForDate(date);
}

export function selectDate(date) {
  requireDefaultRenderer().selectDate(date);
}

export function subscribeToDateChanges(listener) {
  return requireDefaultRenderer().subscribeToDateChanges(listener);
}

export function setTimeSelectionOptions(options = {}) {
  return requireDefaultRenderer().setTimeSelectionOptions(options);
}

export function goToToday() {
  return requireDefaultRenderer().goToToday();
}

