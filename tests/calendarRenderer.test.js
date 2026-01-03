import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { initRenderer, drawCalendar, drawCircle, writeSegmentName } from '../src/renderer/calendarRenderer.js';
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
      
      expect(circle.getAttribute('cx')).toBe(String(svgSize / 2));
      expect(circle.getAttribute('cy')).toBe(String(svgSize / 2));
      expect(circle.getAttribute('r')).toBe(String(svgSize / 3));
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
      
      expect(text.style.fontSize).toBe(`${svgSize / 5}px`);
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
});

