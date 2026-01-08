/*****************************/
/* Date utility functions */
/*****************************/

import { monthDays } from '../config/config.js';

// Determines if a year is a leap year
// Leap year rules:
// - Divisible by 4, except
// - Divisible by 100, except
// - Divisible by 400
export function isLeapYear(year) {
    return (year % 400 === 0) || (year % 4 === 0 && year % 100 !== 0);
}

// Gets the number of days in a month (0-indexed: 0=January, 11=December)
export function getDaysInMonth(monthIndex, year) {
    // Adjust February for leap years
    if (monthIndex === 1 && isLeapYear(year)) {
        return 29;
    }
    
    return monthDays[monthIndex];
}


// Formats a date in a readable format (e.g., "15 January 2024")
// Defaults to British English format (en-GB)
export function formatDate(date, options = {}) {
    const { locale = 'en-GB' } = options;
    return new Intl.DateTimeFormat(locale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(date);
}

// Formats time in 12-hour or 24-hour format
// Defaults to 12-hour format
export function formatTime(date, options = {}) {
    const { use12Hour = true } = options;
    
    const hours = date.getHours();
    const minutes = date.getMinutes();
    
    if (use12Hour) {
        // 12-hour format: "2:30 PM", "12:00 AM", etc.
        const hour12 = hours === 0 ? 12 : (hours > 12 ? hours - 12 : hours);
        const meridiem = hours >= 12 ? 'PM' : 'AM';
        return `${hour12}:${String(minutes).padStart(2, '0')} ${meridiem}`;
    } else {
        // 24-hour format: "14:30", "00:00", etc.
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }
}

// Formats a date with time: "15 January 2024, 2:30 PM"
export function formatDateWithTime(date, options = {}) {
    const { use12Hour = true, locale = 'en-GB' } = options;
    const dateStr = formatDate(date, { locale });
    const timeStr = formatTime(date, { use12Hour });
    return `${dateStr}, ${timeStr}`;
}