/******************************/
/* Voice Navigation Utilities */
/******************************/

/**
 * Sets up voice navigation using Web Speech API
 * @param {Object} callbacks - Object containing callback functions:
 *   - onSelectDate: (date: Date) => void
 *   - onSelectTime: (time: {hour: number, minute: number}) => void
 *   - onNextMonth: () => void
 *   - onPreviousMonth: () => void
 *   - onGoToToday: () => void
 * @param {number} currentYear - Current year for date parsing
 * @returns {SpeechRecognition|null} Recognition instance or null if not supported
 */
export function setupVoiceNavigation(callbacks, currentYear = new Date().getFullYear()) {
  // Check for Web Speech API support
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    return null; // Not supported
  }
  
  // Use standard API if available, otherwise fall back to webkit prefix
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new Recognition();
  
  // Configure recognition
  recognition.continuous = false;
  recognition.interimResults = false;
  
  // Handle recognition results
  // Note: currentYear parameter is used as initial value, but callbacks should handle updates
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    // Get current year from callbacks if available, otherwise use provided year
    const yearToUse = callbacks.getCurrentYear ? callbacks.getCurrentYear() : currentYear;
    parseVoiceCommand(transcript, callbacks, yearToUse);
  };
  
  // Handle errors
  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    if (callbacks.onError) {
      callbacks.onError(event.error);
    }
  };
  
  // Handle end of recognition
  recognition.onend = () => {
    if (callbacks.onEnd) {
      callbacks.onEnd();
    }
  };
  
  return recognition;
}

/**
 * Parses a voice command and calls appropriate callbacks
 * @param {string} command - The voice command transcript
 * @param {Object} callbacks - Object containing callback functions
 * @param {number} currentYear - Current year for date parsing
 */
export function parseVoiceCommand(command, callbacks, currentYear = new Date().getFullYear()) {
  const normalisedCommand = command.trim().toLowerCase();
  
  // Try to parse as date command first
  const dateResult = parseDateCommand(command, currentYear);
  if (dateResult && callbacks.onSelectDate) {
    const date = new Date(dateResult.year, dateResult.month, dateResult.day);
    callbacks.onSelectDate(date);
    return;
  }
  
  // Try to parse as time command
  const timeResult = parseTimeCommand(command);
  if (timeResult && callbacks.onSelectTime) {
    callbacks.onSelectTime(timeResult);
    return;
  }
  
  // Try to parse as navigation command
  const navResult = parseNavigationCommand(command);
  if (navResult) {
    switch (navResult.action) {
      case 'nextMonth':
        if (callbacks.onNextMonth) {
          callbacks.onNextMonth();
        }
        break;
      case 'previousMonth':
        if (callbacks.onPreviousMonth) {
          callbacks.onPreviousMonth();
        }
        break;
      case 'today':
        if (callbacks.onGoToToday) {
          callbacks.onGoToToday();
        }
        break;
    }
    return;
  }
  
  // Command not recognised - could log or call error callback
  if (callbacks.onUnrecognised) {
    callbacks.onUnrecognised(command);
  }
}

/**
 * Parses a month name (full or abbreviated) to month index (0-11)
 * @param {string} monthName - Month name (e.g., "January", "Jan")
 * @returns {number|null} Month index (0-11) or null if invalid
 */
export function parseMonthName(monthName) {
  if (!monthName) return null;
  
  const normalised = monthName.trim().toLowerCase();
  
  // Full month names
  const fullMonths = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ];
  
  // Abbreviated month names
  const abbreviatedMonths = [
    'jan', 'feb', 'mar', 'apr', 'may', 'jun',
    'jul', 'aug', 'sep', 'oct', 'nov', 'dec'
  ];
  
  // Check full names first
  const fullIndex = fullMonths.indexOf(normalised);
  if (fullIndex !== -1) {
    return fullIndex;
  }
  
  // Check abbreviated names
  const abbrevIndex = abbreviatedMonths.indexOf(normalised);
  if (abbrevIndex !== -1) {
    return abbrevIndex;
  }
  
  return null;
}

/**
 * Parses a date command (e.g., "Select January 15th", "Select Jan 15 2025")
 * @param {string} command - The voice command
 * @param {number} currentYear - Current year for date parsing
 * @returns {Object|null} Object with month, day, year or null if invalid
 */
