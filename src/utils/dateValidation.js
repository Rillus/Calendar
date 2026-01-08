/*****************************/
/* Date Validation Utilities */
/*****************************/

/**
 * Checks if two dates are on the same day (ignoring time)
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @returns {boolean} True if dates are on the same day
 */
function isSameDay(date1, date2) {
  if (!(date1 instanceof Date) || !(date2 instanceof Date)) {
    return false;
  }
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}

/**
 * Checks if a date is within a date range (inclusive)
 * @param {Date} date - The date to check
 * @param {Object} range - Date range with start and end
 * @param {Date} range.start - Start date (inclusive)
 * @param {Date} range.end - End date (inclusive)
 * @returns {boolean} True if date is within range
 */
function isInRange(date, range) {
  if (!(date instanceof Date) || !range || !range.start || !range.end) {
    return false;
  }
  
  const dateToCheck = new Date(date);
  dateToCheck.setHours(0, 0, 0, 0);
  const startDate = new Date(range.start);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(range.end);
  endDate.setHours(0, 0, 0, 0);
  
  return dateToCheck >= startDate && dateToCheck <= endDate;
}

/**
 * Validates a date against specified restrictions
 * @param {Date} date - The date to validate
 * @param {Object} options - Validation options
 * @param {boolean} options.allowPast - Whether past dates are allowed (default: true)
 * @param {Date} options.minDate - Minimum allowed date
 * @param {Date} options.maxDate - Maximum allowed date
 * @param {Date[]} options.disabledDates - Array of specific dates to disable
 * @param {Array<{start: Date, end: Date}>} options.disabledRanges - Array of date ranges to disable
 * @returns {{valid: boolean, error?: string}} Validation result
 */
export function validateDate(date, options = {}) {
  const { minDate, maxDate, allowPast = true, disabledDates = [], disabledRanges = [] } = options;

  // Check if date is valid
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return { valid: false, error: 'Invalid date' };
  }

  // Check if past dates are allowed
  if (!allowPast) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateToCheck = new Date(date);
    dateToCheck.setHours(0, 0, 0, 0);
    
    if (dateToCheck < today) {
      return { valid: false, error: 'Past dates are not allowed' };
    }
  }

  // Check minimum date
  if (minDate) {
    const dateToCheck = new Date(date);
    dateToCheck.setHours(0, 0, 0, 0);
    const minDateToCheck = new Date(minDate);
    minDateToCheck.setHours(0, 0, 0, 0);
    
    if (dateToCheck < minDateToCheck) {
      return { 
        valid: false, 
        error: `Date must be after ${formatDateForError(minDate)}` 
      };
    }
  }

  // Check maximum date
  if (maxDate) {
    const dateToCheck = new Date(date);
    dateToCheck.setHours(0, 0, 0, 0);
    const maxDateToCheck = new Date(maxDate);
    maxDateToCheck.setHours(0, 0, 0, 0);
    
    if (dateToCheck > maxDateToCheck) {
      return { 
        valid: false, 
        error: `Date must be before ${formatDateForError(maxDate)}` 
      };
    }
  }

  // Check disabled dates
  if (Array.isArray(disabledDates) && disabledDates.length > 0) {
    if (disabledDates.some(disabledDate => isSameDay(date, disabledDate))) {
      return {
        valid: false,
        error: 'This date is not available'
      };
    }
  }

  // Check disabled ranges
  if (Array.isArray(disabledRanges) && disabledRanges.length > 0) {
    if (disabledRanges.some(range => isInRange(date, range))) {
      return {
        valid: false,
        error: 'This date is not available'
      };
    }
  }

  return { valid: true };
}

/**
 * Validates time values
 * @param {number} hour - Hour value (0-23 for 24-hour, 1-12 for 12-hour)
 * @param {number} minute - Minute value (0-59)
 * @param {Object} options - Validation options
 * @param {boolean} options.use12Hour - Whether using 12-hour format
 * @param {string} options.meridiem - 'AM' or 'PM' (required for 12-hour mode)
 * @returns {{valid: boolean, error?: string}} Validation result
 */
