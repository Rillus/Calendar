# Feature 14: Today Button/Shortcut

**Priority**: 🟡 High  
**Status**: Not Implemented  
**Feature ID**: F14  
**Category**: User Experience

---

## Overview

Add a "Today" button and keyboard shortcut (`T`) to quickly navigate to today's date, improving efficiency for users who frequently need to return to the current date.

---

## Technical Requirements

### 1. Today Button

**UI Placement**:
- Near year input
- Accessible button
- Clear label: "Today"

**Functionality**:
- Navigate to today's date
- Select today if in appropriate view
- Update year if needed

### 2. Keyboard Shortcut

**Shortcut**: `T` key
- Works in all views
- Doesn't interfere with text input
- Quick navigation

### 3. Visual Highlight

**Current State**: Today is already highlighted in month view
**Enhancement**: Ensure today is clearly indicated in all views

---

## Implementation Approach

**Button**:
```html
<button id="today-button" type="button" aria-label="Go to today">
  Today
</button>
```

**Handler**:
```javascript
function goToToday() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const day = today.getDate();
  
  // Update year if needed
  if (year !== currentYear) {
    setYear(year);
    drawCalendar();
  }
  
  // Navigate to today
  showMonthDaySelection(month);
  selectDate(today);
}
```

**Keyboard Shortcut** (Feature 11):
```javascript
case 't':
case 'T':
  goToToday();
  break;
```

---

## Testing Requirements

**Unit Tests**:
- `goToToday()` function
- Year update logic
- Date selection

**Integration Tests**:
- Button works
- Keyboard shortcut works
- Today is selected correctly

---

## Acceptance Criteria

✅ **Today button is accessible**
✅ **Keyboard shortcut works**
✅ **Today is clearly indicated**

---

**Estimated Effort**: 3-4 hours  
**Complexity**: Low  
**Risk**: Low
