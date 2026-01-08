/*****************************/
/* Date Validation Utilities */
/*****************************/

/**
 * Validates a date against specified restrictions
 * @param {Date} date - The date to validate
 * @param {Object} options - Validation options
 * @param {boolean} options.allowPast - Whether past dates are allowed (default: true)
 * @param {Date} options.minDate - Minimum allowed date
 * @param {Date} options.maxDate - Maximum allowed date
 * @returns {{valid: boolean, error?: string}} Validation result
 */
export function validateDate(date, options = {}) {
  const { minDate, maxDate, allowPast = true } = options;

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
 * @returns {boolean} True if date is restricted
 */
export function isDateRestricted(date, options = {}) {
  const validation = validateDate(date, options);
  return !validation.valid;
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
 * @returns {Object} Validation options
 */
export function createValidationOptions(overrides = {}) {
  return {
    allowPast: true,
    minDate: undefined,
    maxDate: undefined,
    use12Hour: false,
    ...overrides
  };
}