export function validateTime(hour, minute, options = {}) {
  const { use12Hour = false, meridiem } = options;

  // Validate hour
  if (use12Hour) {
    if (hour < 1 || hour > 12) {
      return { valid: false, error: 'Hour must be between 1 and 12' };
    }
    if (!meridiem) {
      return { valid: false, error: 'Meridiem (AM/PM) is required for 12-hour format' };
    }
    if (meridiem !== 'AM' && meridiem !== 'PM') {
      return { valid: false, error: 'Meridiem must be AM or PM' };
    }
  } else {
    if (hour < 0 || hour > 23) {
      return { valid: false, error: 'Hour must be between 0 and 23' };
    }
  }

  // Validate minute
  if (minute < 0 || minute > 59) {
    return { valid: false, error: 'Minute must be between 0 and 59' };
  }

  return { valid: true };
}

/**
 * Checks if a date is restricted based on validation options
 * @param {Date} date - The date to check
 * @param {Object} options - Validation options (same as validateDate)
 * @param {boolean} options.allowPast - Whether past dates are allowed
 * @param {Date} options.minDate - Minimum allowed date
 * @param {Date} options.maxDate - Maximum allowed date
 * @param {Date[]} options.disabledDates - Array of specific dates to disable
 * @param {Array<{start: Date, end: Date}>} options.disabledRanges - Array of date ranges to disable
 * @returns {boolean} True if date is restricted
 */
export function isDateRestricted(date, options = {}) {
  const validation = validateDate(date, options);
  return !validation.valid;
}

/**
 * Gets a human-readable reason why a date is restricted
 * @param {Date} date - The date to check
 * @param {Object} options - Validation options
 * @param {boolean} options.allowPast - Whether past dates are allowed
 * @param {Date} options.minDate - Minimum allowed date
 * @param {Date} options.maxDate - Maximum allowed date
 * @param {Date[]} options.disabledDates - Array of specific dates to disable
 * @param {Array<{start: Date, end: Date}>} options.disabledRanges - Array of date ranges to disable
 * @returns {string|undefined} Reason string if restricted, undefined otherwise
 */
export function getRestrictionReason(date, options = {}) {
  const { minDate, maxDate, allowPast = true, disabledDates = [], disabledRanges = [] } = options;

  // Check if date is valid
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return 'Invalid date';
  }

  // Check past dates first (most common restriction)
  if (!allowPast) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateToCheck = new Date(date);
    dateToCheck.setHours(0, 0, 0, 0);
    
    if (dateToCheck < today) {
      return 'Past dates are not allowed';
    }
  }

  // Check minimum date
  if (minDate) {
    const dateToCheck = new Date(date);
    dateToCheck.setHours(0, 0, 0, 0);
    const minDateToCheck = new Date(minDate);
    minDateToCheck.setHours(0, 0, 0, 0);
    
    if (dateToCheck < minDateToCheck) {
      return `Date must be after ${formatDateForError(minDate)}`;
    }
  }

  // Check maximum date
  if (maxDate) {
    const dateToCheck = new Date(date);
    dateToCheck.setHours(0, 0, 0, 0);
    const maxDateToCheck = new Date(maxDate);
    maxDateToCheck.setHours(0, 0, 0, 0);
    
    if (dateToCheck > maxDateToCheck) {
      return `Date must be before ${formatDateForError(maxDate)}`;
    }
  }

  // Check disabled dates
  if (Array.isArray(disabledDates) && disabledDates.length > 0) {
    if (disabledDates.some(disabledDate => isSameDay(date, disabledDate))) {
      return 'This date is not available';
    }
  }

  // Check disabled ranges
  if (Array.isArray(disabledRanges) && disabledRanges.length > 0) {
    if (disabledRanges.some(range => isInRange(date, range))) {
      return 'This date is not available';
    }
  }

  return undefined;
}

/**
 * Formats a date for error messages
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string
 */
export function formatDateForError(date) {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return 'Invalid date';
  }

  const day = date.getDate();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
}

/**
 * Creates validation options with defaults
 * @param {Object} overrides - Option overrides
 * @param {boolean} overrides.allowPast - Whether past dates are allowed
 * @param {Date} overrides.minDate - Minimum allowed date
 * @param {Date} overrides.maxDate - Maximum allowed date
 * @param {Date[]} overrides.disabledDates - Array of specific dates to disable
 * @param {Array<{start: Date, end: Date}>} overrides.disabledRanges - Array of date ranges to disable
 * @param {boolean} overrides.use12Hour - Whether using 12-hour time format
 * @returns {Object} Validation options
 */
export function createValidationOptions(overrides = {}) {
  return {
    allowPast: true,
    minDate: undefined,
    maxDate: undefined,
    disabledDates: [],
    disabledRanges: [],
    use12Hour: false,
    ...overrides
  };
}
