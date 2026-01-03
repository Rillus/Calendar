/****************************/
/* Month view DOM renderer */
/****************************/

import { buildMonthViewModel } from '../utils/monthViewUtils.js';

const escapeHtml = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

const parseIsoDate = (isoDate) => {
  // Expected: YYYY-MM-DD (local date)
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(isoDate));
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return null;
  return new Date(year, month - 1, day);
};

const clickHandlers = new WeakMap();

/**
 * Renders a regular calendar month view into a container element.
 *
 * @param {HTMLElement} container
 * @param {Date} selectedDate
 * @param {object} [options]
 * @param {(date: Date) => void} [options.onSelectDate]
 */
export function renderMonthView(container, selectedDate, options = {}) {
  if (!container) {
    throw new Error('Month view container not found');
  }

  const model = buildMonthViewModel(selectedDate, options);

  const weekdayHeader = model.weekdayLabels
    .map((label) => `<div class="month-view__weekday">${escapeHtml(label)}</div>`)
    .join('');

  const dayCells = model.weeks
    .flat()
    .map((day) => {
      const classes = ['month-view__day'];
      if (!day.inMonth) classes.push('month-view__day--outside');
      if (day.isToday) classes.push('month-view__day--today');
      if (day.isSelected) classes.push('month-view__day--selected');

      return `<button type="button" class="${classes.join(' ')}" data-iso-date="${escapeHtml(day.isoDate)}" aria-label="${escapeHtml(day.isoDate)}">${day.dayNumber}</button>`;
    })
    .join('');

  container.innerHTML = `
    <section class="month-view" aria-label="Month view">
      <div class="month-view__heading">${escapeHtml(model.monthLabel)}</div>
      <div class="month-view__grid" role="grid">
        ${weekdayHeader}
        ${dayCells}
      </div>
    </section>
  `.trim();

  // Keep a single click handler per container (re-render replaces innerHTML).
  const previousHandler = clickHandlers.get(container);
  if (previousHandler) {
    container.removeEventListener('click', previousHandler);
    clickHandlers.delete(container);
  }

  if (typeof options.onSelectDate === 'function') {
    const handler = (e) => {
      const target = e.target;
      if (!(target instanceof HTMLElement)) return;
      const button = target.closest?.('button[data-iso-date]');
      if (!button) return;

      const isoDate = button.getAttribute('data-iso-date');
      const date = parseIsoDate(isoDate);
      if (!date) return;

      options.onSelectDate(date);
    };

    container.addEventListener('click', handler);
    clickHandlers.set(container, handler);
  }
}