export function parseDateCommand(command, currentYear = new Date().getFullYear()) {
  if (!command) return null;
  
  // Normalise the command
  const normalised = command.trim().toLowerCase();
  
  // Pattern: "select [month] [day] [year]?"
  // Handles variations like:
  // - "select january 15th"
  // - "select jan 15"
  // - "select january 15th 2025"
  // - "select jan 15 2025"
  
  // Match "select" followed by month name and day number
  // This regex captures: select, month name, day number, optional year
  const datePattern = /select\s+(\w+)\s+(\d+)(?:st|nd|rd|th)?(?:\s+(\d{4}))?/i;
  const match = normalised.match(datePattern);
  
  if (!match) {
    return null;
  }
  
  const monthName = match[1];
  const day = parseInt(match[2], 10);
  const year = match[3] ? parseInt(match[3], 10) : currentYear;
  
  // Validate day
  if (day < 1 || day > 31) {
    return null;
  }
  
  // Parse month name to index
  const monthIndex = parseMonthName(monthName);
  if (monthIndex === null) {
    return null;
  }
  
  // Validate date (check if day is valid for the month and year)
  // Basic validation - could be enhanced
  const daysInMonth = getDaysInMonthForYear(monthIndex, year);
  if (day > daysInMonth) {
    return null;
  }
  
  return {
    month: monthIndex,
    day: day,
    year: year
  };
}

/**
 * Parses a time command (e.g., "Select 2:30 PM", "Select 14:30")
 * @param {string} command - The voice command
 * @returns {Object|null} Object with hour and minute (24-hour format) or null if invalid
 */
export function parseTimeCommand(command) {
  if (!command) return null;
  
  const normalised = command.trim().toLowerCase();
  
  // Pattern: "select [hour]:[minute] [am|pm]?" or "select [hour] [minute] [am|pm]?"
  // Handles variations like:
  // - "select 2:30 pm"
  // - "select 2 30 pm"
  // - "select 14:30"
  // - "select 14 30"
  
  // Match 12-hour format with AM/PM
  const twelveHourPattern = /select\s+(\d{1,2})(?::|\s+)(\d{2})\s+(am|pm)/i;
  const twelveHourMatch = normalised.match(twelveHourPattern);
  
  if (twelveHourMatch) {
    let hour = parseInt(twelveHourMatch[1], 10);
    const minute = parseInt(twelveHourMatch[2], 10);
    const meridiem = twelveHourMatch[3].toLowerCase();
    
    // Validate hour and minute
    if (hour < 1 || hour > 12 || minute < 0 || minute > 59) {
      return null;
    }
    
    // Convert to 24-hour format
    if (meridiem === 'pm') {
      if (hour !== 12) {
        hour += 12;
      }
    } else { // am
      if (hour === 12) {
        hour = 0;
      }
    }
    
    return { hour, minute };
  }
  
  // Match 24-hour format
  const twentyFourHourPattern = /select\s+(\d{1,2})(?::|\s+)(\d{2})/i;
  const twentyFourHourMatch = normalised.match(twentyFourHourPattern);
  
  if (twentyFourHourMatch) {
    const hour = parseInt(twentyFourHourMatch[1], 10);
    const minute = parseInt(twentyFourHourMatch[2], 10);
    
    // Validate hour and minute
    if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
      return null;
    }
    
    return { hour, minute };
  }
  
  return null;
}

/**
 * Parses a navigation command (e.g., "Go to next month", "Today")
 * @param {string} command - The voice command
 * @returns {Object|null} Object with action property or null if invalid
 */
export function parseNavigationCommand(command) {
  if (!command) return null;
  
  const normalised = command.trim().toLowerCase();
  
  // Next month patterns
  if (normalised.match(/go\s+to\s+next\s+month/i) || normalised.match(/next\s+month/i)) {
    return { action: 'nextMonth' };
  }
  
  // Previous month patterns
  if (normalised.match(/go\s+to\s+previous\s+month/i) || normalised.match(/previous\s+month/i) || normalised.match(/go\s+to\s+last\s+month/i)) {
    return { action: 'previousMonth' };
  }
  
  // Today patterns
  if (normalised.match(/go\s+to\s+today/i) || normalised.match(/^today$/i)) {
    return { action: 'today' };
  }
  
  return null;
}

/**
 * Helper function to get days in a month for a given year
 * @param {number} monthIndex - Month index (0-11)
 * @param {number} year - Year
 * @returns {number} Number of days in the month
 */
function getDaysInMonthForYear(monthIndex, year) {
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  
  // Adjust February for leap years
  if (monthIndex === 1 && isLeapYear(year)) {
    return 29;
  }
  
  return daysInMonth[monthIndex];
}

/**
 * Helper function to check if a year is a leap year
 * @param {number} year - Year to check
 * @returns {boolean} True if leap year
 */
function isLeapYear(year) {
  if (year % 400 === 0) {
    return true;
  }
  if (year % 100 === 0) {
    return false;
  }
  if (year % 4 === 0) {
    return true;
  }
  return false;
}
