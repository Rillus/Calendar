/*******************************/
/* Month view utility functions */
/*******************************/

const pad2 = (n) => String(n).padStart(2, '0');

const toIsoDate = (date) => {
  const year = date.getFullYear();
  const month = pad2(date.getMonth() + 1);
  const day = pad2(date.getDate());
  return `${year}-${month}-${day}`;
};

const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

const getWeekdayLabels = (weekStartsOn, locale) => {
  // Pick a known Monday and build sequential labels from there.
  const monday = new Date(2021, 10, 1); // 1 Nov 2021 was a Monday (local time)
  const formatter = new Intl.DateTimeFormat(locale, { weekday: 'short' });

  const mondayBased = Array.from({ length: 7 }, (_, i) => formatter.format(addDays(monday, i)));
  const shift = ((weekStartsOn ?? 1) + 6) % 7; // 0(Sun)->6, 1(Mon)->0 ... relative to Monday-based array
  return mondayBased.slice(shift).concat(mondayBased.slice(0, shift));
};

/**
 * Builds a 6x7 month grid model.
 *
 * @param {Date} selectedDate - Date that drives which month is shown.
 * @param {object} [options]
 * @param {number} [options.weekStartsOn=1] - 0=Sunday, 1=Monday.
 * @param {Date} [options.today=new Date()] - Overridable for testing.
 * @param {string} [options.locale='en-GB']
 */
export function buildMonthViewModel(selectedDate, options = {}) {
  const {
    weekStartsOn = 1,
    today = new Date(),
    locale = 'en-GB'
  } = options;

  const selected = startOfDay(selectedDate);
  const todayDay = startOfDay(today);

  const firstOfMonth = new Date(selected.getFullYear(), selected.getMonth(), 1);
  const monthIndex = firstOfMonth.getMonth();
  const year = firstOfMonth.getFullYear();

  const monthLabel = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(firstOfMonth);
  const weekdayLabels = getWeekdayLabels(weekStartsOn, locale);

  const firstDayOfWeekIndex = firstOfMonth.getDay(); // 0=Sun .. 6=Sat
  const offset = (firstDayOfWeekIndex - weekStartsOn + 7) % 7;
  const gridStartDate = addDays(firstOfMonth, -offset);

  const days = Array.from({ length: 42 }, (_, i) => {
    const date = addDays(gridStartDate, i);
    const inMonth = date.getMonth() === monthIndex && date.getFullYear() === year;
    return {
      date,
      isoDate: toIsoDate(date),
      dayNumber: date.getDate(),
      inMonth,
      isToday: isSameDay(date, todayDay),
      isSelected: isSameDay(date, selected)
    };
  });

  const weeks = Array.from({ length: 6 }, (_, w) => days.slice(w * 7, w * 7 + 7));

  return {
    monthLabel,
    weekdayLabels,
    weeks
  };
}

