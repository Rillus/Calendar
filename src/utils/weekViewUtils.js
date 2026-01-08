/*****************************/
/* Week View Utility Functions */
/*****************************/

/**
 * Gets the start date of the week (Monday) for a given date
 * Weeks start on Monday (ISO 8601 standard, en-GB convention)
 * @param {Date} date - Any date in the week
 * @returns {Date} Monday of that week
 */
export function getWeekStartDate(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  
  // Get day of week (0=Sunday, 1=Monday, ..., 6=Saturday)
  const dayOfWeek = d.getDay();
  
  // Calculate days to subtract to get to Monday
  // If Sunday (0), subtract 6 days to get previous Monday
  // Otherwise, subtract (dayOfWeek - 1) days
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  
  d.setDate(d.getDate() - daysToSubtract);
  return d;
}

/**
 * Gets an array of 7 dates representing the week starting from weekStartDate
 * @param {Date} weekStartDate - Monday of the week
 * @returns {Date[]} Array of 7 dates (Monday through Sunday)
 */
export function getWeekDates(weekStartDate) {
  const dates = [];
  const start = new Date(weekStartDate);
  start.setHours(0, 0, 0, 0);
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    dates.push(date);
  }
  
  return dates;
}
