/*********************/
/* Calendar Renderer */
/*********************/

import {
  segments,
  monthColors,
  monthColorsHover,
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
import { rgbToHex } from '../utils/colorUtils.js';
import { degreesToRadians, sumTo, polarToCartesian } from '../utils/mathUtils.js';
import { createArcPath, getMoonShadowDx } from '../utils/svgUtils.js';
import { getDaysInMonth } from '../utils/dateUtils.js';
import { getMoonPhase, getMoonPhaseAngle, getMoonPhaseName } from '../utils/moonPhase.js';

const createSafeDateCopy = (date) => new Date(date.getTime());
const normaliseTwelveHourClock = (value) => {
  if (typeof value === 'boolean') return value;

  const raw = String(value ?? '').trim().toLowerCase();
  if (raw === '' || raw === 'false' || raw === '0') return false;
  if (raw === 'true' || raw === '1') return true;
  return false;
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
  let pendingDate = null;
  let pendingMeridiem = 'AM'; // only used in 12h mode
  let pendingHour24 = 0;

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

  const initRenderer = (svgEl) => {
    svg = svgEl;
    centerX = svgSize / 2;
    centerY = svgSize / 2;
    radius = (svgSize / 2) - sunDistance - padding;
  };

  const drawCalendar = () => {
    // Switching back to year view clears any day selection overlay.
    clearDaySelectionView();
    clearTimeSelectionView();
    activeView = 'year';
    activeMonthIndex = null;

    const segmentsGroup = svg.querySelector('.segments-group');
    if (segmentsGroup) {
      segmentsGroup.remove();
    }

    const segmentsGroupEl = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    segmentsGroupEl.setAttribute('class', 'segments-group');

    data.length = 0;
    labels.length = 0;
    colours.length = 0;

    for (let i = 0; i < segments; i++) {
      const monthColor = monthColors[i];
      const monthColorHover = monthColorsHover[i];
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
      path.setAttribute('stroke', '#fff');
      path.setAttribute('stroke-width', '1');
      path.setAttribute('data-segment-index', i);
      path.setAttribute('class', 'calendar-segment');
      path.setAttribute('data-base-color', newColourHex);
      path.setAttribute('data-hover-color', hoverColourHex);
      path.style.cursor = 'pointer';

      path.addEventListener('mouseenter', (e) => {
        e.target.setAttribute('fill', hoverColourHex);
      });
      path.addEventListener('mouseleave', (e) => {
        e.target.setAttribute('fill', newColourHex);
      });

      path.addEventListener('click', (e) => {
        e.preventDefault();
        // Month tap/click switches to day selection view for that month.
        showMonthDaySelection(i);
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

      if (i >= 3 && i <= 9) {
        text.style.fill = '#000';
      } else {
        text.style.fill = '#fff';
        text.style.filter = 'drop-shadow(0px 0px 5px rgba(255, 255, 255, 0.2))';
      }

      segmentsGroupEl.appendChild(text);
    }

    svg.appendChild(segmentsGroupEl);
  };

  const showMonthCentre = (monthIndex) => {
    const monthColourHex = rgbToHex(monthColors[monthIndex]);

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
    text.style.fill = '#fff';
    svg.appendChild(text);
  };

  const showMonthDaySelection = (monthIndex) => {
    clearYearView();
    clearDaySelectionView();
    clearTimeSelectionView();

    activeView = 'monthDays';
    activeMonthIndex = monthIndex;

    const days = getDaysInMonth(monthIndex, currentYear);
    const monthColourHex = rgbToHex(monthColors[monthIndex]);
    const dayLabelColour = (monthIndex >= 3 && monthIndex <= 9) ? '#000' : '#fff';

    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('class', 'day-segments-group');
    group.setAttribute('data-month-index', String(monthIndex));

    const degreesPerDay = 360 / days;
    for (let i = 0; i < days; i++) {
      const day = i + 1;
      const startingAngle = -degreesToRadians(degreesPerDay * i) + degreesToRadians(45);
      const arcSize = degreesToRadians(degreesPerDay);
      const endingAngle = startingAngle + arcSize;

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', createArcPath(centerX, centerY, radius, startingAngle, endingAngle, fullRadius));
      path.setAttribute('fill', monthColourHex);
      path.setAttribute('stroke', '#fff');
      path.setAttribute('stroke-width', '1');
      path.setAttribute('class', 'day-segment');
      path.setAttribute('data-day', String(day));
      path.style.cursor = 'pointer';

      path.addEventListener('click', (e) => {
        e.preventDefault();
        const selected = new Date(currentYear, monthIndex, day);
        if (timeSelectionEnabled) {
          pendingDate = selected;
          pendingMeridiem = 'AM';
          pendingHour24 = 0;
          clearDaySelectionView();
          showHourSelection();
          return;
        }

        drawCalendar();
        drawCircle();
        selectDate(selected);
      });

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

      group.appendChild(text);
    }

    svg.appendChild(group);
    showMonthCentre(monthIndex);
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
      text.style.fill = selected ? '#111' : '#666';

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

  const showHourSelection = () => {
    clearTimeSelectionView();
    activeView = 'hours';

    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('class', 'hour-segments-group');

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
      path.setAttribute('fill', '#f7f7f7');
      path.setAttribute('stroke', '#ddd');
      path.setAttribute('stroke-width', '1');
      path.setAttribute('class', 'hour-segment');
      path.setAttribute('data-hour', String(displayHour));
      path.style.cursor = 'pointer';

      path.addEventListener('mouseenter', (e) => {
        e.target.setAttribute('fill', '#eee');
      });
      path.addEventListener('mouseleave', (e) => {
        e.target.setAttribute('fill', '#f7f7f7');
      });

      path.addEventListener('click', (e) => {
        e.preventDefault();
        const hourValue = Number(path.getAttribute('data-hour'));
        if (!Number.isFinite(hourValue)) return;

        if (useTwelveHourClock) {
          const hour12 = hourValue === 12 ? 0 : hourValue;
          pendingHour24 = pendingMeridiem === 'PM' ? (hour12 + 12) : hour12;
        } else {
          pendingHour24 = Math.max(0, Math.min(23, hourValue));
        }

        showMinuteSelection();
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
      text.style.fill = '#333';
      group.appendChild(text);
    }

    svg.appendChild(group);

    if (useTwelveHourClock) {
      renderAmPmSelector();
    }
  };

  const showMinuteSelection = () => {
    removeIfPresent('.minute-segments-group');
    activeView = 'minutes';

    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('class', 'minute-segments-group');

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
      path.setAttribute('fill', '#ffffff');
      path.setAttribute('stroke', '#ddd');
      path.setAttribute('stroke-width', '1');
      path.setAttribute('class', 'minute-segment');
      path.setAttribute('data-minute', String(minute));
      path.style.cursor = 'pointer';

      path.addEventListener('mouseenter', (e) => {
        e.target.setAttribute('fill', '#f1f1f1');
      });
      path.addEventListener('mouseleave', (e) => {
        e.target.setAttribute('fill', '#ffffff');
      });

      path.addEventListener('click', (e) => {
        e.preventDefault();
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

        pendingDate = null;
        clearTimeSelectionView();
        drawCalendar();
        drawCircle();
        selectDate(final);
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
      text.style.fill = '#333';
      group.appendChild(text);
    }

    svg.appendChild(group);
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
    circle.setAttribute('fill', '#ffffff');
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
      dayText.style.fill = '#333';
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
    mainText.style.fill = '#333';
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
      yearText.style.fill = '#333';
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
      moonPhaseText.style.fill = '#666';
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
    while (normalizedAngle >= 2 * Math.PI) normalizedAngle -= 2 * Math.PI;

    const sunRadius = radius + sunDistance;
    const sunPos = polarToCartesian(centerX, centerY, sunRadius, normalizedAngle);

    const moonPhase = getMoonPhase(date);
    const moonPhaseAngle = getMoonPhaseAngle(date);
    const moonAngle = normalizedAngle - moonPhaseAngle;
    const moonRadius = radius + moonDistance;
    const moonPos = polarToCartesian(centerX, centerY, moonRadius, moonAngle);

    showSunAndMoon(sunPos, moonPos, true, moonPhase);
  };

  const selectDate = (date) => {
    const safeDate = createSafeDateCopy(date);
    const monthIndex = safeDate.getMonth();

    // If we're in a day selection view, restore the year view before selecting.
    if (activeView === 'monthDays') {
      clearDaySelectionView();
      drawCalendar();
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

  // Ensure instance is initialised with given SVG.
  initRenderer(svgElement);

  return {
    initRenderer,
    drawCalendar,
    drawCircle,
    writeSegmentName,
    setYear,
    setTimeSelectionOptions,
    showSunAndMoonForDate,
    selectDate,
    subscribeToDateChanges
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

