import { describe, it, expect } from 'vitest';
import { buildMonthViewModel } from '../src/utils/monthViewUtils.js';

describe('monthViewUtils', () => {
  it('should build a 6x7 grid starting on Monday (en-GB)', () => {
    const selectedDate = new Date(2026, 0, 15); // 15 Jan 2026
    const today = new Date(2026, 0, 20);

    const model = buildMonthViewModel(selectedDate, { weekStartsOn: 1, today, locale: 'en-GB' });

    expect(model.monthLabel).toBe('January 2026');
    expect(model.weekdayLabels).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
    expect(model.weeks.length).toBe(6);
    expect(model.weeks.every((w) => w.length === 7)).toBe(true);

    const firstCell = model.weeks[0][0];
    expect(firstCell.isoDate).toBe('2025-12-29');
    expect(firstCell.inMonth).toBe(false);

    const selectedCell = model.weeks.flat().find((d) => d.isSelected);
    expect(selectedCell.isoDate).toBe('2026-01-15');
    expect(selectedCell.inMonth).toBe(true);

    const todayCell = model.weeks.flat().find((d) => d.isToday);
    expect(todayCell.isoDate).toBe('2026-01-20');
  });

  it('should handle leap years (February 2024 has 29 days)', () => {
    const selectedDate = new Date(2024, 1, 29); // 29 Feb 2024
    const today = new Date(2024, 1, 1);

    const model = buildMonthViewModel(selectedDate, { weekStartsOn: 1, today, locale: 'en-GB' });
    const inMonthDays = model.weeks.flat().filter((d) => d.inMonth);

    expect(model.monthLabel).toBe('February 2024');
    expect(inMonthDays.length).toBe(29);
    expect(inMonthDays.some((d) => d.isoDate === '2024-02-29')).toBe(true);
  });
});

