import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createCalendarRenderer } from '../src/renderer/calendarRenderer.js';

describe('createCalendarRenderer', () => {
  let svgA;
  let svgB;

  beforeEach(() => {
    svgA = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgB = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    document.body.appendChild(svgA);
    document.body.appendChild(svgB);
  });

  afterEach(() => {
    svgA?.remove();
    svgB?.remove();
  });

  it('should isolate state per renderer instance', () => {
    const a = createCalendarRenderer(svgA);
    const b = createCalendarRenderer(svgB);

    a.drawCalendar();
    b.drawCalendar();

    a.selectDate(new Date(2026, 0, 10));

    expect(svgA.querySelector('.sun-icon')).not.toBeNull();
    expect(svgB.querySelector('.sun-icon')).toBeNull();
  });
});

