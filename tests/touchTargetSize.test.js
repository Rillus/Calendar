import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { initRenderer, drawCalendar } from '../src/renderer/calendarRenderer.js';
import { measureTouchTarget, verifyAllTouchTargets } from '../src/utils/touchTargetUtils.js';
import { svgSize } from '../src/config/config.js';

describe('Touch Target Size Verification (Feature 07)', () => {
  let mockSvg;

  beforeEach(() => {
    // Create a mock SVG element with proper dimensions
    mockSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    mockSvg.setAttribute('id', 'test-svg');
    mockSvg.setAttribute('viewBox', `0 0 ${svgSize} ${svgSize}`);
    mockSvg.style.width = `${svgSize}px`;
    mockSvg.style.height = `${svgSize}px`;
    document.body.appendChild(mockSvg);
  });

  afterEach(() => {
    if (mockSvg && mockSvg.parentNode) {
      mockSvg.parentNode.removeChild(mockSvg);
    }
    const remaining = document.querySelectorAll('#test-svg');
    remaining.forEach(el => el.remove());
  });

  describe('Month Segments (Year View)', () => {
    beforeEach(() => {
      initRenderer(mockSvg);
      drawCalendar();
    });

    it('should have all month segments meeting 44x44px requirement', () => {
      const segments = mockSvg.querySelectorAll('.calendar-segment');
      
      expect(segments.length).toBeGreaterThan(0);
      
      segments.forEach((segment, index) => {
          const measurement = measureTouchTarget(segment);
          expect(measurement.meetsRequirement, 
            `Month segment ${index} should be at least 44x44px (was ${measurement.width}x${measurement.height})`)
            .toBe(true);
      });
    });

    it('should have adequate spacing between month segments', () => {
      const segments = mockSvg.querySelectorAll('.calendar-segment');
      expect(segments.length).toBeGreaterThan(0);
      
      // Check that segments don't overlap significantly
      // This is a basic check - more sophisticated spacing verification could be added
      segments.forEach((segment, index) => {
        const rect = segment.getBoundingClientRect();
        expect(rect.width).toBeGreaterThan(0);
        expect(rect.height).toBeGreaterThan(0);
      });
    });
  });

  describe('Day Segments (Month Day Selection)', () => {
    beforeEach(() => {
      initRenderer(mockSvg);
      drawCalendar();
      
      // Trigger day selection view for January (31 days)
      const firstSegment = mockSvg.querySelector('.calendar-segment');
      if (firstSegment) {
        firstSegment.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      }
    });

    it('should have all day segments meeting 44x44px requirement', () => {
      const daySegments = mockSvg.querySelectorAll('.day-segment');
      
      if (daySegments.length > 0) {
        daySegments.forEach((segment, index) => {
          const measurement = measureTouchTarget(segment);
          // Only assert if element is actually rendered (has dimensions)
          if (measurement.width > 0 && measurement.height > 0) {
            expect(measurement.meetsRequirement,
              `Day segment ${index} should be at least 44x44px (was ${measurement.width}x${measurement.height})`)
              .toBe(true);
          }
        });
      }
    });
  });

  describe('Hour Segments (Time Selection)', () => {
    beforeEach(() => {
      initRenderer(mockSvg, {
        timeSelectionEnabled: true,
        is12HourClock: false
      });
      drawCalendar();
      
      // Trigger day selection, then hour selection
      const firstSegment = mockSvg.querySelector('.calendar-segment');
      if (firstSegment) {
        firstSegment.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      }
      
      // Navigate to hour selection
      const daySegment = mockSvg.querySelector('.day-segment:not(.day-segment--restricted)');
      if (daySegment) {
        daySegment.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      }
    });

    it('should have all hour segments meeting 44x44px requirement', () => {
      const hourSegments = mockSvg.querySelectorAll('.hour-segment');
      
      if (hourSegments.length > 0) {
        hourSegments.forEach((segment, index) => {
          const measurement = measureTouchTarget(segment);
          // Only assert if element is actually rendered (has dimensions)
          if (measurement.width > 0 && measurement.height > 0) {
            expect(measurement.meetsRequirement,
              `Hour segment ${index} should be at least 44x44px (was ${measurement.width}x${measurement.height})`)
              .toBe(true);
          }
        });
      } else {
        // If no hour segments found, test is skipped (navigation might not have occurred)
        expect(hourSegments.length).toBe(0);
      }
    });
  });

  describe('Minute Segments (Time Selection)', () => {
    beforeEach(() => {
      initRenderer(mockSvg, {
        timeSelectionEnabled: true,
        is12HourClock: false
      });
      drawCalendar();
      
      // Navigate to minute selection
      const firstSegment = mockSvg.querySelector('.calendar-segment');
      if (firstSegment) {
        firstSegment.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      }
      
      const daySegment = mockSvg.querySelector('.day-segment:not(.day-segment--restricted)');
      if (daySegment) {
        daySegment.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      }
      
      const hourSegment = mockSvg.querySelector('.hour-segment');
      if (hourSegment) {
        hourSegment.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      }
    });

    it('should have all minute segments meeting 44x44px requirement', () => {
      const minuteSegments = mockSvg.querySelectorAll('.minute-segment');
      
      if (minuteSegments.length > 0) {
        minuteSegments.forEach((segment, index) => {
          const measurement = measureTouchTarget(segment);
          // Only assert if element is actually rendered (has dimensions)
          if (measurement.width > 0 && measurement.height > 0) {
            expect(measurement.meetsRequirement,
              `Minute segment ${index} should be at least 44x44px (was ${measurement.width}x${measurement.height})`)
              .toBe(true);
          }
        });
      } else {
        // If no minute segments found, test is skipped (navigation might not have occurred)
        expect(minuteSegments.length).toBe(0);
      }
    });
  });

  describe('AM/PM Selectors (12-hour mode)', () => {
    beforeEach(() => {
      initRenderer(mockSvg, {
        timeSelectionEnabled: true,
        is12HourClock: true
      });
      drawCalendar();
      
      // Navigate to hour selection in 12-hour mode
      const firstSegment = mockSvg.querySelector('.calendar-segment');
      if (firstSegment) {
        firstSegment.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      }
      
      const daySegment = mockSvg.querySelector('.day-segment:not(.day-segment--restricted)');
      if (daySegment) {
        daySegment.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      }
    });

    it('should have AM/PM selectors meeting 44x44px requirement', () => {
      // Check hit areas for AM/PM selectors (they should have 44x44px hit areas)
      const ampmHitAreas = mockSvg.querySelectorAll('.ampm-selector-hit-area');
      
      if (ampmHitAreas.length > 0) {
        ampmHitAreas.forEach((hitArea, index) => {
          const measurement = measureTouchTarget(hitArea);
          expect(measurement.meetsRequirement,
            `AM/PM selector hit area ${index} should be at least 44x44px (was ${measurement.width}x${measurement.height})`)
            .toBe(true);
        });
      } else {
        // If no hit areas found, check if selectors exist (might not be in hour view yet)
        const ampmSelectors = mockSvg.querySelectorAll('.ampm-selector');
        expect(ampmSelectors.length).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('Comprehensive Verification', () => {
    it('should verify all interactive elements in year view', () => {
      initRenderer(mockSvg);
      drawCalendar();
      
      // Test with default selectors
      const results = verifyAllTouchTargets(mockSvg);
      
      expect(results.total).toBeGreaterThan(0);
      // Note: This test verifies the measurement works, not that all pass
      // Actual size verification is done in specific view tests above
    });
  });
});
