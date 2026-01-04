import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { defineCircularCalendarElement } from '../src/web-components/circularCalendarElement.js';

describe('circular-calendar web component', () => {
  beforeEach(() => {
    defineCircularCalendarElement();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should expose value and submit it via FormData', () => {
    const form = document.createElement('form');
    const el = document.createElement('circular-calendar');
    el.setAttribute('name', 'selectedDate');
    el.setAttribute('value', '2026-01-15');

    form.appendChild(el);
    document.body.appendChild(form);

    expect(el.value).toBe('2026-01-15');

    const fd = new FormData(form);
    expect(fd.get('selectedDate')).toBe('2026-01-15');
  });

  it('should dispatch input and change when a date is selected', () => {
    const el = document.createElement('circular-calendar');
    el.setAttribute('value', '2026-01-15');
    document.body.appendChild(el);

    const seen = [];
    el.addEventListener('input', () => seen.push('input'));
    el.addEventListener('change', () => seen.push('change'));

    const input = el.shadowRoot?.querySelector?.('input[type="date"]');
    expect(input).not.toBeNull();

    input.value = '2026-01-10';
    input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    input.dispatchEvent(new Event('change', { bubbles: true, composed: true }));

    expect(el.value).toBe('2026-01-10');
    expect(seen).toEqual(['input', 'change']);
  });

  it('should default to date-only value formatting when include-time is not set', () => {
    const el = document.createElement('circular-calendar');
    el.setAttribute('value', '2026-01-15T13:25');
    document.body.appendChild(el);

    // Date-only mode should ignore time in string inputs.
    expect(el.value).toBe('2026-01-15');
  });

  it('should submit a local datetime value when include-time is true', () => {
    const form = document.createElement('form');
    const el = document.createElement('circular-calendar');
    el.setAttribute('name', 'selectedDateTime');
    el.setAttribute('include-time', '');
    el.setAttribute('value', '2026-01-15T13:25');

    form.appendChild(el);
    document.body.appendChild(form);

    expect(el.value).toBe('2026-01-15T13:25');

    const fd = new FormData(form);
    expect(fd.get('selectedDateTime')).toBe('2026-01-15T13:25');
  });
});

