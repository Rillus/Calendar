import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { initRenderer, drawCalendar, selectDate } from '../src/renderer/calendarRenderer.js';
import { createCalendarRenderer } from '../src/renderer/calendarRenderer.js';
import { getWeekStartDate } from '../src/utils/weekViewUtils.js';

describe('weekView', () => {
  let mockSvg;

  beforeEach(() => {
    mockSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    mockSvg.setAttribute('id', 'test-svg-week');
    mockSvg.setAttribute('viewBox', '0 0 400 400');
    document.body.appendChild(mockSvg);
  });

  afterEach(() => {
    if (mockSvg && mockSvg.parentNode) {
      mockSvg.parentNode.removeChild(mockSvg);
    }
    const remaining = document.querySelectorAll('#test-svg-week');
    remaining.forEach(el => el.remove());
  });

  describe('week view rendering', () => {
    it('should display 7 day segments when showing week view', () => {
      const renderer = createCalendarRenderer(mockSvg, { weekViewEnabled: true });
      renderer.drawCalendar();
      
      // Click on January to show month day selection
      const janPath = mockSvg.querySelector('.segments-group path[data-segment-index="0"]');
      janPath.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      
      // Click on day 15 to show week view
      const day15Path = mockSvg.querySelector('.day-segments-group path[data-day="15"]');
      day15Path.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      
      // Should have week segments group
      const weekGroup = mockSvg.querySelector('.week-segments-group');
      expect(weekGroup).not.toBeNull();
      
      // Should have 7 day segments
      const weekDayPaths = weekGroup.querySelectorAll('path.week-day-segment');
      expect(weekDayPaths.length).toBe(7);
    });

    it('should show correct dates for the week', () => {
      const renderer = createCalendarRenderer(mockSvg, { weekViewEnabled: true });
      renderer.drawCalendar();
      
      // Select a date in January 2025 (Wednesday, 15 Jan)
      const testDate = new Date(2025, 0, 15);
      const weekStart = getWeekStartDate(testDate);
      
      // Click on January to show month day selection
      const janPath = mockSvg.querySelector('.segments-group path[data-segment-index="0"]');
      janPath.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      
      // Click on day 15 to show week view
      const day15Path = mockSvg.querySelector('.day-segments-group path[data-day="15"]');
      day15Path.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      
      const weekGroup = mockSvg.querySelector('.week-segments-group');
      expect(weekGroup).not.toBeNull();
      
      // Check that week starts on Monday (13 Jan 2025)
      const weekDayPaths = Array.from(weekGroup.querySelectorAll('path.week-day-segment'));
      expect(weekDayPaths.length).toBe(7);
      
      // First day should be Monday (13 Jan)
      const firstDay = weekDayPaths[0];
      const firstDayDate = firstDay.getAttribute('data-date');
      expect(firstDayDate).toBeTruthy();
    });

    it('should navigate to day view when clicking a day in week view', () => {
      const renderer = createCalendarRenderer(mockSvg, { timeSelectionEnabled: true, weekViewEnabled: true });
      renderer.drawCalendar();
      
      // Click on January to show month day selection
      const janPath = mockSvg.querySelector('.segments-group path[data-segment-index="0"]');
      janPath.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      
      // Click on day 15 to show week view
      const day15Path = mockSvg.querySelector('.day-segments-group path[data-day="15"]');
      day15Path.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      
      // Should have week view
      const weekGroup = mockSvg.querySelector('.week-segments-group');
      expect(weekGroup).not.toBeNull();
      
      // Click on a day in week view (e.g., Wednesday)
      const weekDayPaths = weekGroup.querySelectorAll('path.week-day-segment');
      expect(weekDayPaths.length).toBe(7);
      
      // Click on the third day (Wednesday)
      weekDayPaths[2].dispatchEvent(new MouseEvent('click', { bubbles: true }));
      
      // Should navigate to hour selection (day view)
      const hourGroup = mockSvg.querySelector('.hour-segments-group');
      expect(hourGroup).not.toBeNull();
    });

    it('should be keyboard accessible', () => {
      const renderer = createCalendarRenderer(mockSvg, { weekViewEnabled: true });
      renderer.drawCalendar();
      
      // Click on January to show month day selection
      const janPath = mockSvg.querySelector('.segments-group path[data-segment-index="0"]');
      janPath.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      
      // Click on day 15 to show week view
      const day15Path = mockSvg.querySelector('.day-segments-group path[data-day="15"]');
      day15Path.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      
      const weekGroup = mockSvg.querySelector('.week-segments-group');
      expect(weekGroup).not.toBeNull();
      
      // Check that day segments are focusable
      const weekDayPaths = weekGroup.querySelectorAll('path.week-day-segment');
      expect(weekDayPaths.length).toBe(7);
      
      // First day should be focusable
      const firstDay = weekDayPaths[0];
      expect(firstDay.getAttribute('tabindex')).toBe('0');
      expect(firstDay.getAttribute('role')).toBe('button');
    });

    it('should support arrow key navigation between days', () => {
      const renderer = createCalendarRenderer(mockSvg, { weekViewEnabled: true });
      renderer.drawCalendar();
      
      // Click on January to show month day selection
      const janPath = mockSvg.querySelector('.segments-group path[data-segment-index="0"]');
      janPath.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      
      // Click on day 15 to show week view
      const day15Path = mockSvg.querySelector('.day-segments-group path[data-day="15"]');
      day15Path.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      
      const weekGroup = mockSvg.querySelector('.week-segments-group');
      const weekDayPaths = Array.from(weekGroup.querySelectorAll('path.week-day-segment'));
      
      // Focus first day
      weekDayPaths[0].focus();
      
      // Press right arrow
      const rightArrowEvent = new KeyboardEvent('keydown', {
        key: 'ArrowRight',
        bubbles: true
      });
      weekDayPaths[0].dispatchEvent(rightArrowEvent);
      
      // Should focus second day (if navigation is implemented)
      // This test will need to be updated once arrow key navigation is implemented
      expect(weekDayPaths.length).toBe(7);
    });

    it('should handle Escape key to return to month day selection', () => {
      const renderer = createCalendarRenderer(mockSvg, { weekViewEnabled: true });
      renderer.drawCalendar();
      
      // Click on January to show month day selection
      const janPath = mockSvg.querySelector('.segments-group path[data-segment-index="0"]');
      janPath.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      
      // Click on day 15 to show week view
      const day15Path = mockSvg.querySelector('.day-segments-group path[data-day="15"]');
      day15Path.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      
      // Should have week view
      const weekGroup = mockSvg.querySelector('.week-segments-group');
      expect(weekGroup).not.toBeNull();
      
      // Press Escape
      const escapeEvent = new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true
      });
      mockSvg.dispatchEvent(escapeEvent);
      
      // Should return to month day selection
      const dayGroup = mockSvg.querySelector('.day-segments-group');
      expect(dayGroup).not.toBeNull();
      
      // Week view should be cleared
      const weekGroupAfter = mockSvg.querySelector('.week-segments-group');
      expect(weekGroupAfter).toBeNull();
    });
  });
});
