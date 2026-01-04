import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { initRenderer, drawCalendar, drawCircle, writeSegmentName, setYear, subscribeToDateChanges, selectDate } from '../src/renderer/calendarRenderer.js';
import { segments, svgSize } from '../src/config/config.js';

describe('calendarRenderer', () => {
  let mockSvg;

  beforeEach(() => {
    // Create a mock SVG element
    mockSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    mockSvg.setAttribute('id', 'test-svg');
    document.body.appendChild(mockSvg);
  });

  afterEach(() => {
    if (mockSvg && mockSvg.parentNode) {
      mockSvg.parentNode.removeChild(mockSvg);
    }
    // Clear any remaining elements
    const remaining = document.querySelectorAll('#test-svg');
    remaining.forEach(el => el.remove());
  });

  describe('initRenderer', () => {
    it('should initialize renderer with SVG element', () => {
      expect(() => initRenderer(mockSvg)).not.toThrow();
    });

    it('should accept valid SVG element', () => {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      expect(() => initRenderer(svg)).not.toThrow();
    });
  });

  describe('drawCalendar', () => {
    beforeEach(() => {
      initRenderer(mockSvg);
    });

    it('should create segments group element', () => {
      drawCalendar();
      const segmentsGroup = mockSvg.querySelector('.segments-group');
      expect(segmentsGroup).not.toBeNull();
      expect(segmentsGroup.tagName).toBe('g');
    });

    it('should create correct number of segments', () => {
      drawCalendar();
      const segmentsGroup = mockSvg.querySelector('.segments-group');
      const paths = segmentsGroup.querySelectorAll('path');
      expect(paths.length).toBe(segments);
    });

    it('should create labels for each segment', () => {
      drawCalendar();
      const segmentsGroup = mockSvg.querySelector('.segments-group');
      const labels = segmentsGroup.querySelectorAll('text');
      expect(labels.length).toBe(segments);
    });

    it('should set correct attributes on path elements', () => {
      drawCalendar();
      const segmentsGroup = mockSvg.querySelector('.segments-group');
      const firstPath = segmentsGroup.querySelector('path');
      
      expect(firstPath).not.toBeNull();
      expect(firstPath.getAttribute('class')).toBe('calendar-segment');
      expect(firstPath.getAttribute('stroke')).toBe('#fff');
      expect(firstPath.getAttribute('stroke-width')).toBe('1');
      expect(firstPath.style.cursor).toBe('pointer');
    });

    it('should add event listeners to paths', () => {
      drawCalendar();
      const segmentsGroup = mockSvg.querySelector('.segments-group');
      const firstPath = segmentsGroup.querySelector('path');
      
      // Create a mock event
      const clickEvent = new MouseEvent('click', { bubbles: true });
      
      // Should not throw when clicking
      expect(() => firstPath.dispatchEvent(clickEvent)).not.toThrow();
    });

    it('should clear previous segments when called multiple times', () => {
      drawCalendar();
      const firstGroup = mockSvg.querySelector('.segments-group');
      
      drawCalendar();
      const secondGroup = mockSvg.querySelector('.segments-group');
      
      // Should only have one group
      const allGroups = mockSvg.querySelectorAll('.segments-group');
      expect(allGroups.length).toBe(1);
      expect(secondGroup).not.toBe(firstGroup);
    });

    it('should apply correct text colours based on month index', () => {
      drawCalendar();
      const segmentsGroup = mockSvg.querySelector('.segments-group');
      const labels = segmentsGroup.querySelectorAll('text');
      
      // Light backgrounds (Apr-Oct, indices 3-9) should have dark text
      for (let i = 3; i <= 9; i++) {
        expect(labels[i].style.fill).toBe('#000');
      }
      
      // Dark backgrounds (Jan-Mar, Nov-Dec, indices 0-2, 10-11) should have white text
      for (let i of [0, 1, 2, 10, 11]) {
        expect(labels[i].style.fill).toBe('#fff');
        expect(labels[i].style.filter).toContain('drop-shadow');
      }
    });
  });

  describe('drawCircle', () => {
    beforeEach(() => {
      initRenderer(mockSvg);
    });

    it('should create a circle element', () => {
      drawCircle();
      const circle = mockSvg.querySelector('.center-circle');
      expect(circle).not.toBeNull();
      expect(circle.tagName).toBe('circle');
    });

    it('should set correct circle attributes', () => {
      drawCircle();
      const circle = mockSvg.querySelector('.center-circle');
      
      // Calculate expected radius: (svgSize / 2) - sunDistance - padding
      const expectedRadius = (svgSize / 2) - 50 - 10; // sunDistance = 50, padding = 10
      const expectedInnerRadius = expectedRadius / 3;
      
      expect(circle.getAttribute('cx')).toBe(String(svgSize / 2));
      expect(circle.getAttribute('cy')).toBe(String(svgSize / 2));
      expect(circle.getAttribute('r')).toBe(String(expectedInnerRadius));
      expect(circle.getAttribute('fill')).toBe('#ffffff');
    });

    it('should remove existing circle before creating new one', () => {
      drawCircle();
      const firstCircle = mockSvg.querySelector('.center-circle');
      
      drawCircle();
      const secondCircle = mockSvg.querySelector('.center-circle');
      
      // Should only have one circle
      const allCircles = mockSvg.querySelectorAll('.center-circle');
      expect(allCircles.length).toBe(1);
      expect(secondCircle).not.toBe(firstCircle);
    });

    it('should remove existing center text', () => {
      // Add a text element first
      const existingText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      existingText.setAttribute('class', 'center-text');
      mockSvg.appendChild(existingText);
      
      drawCircle();
      
      const textAfter = mockSvg.querySelector('.center-text');
      expect(textAfter).toBeNull();
    });
  });

  describe('writeSegmentName', () => {
    beforeEach(() => {
      initRenderer(mockSvg);
    });

    it('should create center text element', () => {
      writeSegmentName('JAN');
      const text = mockSvg.querySelector('.center-text');
      expect(text).not.toBeNull();
      expect(text.tagName).toBe('text');
    });

    it('should set correct text content', () => {
      writeSegmentName('FEB');
      const text = mockSvg.querySelector('.center-text');
      expect(text.textContent).toBe('FEB');
    });

    it('should set correct text attributes', () => {
      writeSegmentName('MAR');
      const text = mockSvg.querySelector('.center-text');
      
      expect(text.getAttribute('x')).toBe(String(svgSize / 2));
      expect(text.getAttribute('text-anchor')).toBe('middle');
      expect(text.getAttribute('dominant-baseline')).toBe('middle');
      expect(text.getAttribute('class')).toBe('center-text');
    });

    it('should set correct text styles', () => {
      writeSegmentName('APR');
      const text = mockSvg.querySelector('.center-text');
      
      // Fixed font size for central text
      expect(text.style.fontSize).toBe('16px');
      expect(text.style.fontFamily).toBe('Helvetica, Arial, sans-serif');
      expect(text.style.fill).toBe('#333');
    });

    it('should call drawCircle before adding text', () => {
      writeSegmentName('MAY');
      
      // Should have both circle and text
      const circle = mockSvg.querySelector('.center-circle');
      const text = mockSvg.querySelector('.center-text');
      
      expect(circle).not.toBeNull();
      expect(text).not.toBeNull();
    });

    it('should remove existing text before creating new one', () => {
      writeSegmentName('JUN');
      const firstText = mockSvg.querySelector('.center-text');
      
      writeSegmentName('JUL');
      const secondText = mockSvg.querySelector('.center-text');
      
      // Should only have one text element
      const allTexts = mockSvg.querySelectorAll('.center-text');
      expect(allTexts.length).toBe(1);
      expect(secondText).not.toBe(firstText);
    });

    it('should handle different month names', () => {
      const months = ['JAN', 'FEB', 'MAR', 'DEC'];
      months.forEach((month) => {
        writeSegmentName(month);
        const text = mockSvg.querySelector('.center-text');
        expect(text.textContent).toBe(month);
      });
    });
  });

  describe('subscribeToDateChanges', () => {
    it('should notify subscribers when setYear chooses the mid-year date', () => {
      initRenderer(mockSvg);
      drawCalendar();

      const seen = [];
      const unsubscribe = subscribeToDateChanges((date) => {
        seen.push(date);
      });

      setYear(2000); // not current year => uses mid-year date (June 15)

      unsubscribe();

      expect(seen.length).toBeGreaterThanOrEqual(1);
      const last = seen[seen.length - 1];
      expect(last.getFullYear()).toBe(2000);
      expect(last.getMonth()).toBe(5);
      expect(last.getDate()).toBe(15);
    });
  });

  describe('selectDate', () => {
    it('should move the sun, update centre text, and notify subscribers', () => {
      initRenderer(mockSvg);
      drawCalendar();

      const seen = [];
      const unsubscribe = subscribeToDateChanges((date) => {
        seen.push(date);
      });

      const date = new Date(2026, 0, 10);
      selectDate(date);

      unsubscribe();

      const sun = mockSvg.querySelector('.sun-icon');
      const moon = mockSvg.querySelector('.moon-icon');
      expect(sun).not.toBeNull();
      expect(moon).not.toBeNull();

      const centreTexts = Array.from(mockSvg.querySelectorAll('.center-text')).map((el) => el.textContent);
      expect(centreTexts.some((t) => t === 'JAN 10')).toBe(true);

      expect(seen.length).toBeGreaterThanOrEqual(1);
      const last = seen[seen.length - 1];
      expect(last.getFullYear()).toBe(2026);
      expect(last.getMonth()).toBe(0);
      expect(last.getDate()).toBe(10);
    });
  });

  describe('month -> day selection view', () => {
    beforeEach(() => {
      initRenderer(mockSvg);
      // Drag handlers rely on viewBox for coordinate transforms.
      mockSvg.setAttribute('viewBox', `0 0 ${svgSize} ${svgSize}`);
      drawCalendar();
    });

    it('should swap to a day ring for the selected month and show the month name in the centre', () => {
      const janPath = mockSvg.querySelector('.segments-group path[data-segment-index="0"]');
      expect(janPath).not.toBeNull();

      janPath.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      const yearSegments = mockSvg.querySelector('.segments-group');
      expect(yearSegments).toBeNull();

      const dayGroup = mockSvg.querySelector('.day-segments-group');
      expect(dayGroup).not.toBeNull();

      const dayPaths = dayGroup.querySelectorAll('path.day-segment');
      expect(dayPaths.length).toBe(31);

      const dayLabels = dayGroup.querySelectorAll('text.day-label');
      expect(dayLabels.length).toBe(31);
      expect(Array.from(dayLabels).some((el) => el.textContent === '1')).toBe(true);
      expect(Array.from(dayLabels).some((el) => el.textContent === '31')).toBe(true);

      const centreTexts = Array.from(mockSvg.querySelectorAll('.center-text')).map((el) => el.textContent);
      expect(centreTexts).toEqual(['JAN']);
    });

    it('should select the full date when a day is selected and restore the year view', () => {
      const seen = [];
      const unsubscribe = subscribeToDateChanges((date) => {
        seen.push(date);
      });

      // Force deterministic year for the selection.
      setYear(2026);
      seen.length = 0;

      const janPath = mockSvg.querySelector('.segments-group path[data-segment-index="0"]');
      janPath.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      const day15 = mockSvg.querySelector('.day-segments-group path.day-segment[data-day="15"]');
      expect(day15).not.toBeNull();

      day15.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      unsubscribe();

      const yearSegments = mockSvg.querySelector('.segments-group');
      expect(yearSegments).not.toBeNull();
      expect(mockSvg.querySelector('.day-segments-group')).toBeNull();
      expect(mockSvg.querySelector('.sun-icon')).not.toBeNull();

      expect(seen.length).toBeGreaterThanOrEqual(1);
      const last = seen[seen.length - 1];
      expect(last.getFullYear()).toBe(2026);
      expect(last.getMonth()).toBe(0);
      expect(last.getDate()).toBe(15);
    });

    it('should allow dragging the month day ring to change the selected date while the sun remains static', () => {
      // Make SVG coordinate transforms deterministic in jsdom.
      mockSvg.getBoundingClientRect = () => ({
        left: 0,
        top: 0,
        width: svgSize,
        height: svgSize,
        right: svgSize,
        bottom: svgSize,
        x: 0,
        y: 0,
        toJSON() { return {}; }
      });

      // Fix the year and an initial selected date (so we can verify it changes).
      setYear(2026);
      selectDate(new Date(2026, 0, 15));

      const seen = [];
      const unsubscribe = subscribeToDateChanges((date) => seen.push(date));
      seen.length = 0;

      // Enter month day ring (January).
      const janPath = mockSvg.querySelector('.segments-group path[data-segment-index="0"]');
      janPath.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      const dayGroup = mockSvg.querySelector('.day-segments-group');
      expect(dayGroup).not.toBeNull();

      const sun = mockSvg.querySelector('.sun-icon');
      expect(sun).not.toBeNull();
      const sunTransformBefore = sun.getAttribute('transform');

      const centre = svgSize / 2;
      const startEvent = new MouseEvent('mousedown', { bubbles: true, clientX: centre + 100, clientY: centre });
      dayGroup.dispatchEvent(startEvent);

      // Rotate by ~90 degrees.
      document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: centre, clientY: centre + 100 }));
      document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));

      unsubscribe();

      expect(seen.length).toBeGreaterThanOrEqual(1);
      const last = seen[seen.length - 1];
      expect(last.getFullYear()).toBe(2026);
      expect(last.getMonth()).toBe(0);
      expect(last.getDate()).not.toBe(15);

      const sunTransformAfter = mockSvg.querySelector('.sun-icon')?.getAttribute('transform');
      expect(sunTransformAfter).toBe(sunTransformBefore);
    });

    it('should not select a day on the first click after dragging the day ring (but should on the next click)', () => {
      // Make SVG coordinate transforms deterministic in jsdom.
      mockSvg.getBoundingClientRect = () => ({
        left: 0,
        top: 0,
        width: svgSize,
        height: svgSize,
        right: svgSize,
        bottom: svgSize,
        x: 0,
        y: 0,
        toJSON() { return {}; }
      });

      setYear(2026);
      selectDate(new Date(2026, 0, 10));

      const seen = [];
      const unsubscribe = subscribeToDateChanges((date) => seen.push(date));
      seen.length = 0;

      const janPath = mockSvg.querySelector('.segments-group path[data-segment-index="0"]');
      janPath.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      const dayGroup = mockSvg.querySelector('.day-segments-group');
      expect(dayGroup).not.toBeNull();

      const centre = svgSize / 2;
      dayGroup.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: centre + 100, clientY: centre }));
      document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: centre, clientY: centre + 100 }));
      document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));

      const day15 = mockSvg.querySelector('.day-segments-group path.day-segment[data-day="15"]');
      expect(day15).not.toBeNull();

      // First click after drag should be suppressed (remain in day selection view).
      day15.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(mockSvg.querySelector('.day-segments-group')).not.toBeNull();
      expect(mockSvg.querySelector('.segments-group')).toBeNull();

      // Next click should select the day and return to the year view.
      day15.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(mockSvg.querySelector('.day-segments-group')).toBeNull();
      expect(mockSvg.querySelector('.segments-group')).not.toBeNull();

      unsubscribe();

      expect(seen.length).toBeGreaterThanOrEqual(1);
      const last = seen[seen.length - 1];
      expect(last.getFullYear()).toBe(2026);
      expect(last.getMonth()).toBe(0);
      expect(last.getDate()).toBe(15);
    });
  });

  describe('year (month) ring dragging', () => {
    beforeEach(() => {
      initRenderer(mockSvg);
      // Drag handlers rely on viewBox for coordinate transforms.
      mockSvg.setAttribute('viewBox', `0 0 ${svgSize} ${svgSize}`);
      drawCalendar();
    });

    it('should allow dragging the year ring to change the selected date while the sun remains static', () => {
      // Make SVG coordinate transforms deterministic in jsdom.
      mockSvg.getBoundingClientRect = () => ({
        left: 0,
        top: 0,
        width: svgSize,
        height: svgSize,
        right: svgSize,
        bottom: svgSize,
        x: 0,
        y: 0,
        toJSON() { return {}; }
      });

      setYear(2026);
      selectDate(new Date(2026, 0, 15));

      const seen = [];
      const unsubscribe = subscribeToDateChanges((date) => seen.push(date));
      seen.length = 0;

      const sun = mockSvg.querySelector('.sun-icon');
      expect(sun).not.toBeNull();
      const sunTransformBefore = sun.getAttribute('transform');

      const segmentsGroup = mockSvg.querySelector('.segments-group');
      expect(segmentsGroup).not.toBeNull();

      const centre = svgSize / 2;
      segmentsGroup.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: centre + 100, clientY: centre }));
      document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: centre, clientY: centre + 100 }));
      document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));

      unsubscribe();

      expect(seen.length).toBeGreaterThanOrEqual(1);
      const last = seen[seen.length - 1];
      expect(last.getFullYear()).toBe(2026);
      expect(last.getMonth()).not.toBe(0);

      const sunTransformAfter = mockSvg.querySelector('.sun-icon')?.getAttribute('transform');
      expect(sunTransformAfter).toBe(sunTransformBefore);
    });

    it('should not trigger month selection on the first click after a drag (but should on the next click)', () => {
      mockSvg.getBoundingClientRect = () => ({
        left: 0,
        top: 0,
        width: svgSize,
        height: svgSize,
        right: svgSize,
        bottom: svgSize,
        x: 0,
        y: 0,
        toJSON() { return {}; }
      });

      setYear(2026);
      selectDate(new Date(2026, 0, 15));

      const segmentsGroup = mockSvg.querySelector('.segments-group');
      expect(segmentsGroup).not.toBeNull();

      const centre = svgSize / 2;
      segmentsGroup.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: centre + 100, clientY: centre }));
      document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: centre, clientY: centre + 100 }));
      document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));

      const febPath = mockSvg.querySelector('.segments-group path[data-segment-index="1"]');
      expect(febPath).not.toBeNull();

      // First click after drag should be suppressed (stay in year view).
      febPath.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(mockSvg.querySelector('.segments-group')).not.toBeNull();
      expect(mockSvg.querySelector('.day-segments-group')).toBeNull();

      // Next click should work normally (enter day selection view).
      febPath.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(mockSvg.querySelector('.segments-group')).toBeNull();
      expect(mockSvg.querySelector('.day-segments-group')).not.toBeNull();
    });
  });
});

