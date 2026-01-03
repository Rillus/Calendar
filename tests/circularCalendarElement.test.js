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

    const button = el.shadowRoot?.querySelector?.('[data-iso-date="2026-01-10"]');
    expect(button).not.toBeNull();

    button.click();

    expect(el.value).toBe('2026-01-10');
    expect(seen).toEqual(['input', 'change']);
  });
});

