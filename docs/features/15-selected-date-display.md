# Feature 15: Selected Date Display

**Priority**: 🟡 High  
**Status**: Partially Implemented  
**Feature ID**: F15  
**Category**: User Experience

---

## Overview

Improve the display of the selected date/time to make it more prominent and readable. Currently, the selected date is shown in the centre of the circular calendar, but the format could be clearer and more informative.

---

## Current State Analysis

**Current Display**: Month name shown in centre circle when month is selected. Date/time not always clearly displayed.

**Issues**:
- Format could be clearer
- Time not always visible
- Not prominent enough

---

## Technical Requirements

### 1. Display Format

**Date Format**:
- "15 January 2024" (readable format)
- Or "January 15, 2024" (US format)
- Configurable locale

**Time Format** (if time selected):
- "2:30 PM" (12-hour)
- "14:30" (24-hour)
- Combined: "15 January 2024, 2:30 PM"

### 2. Prominence

**Visual Hierarchy**:
- Large, readable text
- High contrast
- Prominent placement
- Clear separation from other elements

### 3. Updates

**Real-time Updates**:
- Update immediately on selection
- Smooth transitions
- No flicker

---

## Implementation Approach

**Update Centre Display**:
```javascript
function updateSelectedDateDisplay(date, time = null) {
  const displayElement = svg.querySelector('.selected-date-display');
  
  let text = formatDate(date, { locale: 'en-GB' });
  if (time) {
    text += `, ${formatTime(time)}`;
  }
  
  displayElement.textContent = text;
}
```

**Formatting Utilities**:
```javascript
export function formatDate(date, options = {}) {
  const { locale = 'en-GB' } = options;
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
}
```

---

## Testing Requirements

**Unit Tests**:
- Date formatting
- Time formatting
- Locale support

**Integration Tests**:
- Display updates on selection
- Format is correct
- Prominence is appropriate

---

## Acceptance Criteria

✅ **Selected date is prominently displayed**
✅ **Format is clear and readable**
✅ **Display updates on selection**

---

**Estimated Effort**: 4-6 hours  
**Complexity**: Low-Medium  
**Risk**: Low
