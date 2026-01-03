/*****************************/
/* Date utility functions */
/*****************************/

// Determines if a year is a leap year
// Leap year rules:
// - Divisible by 4, except
// - Divisible by 100, except
// - Divisible by 400
export function isLeapYear(year) {
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

// Gets the number of days in a month (0-indexed: 0=January, 11=December)
export function getDaysInMonth(monthIndex, year) {
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    
    // Adjust February for leap years
    if (monthIndex === 1 && isLeapYear(year)) {
        return 29;
    }
    
    return daysInMonth[monthIndex];
}

