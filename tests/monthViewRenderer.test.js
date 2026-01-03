import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderMonthView } from '../src/renderer/monthViewRenderer.js';

describe('monthViewRenderer', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    container.setAttribute('id', 'month-view-container');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container?.remove();
  });

  it('should render a heading and 42 day cells', () => {
    const selectedDate = new Date(2026, 0, 15);
    const today = new Date(2026, 0, 20);

    renderMonthView(container, selectedDate, { today, weekStartsOn: 1, locale: 'en-GB' });

    const heading = container.querySelector('.month-view__heading');
    expect(heading).not.toBeNull();
    expect(heading.textContent).toBe('January 2026');

    const dayCells = container.querySelectorAll('.month-view__day');
    expect(dayCells.length).toBe(42);

    const selected = container.querySelector('.month-view__day--selected');
    expect(selected).not.toBeNull();
    expect(selected.getAttribute('data-iso-date')).toBe('2026-01-15');

    const todayEl = container.querySelector('.month-view__day--today');
    expect(todayEl).not.toBeNull();
    expect(todayEl.getAttribute('data-iso-date')).toBe('2026-01-20');
  });
});

