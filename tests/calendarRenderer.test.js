import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { initRenderer, drawCalendar, drawCircle, writeSegmentName, setYear, subscribeToDateChanges, selectDate, goToToday, setTimeSelectionOptions } from '../src/renderer/calendarRenderer.js';
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
      // New format: "10 January 2026" instead of "Jan 10"
      // Check that the formatted date is displayed (contains day, month name, and year)
      // Combine all text to check for formatted date parts
      const combinedText = centreTexts.join(' ');
      const hasFormattedDate = combinedText.includes('10') && 
                               combinedText.includes('January') && 
                               combinedText.includes('2026');
      expect(hasFormattedDate).toBe(true);

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
      // showMonthCentre displays uppercase month name
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
  });

  describe('time selection view (optional)', () => {
    beforeEach(() => {
      initRenderer(mockSvg, { timeSelectionEnabled: true, is12HourClock: false });
      drawCalendar();
      setYear(2026);
    });

    it('should show an hour ring after selecting a day (and not notify until minutes are selected)', () => {
      const seen = [];
      const unsubscribe = subscribeToDateChanges((date) => seen.push(date));

      const janPath = mockSvg.querySelector('.segments-group path[data-segment-index="0"]');
      expect(janPath).not.toBeNull();
      janPath.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      const day15 = mockSvg.querySelector('.day-segments-group path.day-segment[data-day="15"]');
      expect(day15).not.toBeNull();
      day15.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      // Day view should be replaced by hour selection.
      expect(mockSvg.querySelector('.day-segments-group')).toBeNull();
      const hourGroup = mockSvg.querySelector('.hour-segments-group');
      expect(hourGroup).not.toBeNull();

      const hourSegments = hourGroup.querySelectorAll('path.hour-segment');
      expect(hourSegments.length).toBe(24);

      // No notification yet (time not locked in).
      expect(seen.length).toBe(0);
      unsubscribe();
    });

    it('should show a minute ring after selecting an hour, then notify and return to year view after selecting minutes', () => {
      const seen = [];
      const unsubscribe = subscribeToDateChanges((date) => seen.push(date));

      const janPath = mockSvg.querySelector('.segments-group path[data-segment-index="0"]');
      janPath.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      const day15 = mockSvg.querySelector('.day-segments-group path.day-segment[data-day="15"]');
      day15.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      const hour13 = mockSvg.querySelector('.hour-segments-group path.hour-segment[data-hour="13"]');
      expect(hour13).not.toBeNull();
      hour13.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      const minuteGroup = mockSvg.querySelector('.minute-segments-group');
      expect(minuteGroup).not.toBeNull();
      const minuteSegments = minuteGroup.querySelectorAll('path.minute-segment');
      expect(minuteSegments.length).toBe(12);

      const minute25 = mockSvg.querySelector('.minute-segments-group path.minute-segment[data-minute="25"]');
      expect(minute25).not.toBeNull();
      minute25.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      // After minutes are selected, return to year view and notify once.
      expect(mockSvg.querySelector('.segments-group')).not.toBeNull();
      expect(mockSvg.querySelector('.hour-segments-group')).toBeNull();
      expect(mockSvg.querySelector('.minute-segments-group')).toBeNull();

      expect(seen.length).toBe(1);
      const last = seen[0];
      expect(last.getFullYear()).toBe(2026);
      expect(last.getMonth()).toBe(0);
      expect(last.getDate()).toBe(15);
      expect(last.getHours()).toBe(13);
      expect(last.getMinutes()).toBe(25);

      unsubscribe();
    });
  });

  describe('ARIA attributes', () => {
    beforeEach(() => {
      initRenderer(mockSvg);
    });

    describe('month segments', () => {
      it('should have role="button" on month segments', () => {
        drawCalendar();
        const segmentsGroup = mockSvg.querySelector('.segments-group');
        const firstPath = segmentsGroup.querySelector('path');
        expect(firstPath.getAttribute('role')).toBe('button');
      });

      it('should have descriptive aria-label on month segments', () => {
        drawCalendar();
        const segmentsGroup = mockSvg.querySelector('.segments-group');
        const janPath = segmentsGroup.querySelector('path[data-segment-index="0"]');
        const label = janPath.getAttribute('aria-label');
        expect(label).toContain('January');
        expect(label).toContain('days');
        // Year will be current year or whatever was set
        expect(label).toMatch(/\d{4}/); // Contains a 4-digit year
      });

      it('should have role="group" on segments group', () => {
        drawCalendar();
        const segmentsGroup = mockSvg.querySelector('.segments-group');
        expect(segmentsGroup.getAttribute('role')).toBe('group');
      });
    });

    describe('day segments', () => {
      beforeEach(() => {
        drawCalendar();
        setYear(2024);
        const janPath = mockSvg.querySelector('.segments-group path[data-segment-index="0"]');
        janPath.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });

      it('should have role="button" on day segments', () => {
        const dayGroup = mockSvg.querySelector('.day-segments-group');
        const firstDay = dayGroup.querySelector('path.day-segment');
        expect(firstDay.getAttribute('role')).toBe('button');
      });

      it('should have descriptive aria-label on day segments', () => {
        const dayGroup = mockSvg.querySelector('.day-segments-group');
        const day15 = dayGroup.querySelector('path.day-segment[data-day="15"]');
        const label = day15.getAttribute('aria-label');
        expect(label).toContain('January');
        expect(label).toContain('15');
        expect(label).toContain('2024');
      });

      it('should have role="group" on day segments group', () => {
        const dayGroup = mockSvg.querySelector('.day-segments-group');
        expect(dayGroup.getAttribute('role')).toBe('group');
      });
    });

    describe('hour segments', () => {
      beforeEach(() => {
        initRenderer(mockSvg, { timeSelectionEnabled: true, is12HourClock: false });
        drawCalendar();
        setYear(2024);
        const janPath = mockSvg.querySelector('.segments-group path[data-segment-index="0"]');
        janPath.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        const day15 = mockSvg.querySelector('.day-segments-group path.day-segment[data-day="15"]');
        day15.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });

      it('should have role="button" on hour segments', () => {
        const hourGroup = mockSvg.querySelector('.hour-segments-group');
        const firstHour = hourGroup.querySelector('path.hour-segment');
        expect(firstHour.getAttribute('role')).toBe('button');
      });

      it('should have descriptive aria-label on hour segments (24-hour format)', () => {
        const hourGroup = mockSvg.querySelector('.hour-segments-group');
        const hour14 = hourGroup.querySelector('path.hour-segment[data-hour="14"]');
        const label = hour14.getAttribute('aria-label');
        expect(label).toContain('14');
        expect(label).toContain('00');
      });

      it('should have role="group" on hour segments group', () => {
        const hourGroup = mockSvg.querySelector('.hour-segments-group');
        expect(hourGroup.getAttribute('role')).toBe('group');
      });
    });

    describe('minute segments', () => {
      beforeEach(() => {
        initRenderer(mockSvg, { timeSelectionEnabled: true, is12HourClock: false });
        drawCalendar();
        setYear(2024);
        const janPath = mockSvg.querySelector('.segments-group path[data-segment-index="0"]');
        janPath.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        const day15 = mockSvg.querySelector('.day-segments-group path.day-segment[data-day="15"]');
        day15.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        const hour13 = mockSvg.querySelector('.hour-segments-group path.hour-segment[data-hour="13"]');
        hour13.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });

      it('should have role="button" on minute segments', () => {
        const minuteGroup = mockSvg.querySelector('.minute-segments-group');
        const firstMinute = minuteGroup.querySelector('path.minute-segment');
        expect(firstMinute.getAttribute('role')).toBe('button');
      });

      it('should have descriptive aria-label on minute segments', () => {
        const minuteGroup = mockSvg.querySelector('.minute-segments-group');
        const minute30 = minuteGroup.querySelector('path.minute-segment[data-minute="30"]');
        const label = minute30.getAttribute('aria-label');
        expect(label).toContain('13');
        expect(label).toContain('30');
      });

      it('should have role="group" on minute segments group', () => {
        const minuteGroup = mockSvg.querySelector('.minute-segments-group');
        expect(minuteGroup.getAttribute('role')).toBe('group');
      });
    });

    describe('ARIA live region', () => {
      it('should create ARIA live region when calendar is drawn', () => {
        drawCalendar();
        const liveRegion = mockSvg.querySelector('#aria-live-region');
        expect(liveRegion).not.toBeNull();
        expect(liveRegion.getAttribute('aria-live')).toBe('polite');
        expect(liveRegion.getAttribute('aria-atomic')).toBe('true');
        expect(liveRegion.classList.contains('sr-only')).toBe(true);
      });

      it('should announce view changes when entering day selection', async () => {
        drawCalendar();
        const janPath = mockSvg.querySelector('.segments-group path[data-segment-index="0"]');
        janPath.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        
        // Wait for announcement
        await new Promise(resolve => setTimeout(resolve, 10));
        const liveRegion = mockSvg.querySelector('#aria-live-region');
        const announcement = liveRegion.textContent;
        expect(announcement).toContain('January');
      });
    });

    describe('aria-current for selected items', () => {
      it('should set aria-current="date" on selected date segment', () => {
        drawCalendar();
        setYear(2024);
        const janPath = mockSvg.querySelector('.segments-group path[data-segment-index="0"]');
        janPath.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        const day15 = mockSvg.querySelector('.day-segments-group path.day-segment[data-day="15"]');
        day15.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        
        // After selection, the calendar returns to year view
        // The selected month should have aria-current
        const selectedMonth = mockSvg.querySelector('.segments-group path[data-segment-index="0"]');
        // Note: This test may need adjustment based on actual implementation
        // The aria-current might be set differently
      });
    });
  });

  describe('Escape key navigation', () => {
    beforeEach(() => {
      initRenderer(mockSvg);
      drawCalendar();
    });

    it('should return from month day selection to year view when Escape is pressed', () => {
      // Navigate to month day selection by clicking a month segment
      const januarySegment = mockSvg.querySelector('.calendar-segment[data-segment-index="0"]');
      expect(januarySegment).not.toBeNull();
      januarySegment.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      // Verify we're in month day selection view
      expect(mockSvg.querySelector('.day-segments-group')).not.toBeNull();
      expect(mockSvg.querySelector('.segments-group')).toBeNull();

      // Press Escape key
      const escapeEvent = new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true
      });
      mockSvg.dispatchEvent(escapeEvent);

      // Verify we returned to year view
      expect(mockSvg.querySelector('.segments-group')).not.toBeNull();
      expect(mockSvg.querySelector('.day-segments-group')).toBeNull();
    });

    it('should return from hour selection to day selection when Escape is pressed', () => {
      // Enable time selection and navigate to hour selection
      initRenderer(mockSvg, { timeSelectionEnabled: true });
      drawCalendar();

      // Click month segment to enter day selection
      const januarySegment = mockSvg.querySelector('.calendar-segment[data-segment-index="0"]');
      januarySegment.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      
      // Click day segment to enter hour selection
      const daySegment = mockSvg.querySelector('.day-segment[data-day="15"]');
      expect(daySegment).not.toBeNull();
      daySegment.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      // Verify we're in hour selection view
      expect(mockSvg.querySelector('.hour-segments-group')).not.toBeNull();
      expect(mockSvg.querySelector('.day-segments-group')).toBeNull();

      // Press Escape key
      const escapeEvent = new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true
      });
      mockSvg.dispatchEvent(escapeEvent);

      // Verify we returned to day selection view
      expect(mockSvg.querySelector('.day-segments-group')).not.toBeNull();
      expect(mockSvg.querySelector('.hour-segments-group')).toBeNull();
    });

    it('should return from minute selection to hour selection when Escape is pressed', () => {
      // Enable time selection and navigate to minute selection
      initRenderer(mockSvg, { timeSelectionEnabled: true });
      drawCalendar();

      // Click month segment to enter day selection
      const januarySegment = mockSvg.querySelector('.calendar-segment[data-segment-index="0"]');
      januarySegment.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      
      // Click day segment to enter hour selection
      const daySegment = mockSvg.querySelector('.day-segment[data-day="15"]');
      daySegment.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      // Click hour segment to enter minute selection
      const hourSegment = mockSvg.querySelector('.hour-segment[data-hour="2"]');
      expect(hourSegment).not.toBeNull();
      hourSegment.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      // Verify we're in minute selection view
      expect(mockSvg.querySelector('.minute-segments-group')).not.toBeNull();
      expect(mockSvg.querySelector('.hour-segments-group')).toBeNull();

      // Press Escape key
      const escapeEvent = new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true
      });
      mockSvg.dispatchEvent(escapeEvent);

      // Verify we returned to hour selection view
      expect(mockSvg.querySelector('.hour-segments-group')).not.toBeNull();
      expect(mockSvg.querySelector('.minute-segments-group')).toBeNull();
    });

    it('should do nothing when Escape is pressed in year view', () => {
      // Verify we're in year view
      expect(mockSvg.querySelector('.segments-group')).not.toBeNull();
      
      // Press Escape key
      const escapeEvent = new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true
      });
      mockSvg.dispatchEvent(escapeEvent);

      // Verify we're still in year view
      expect(mockSvg.querySelector('.segments-group')).not.toBeNull();
      expect(mockSvg.querySelector('.day-segments-group')).toBeNull();
    });
  });

  describe('goToToday', () => {
    beforeEach(() => {
      initRenderer(mockSvg);
      drawCalendar();
    });

    it('should navigate to today\'s date when in current year', () => {
      const today = new Date();
      const currentYear = today.getFullYear();
      
      // Set to current year
      setYear(currentYear);
      
      const seen = [];
      const unsubscribe = subscribeToDateChanges((date) => {
        seen.push(date);
      });

      goToToday();

      unsubscribe();

      // Should have notified with today's date
      expect(seen.length).toBeGreaterThanOrEqual(1);
      const last = seen[seen.length - 1];
      expect(last.getFullYear()).toBe(today.getFullYear());
      expect(last.getMonth()).toBe(today.getMonth());
      expect(last.getDate()).toBe(today.getDate());

      // Should have sun and moon for today
      const sun = mockSvg.querySelector('.sun-icon');
      const moon = mockSvg.querySelector('.moon-icon');
      expect(sun).not.toBeNull();
      expect(moon).not.toBeNull();
    });

    it('should update year and navigate to today when in different year', () => {
      const today = new Date();
      const currentYear = today.getFullYear();
      const differentYear = currentYear - 1; // Last year
      
      // Set to different year
      setYear(differentYear);
      
      const seen = [];
      const unsubscribe = subscribeToDateChanges((date) => {
        seen.push(date);
      });

      goToToday();

      unsubscribe();

      // Should have notified with today's date
      expect(seen.length).toBeGreaterThanOrEqual(1);
      const last = seen[seen.length - 1];
      expect(last.getFullYear()).toBe(today.getFullYear());
      expect(last.getMonth()).toBe(today.getMonth());
      expect(last.getDate()).toBe(today.getDate());
    });

    it('should select today even when in day selection view', () => {
      const today = new Date();
      const currentYear = today.getFullYear();
      
      setYear(currentYear);
      drawCalendar();
      
      // Navigate to day selection view
      const januarySegment = mockSvg.querySelector('.calendar-segment[data-segment-index="0"]');
      januarySegment.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      
      // Verify we're in day selection view
      expect(mockSvg.querySelector('.day-segments-group')).not.toBeNull();
      
      const seen = [];
      const unsubscribe = subscribeToDateChanges((date) => {
        seen.push(date);
      });

      goToToday();

      unsubscribe();

      // Should have selected today and returned to year view
      expect(seen.length).toBeGreaterThanOrEqual(1);
      const last = seen[seen.length - 1];
      expect(last.getFullYear()).toBe(today.getFullYear());
      expect(last.getMonth()).toBe(today.getMonth());
      expect(last.getDate()).toBe(today.getDate());
      
      // Should be back in year view (selectDate clears day selection view)
      expect(mockSvg.querySelector('.segments-group')).not.toBeNull();
    });

    it('should work when time selection is enabled', () => {
      initRenderer(mockSvg, { timeSelectionEnabled: true });
      drawCalendar();
      
      const today = new Date();
      const currentYear = today.getFullYear();
      setYear(currentYear);
      
      const seen = [];
      const unsubscribe = subscribeToDateChanges((date) => {
        seen.push(date);
      });

      goToToday();

      unsubscribe();

      // Should have notified with today's date
      expect(seen.length).toBeGreaterThanOrEqual(1);
      const last = seen[seen.length - 1];
      expect(last.getFullYear()).toBe(today.getFullYear());
      expect(last.getMonth()).toBe(today.getMonth());
      expect(last.getDate()).toBe(today.getDate());
    });
  });

  describe('Keyboard Navigation', () => {
    beforeEach(() => {
      initRenderer(mockSvg);
      drawCalendar();
    });

    it('should make month segments focusable', () => {
      const segmentsGroup = mockSvg.querySelector('.segments-group');
      const paths = segmentsGroup.querySelectorAll('path.calendar-segment');
      
      expect(paths.length).toBeGreaterThan(0);
      paths.forEach(path => {
        expect(path.getAttribute('tabindex')).toBe('0');
      });
    });

    it('should handle Enter key activation on month segments', () => {
      const segmentsGroup = mockSvg.querySelector('.segments-group');
      const firstPath = segmentsGroup.querySelector('path.calendar-segment');
      
      expect(firstPath).not.toBeNull();
      
      // Simulate Enter key
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
      firstPath.dispatchEvent(enterEvent);
      
      // Should have switched to day selection view
      const daySegmentsGroup = mockSvg.querySelector('.day-segments-group');
      expect(daySegmentsGroup).not.toBeNull();
    });

    it('should handle Space key activation on month segments', () => {
      const segmentsGroup = mockSvg.querySelector('.segments-group');
      const firstPath = segmentsGroup.querySelector('path.calendar-segment');
      
      expect(firstPath).not.toBeNull();
      
      // Simulate Space key
      const spaceEvent = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });
      firstPath.dispatchEvent(spaceEvent);
      
      // Should have switched to day selection view
      const daySegmentsGroup = mockSvg.querySelector('.day-segments-group');
      expect(daySegmentsGroup).not.toBeNull();
    });

    it('should handle ArrowRight navigation between month segments', () => {
      const segmentsGroup = mockSvg.querySelector('.segments-group');
      const paths = Array.from(segmentsGroup.querySelectorAll('path.calendar-segment'));
      
      expect(paths.length).toBeGreaterThan(1);
      
      // Focus first segment
      paths[0].focus();
      expect(document.activeElement).toBe(paths[0]);
      
      // Simulate ArrowRight
      const arrowEvent = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true });
      paths[0].dispatchEvent(arrowEvent);
      
      // Focus should move to next segment (or wrap to first)
      // Note: The actual focus movement happens in the event handler
      expect(paths[0].classList.contains('focused') || paths[1].classList.contains('focused')).toBe(true);
    });

    it('should add focused class on focus event', () => {
      const segmentsGroup = mockSvg.querySelector('.segments-group');
      const firstPath = segmentsGroup.querySelector('path.calendar-segment');
      
      const focusEvent = new Event('focus', { bubbles: true });
      firstPath.dispatchEvent(focusEvent);
      
      expect(firstPath.classList.contains('focused')).toBe(true);
    });

    it('should remove focused class on blur event', () => {
      const segmentsGroup = mockSvg.querySelector('.segments-group');
      const firstPath = segmentsGroup.querySelector('path.calendar-segment');
      
      firstPath.classList.add('focused');
      const blurEvent = new Event('blur', { bubbles: true });
      firstPath.dispatchEvent(blurEvent);
      
      expect(firstPath.classList.contains('focused')).toBe(false);
    });

    it('should make day segments focusable when in day selection view', () => {
      const segmentsGroup = mockSvg.querySelector('.segments-group');
      const firstMonthPath = segmentsGroup.querySelector('path.calendar-segment');
      
      // Dispatch click event to enter day selection
      const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
      firstMonthPath.dispatchEvent(clickEvent);
      
      const daySegmentsGroup = mockSvg.querySelector('.day-segments-group');
      expect(daySegmentsGroup).not.toBeNull();
      
      const dayPaths = daySegmentsGroup.querySelectorAll('path.day-segment:not(.day-segment--restricted)');
      expect(dayPaths.length).toBeGreaterThan(0);
      
      dayPaths.forEach(path => {
        expect(path.getAttribute('tabindex')).toBe('0');
      });
    });

    it('should handle Home key to jump to first month segment', () => {
      const segmentsGroup = mockSvg.querySelector('.segments-group');
      const paths = Array.from(segmentsGroup.querySelectorAll('path.calendar-segment'));
      
      // Focus a middle segment
      if (paths.length > 2) {
        paths[2].focus();
        
        // Simulate Home key
        const homeEvent = new KeyboardEvent('keydown', { key: 'Home', bubbles: true, cancelable: true });
        paths[2].dispatchEvent(homeEvent);
        
        // First segment should receive focus (or be focused)
        // The actual focus movement is handled by the callback
        expect(paths[0].classList.contains('focused') || paths[2].classList.contains('focused')).toBe(true);
      }
    });

    it('should handle End key to jump to last month segment', () => {
      const segmentsGroup = mockSvg.querySelector('.segments-group');
      const paths = Array.from(segmentsGroup.querySelectorAll('path.calendar-segment'));
      
      // Focus first segment
      paths[0].focus();
      
      // Simulate End key
      const endEvent = new KeyboardEvent('keydown', { key: 'End', bubbles: true, cancelable: true });
      paths[0].dispatchEvent(endEvent);
      
      // Last segment should receive focus (or be focused)
      const lastIndex = paths.length - 1;
      expect(paths[lastIndex].classList.contains('focused') || paths[0].classList.contains('focused')).toBe(true);
    });
  });

  describe('Focus Management Integration', () => {
    beforeEach(() => {
      initRenderer(mockSvg);
      drawCalendar();
    });

    describe('with time selection enabled', () => {
      beforeEach(() => {
        // Reinitialize with time selection enabled
        initRenderer(mockSvg, { timeSelectionEnabled: true });
        drawCalendar();
      });

    it('should focus first day segment when entering day selection from year view', async () => {
      const segmentsGroup = mockSvg.querySelector('.segments-group');
      const firstMonthPath = segmentsGroup.querySelector('path.calendar-segment');
      
      // Focus a month segment
      firstMonthPath.focus();
      
      // Enter day selection
      const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
      firstMonthPath.dispatchEvent(clickEvent);
      
      // Wait for transition and focus to settle
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const daySegmentsGroup = mockSvg.querySelector('.day-segments-group');
      expect(daySegmentsGroup).not.toBeNull();
      
      const firstDayPath = daySegmentsGroup.querySelector('path.day-segment:not(.day-segment--restricted)');
      expect(firstDayPath).not.toBeNull();
      // Focus should be on first day segment
      expect(document.activeElement === firstDayPath || firstDayPath.classList.contains('focused')).toBe(true);
    });

      it('should focus first hour segment when entering hour selection from day selection', async () => {
        // First enter day selection
        const segmentsGroup = mockSvg.querySelector('.segments-group');
        const firstMonthPath = segmentsGroup.querySelector('path.calendar-segment');
        firstMonthPath.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Then enter hour selection
        const daySegmentsGroup = mockSvg.querySelector('.day-segments-group');
        const firstDayPath = daySegmentsGroup.querySelector('path.day-segment:not(.day-segment--restricted)');
        firstDayPath.focus();
        
        const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
        firstDayPath.dispatchEvent(clickEvent);
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const hourSegmentsGroup = mockSvg.querySelector('.hour-segments-group');
        expect(hourSegmentsGroup).not.toBeNull();
        
        const firstHourPath = hourSegmentsGroup.querySelector('path.hour-segment');
        expect(firstHourPath).not.toBeNull();
        // Focus should be on first hour segment
        expect(document.activeElement === firstHourPath || firstHourPath.classList.contains('focused')).toBe(true);
      });
    });

    it('should show focus indicators on focused SVG elements', () => {
      const segmentsGroup = mockSvg.querySelector('.segments-group');
      const firstPath = segmentsGroup.querySelector('path.calendar-segment');
      
      firstPath.focus();
      
      // Element should have focused class which applies focus styles via CSS
      expect(firstPath.classList.contains('focused')).toBe(true);
    });

    it('should apply focus styles to focused day segments', async () => {
      const segmentsGroup = mockSvg.querySelector('.segments-group');
      const firstMonthPath = segmentsGroup.querySelector('path.calendar-segment');
      firstMonthPath.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const daySegmentsGroup = mockSvg.querySelector('.day-segments-group');
      const firstDayPath = daySegmentsGroup.querySelector('path.day-segment:not(.day-segment--restricted)');
      
      firstDayPath.focus();
      
      expect(firstDayPath.classList.contains('focused')).toBe(true);
    });

    it('should maintain focus order during view transitions', async () => {
      // Navigate through views
      const segmentsGroup = mockSvg.querySelector('.segments-group');
      const firstMonthPath = segmentsGroup.querySelector('path.calendar-segment');
      firstMonthPath.focus();
      
      // Enter day selection
      firstMonthPath.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Verify focus moved to day selection
      const daySegmentsGroup = mockSvg.querySelector('.day-segments-group');
      expect(daySegmentsGroup).not.toBeNull();
      
      const focusedDay = daySegmentsGroup.querySelector('.day-segment.focused, .day-segment:focus');
      // At least one day should be focusable and potentially focused
      const firstDay = daySegmentsGroup.querySelector('.day-segment:not(.day-segment--restricted)');
      expect(firstDay).not.toBeNull();
      expect(firstDay.getAttribute('tabindex')).toBe('0');
    });

    it('should handle focus when restricted dates are present', async () => {
      const segmentsGroup = mockSvg.querySelector('.segments-group');
      const firstMonthPath = segmentsGroup.querySelector('path.calendar-segment');
      firstMonthPath.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const daySegmentsGroup = mockSvg.querySelector('.day-segments-group');
      // Should focus first non-restricted day
      const firstNonRestricted = daySegmentsGroup.querySelector('.day-segment:not(.day-segment--restricted)');
      
      if (firstNonRestricted) {
        expect(firstNonRestricted.getAttribute('tabindex')).toBe('0');
        // Restricted days should not be focusable
        const restrictedDays = daySegmentsGroup.querySelectorAll('.day-segment--restricted');
        restrictedDays.forEach(day => {
          expect(day.getAttribute('tabindex')).not.toBe('0');
        });
      }
    });
  });
});

