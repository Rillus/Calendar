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

/**
 * Renders a regular calendar month view into a container element.
 *
 * @param {HTMLElement} container
 * @param {Date} selectedDate
 * @param {object} [options]
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
}

