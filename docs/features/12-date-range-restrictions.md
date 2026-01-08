# Feature 12: Date Range Restrictions

**Priority**: 🟡 High  
**Status**: Not Implemented  
**Feature ID**: F12  
**Category**: User Experience / Ticketlab Integration

---

## Overview

Implement date range restrictions to disable unavailable dates for ticket booking. This is critical for Ticketlab integration where certain dates may be sold out, unavailable, or outside booking windows.

---

## Technical Requirements

### 1. Restriction Types

**Past Dates**:
- Disable all dates before today
- Configurable (some tickets may allow past dates)

**Future Dates**:
- Disable dates beyond booking window
- Configurable maximum date

**Unavailable Dates**:
- Disable specific dates (sold out, closed, etc.)
- Array of disabled dates
- Date ranges

**Available Ranges**:
- Only allow dates within specific ranges
- Multiple ranges supported

### 2. Visual Indicators

**Disabled Dates**:
- Reduced opacity (50-60%)
- Greyed out appearance
- Not clickable
- Clear visual distinction

**ARIA Attributes**:
- `aria-disabled="true"`
- `aria-label` explains why disabled

### 3. API Design

**Configuration**:
```javascript
const calendar = new CircularCalendar({
  restrictions: {
    minDate: new Date(), // No past dates
    maxDate: new Date(2025, 11, 31), // No dates after 2025
    disabledDates: [
      new Date(2024, 0, 1), // New Year's Day
      // ... more dates
    ],
    disabledRanges: [
      { start: new Date(2024, 5, 1), end: new Date(2024, 5, 7) } // Week range
    ]
  }
});
```

---

## Implementation Approach

**New File**: `src/utils/dateRestrictions.js`

```javascript
export function isDateRestricted(date, restrictions = {}) {
  const { minDate, maxDate, disabledDates = [], disabledRanges = [] } = restrictions;
  
  // Check min/max
  if (minDate && date < minDate) return true;
  if (maxDate && date > maxDate) return true;
  
  // Check disabled dates
  if (disabledDates.some(d => isSameDay(d, date))) return true;
  
  // Check disabled ranges
  if (disabledRanges.some(range => isInRange(date, range))) return true;
  
  return false;
}

export function getRestrictionReason(date, restrictions) {
  // Return human-readable reason for restriction
}
```

**Update Renderer**:
```javascript
// In showMonthDaySelection():
if (isDateRestricted(selected, restrictions)) {
  path.setAttribute('aria-disabled', 'true');
  path.classList.add('disabled');
  path.style.opacity = '0.5';
  path.style.pointerEvents = 'none';
}
```

---

## Testing Requirements

**Unit Tests**:
- Restriction logic
- Edge cases (leap years, month boundaries)
- Multiple restriction types

**Integration Tests**:
- Disabled dates are not selectable
- Visual indicators work
- Screen reader announces restrictions

---

## Acceptance Criteria

✅ **Restricted dates are visually distinct**
✅ **Restricted dates are not selectable**
✅ **Screen reader announces restrictions**
✅ **Clear indication of why dates are restricted**

---

**Estimated Effort**: 10-12 hours  
**Complexity**: Medium-High  
**Risk**: Medium (coordination with Ticketlab API needed)
