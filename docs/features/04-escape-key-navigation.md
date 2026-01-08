# Feature 04: Escape Key Navigation

**Priority**: 🔴 Critical  
**Status**: Not Implemented  
**Feature ID**: F04  
**Category**: Accessibility

---

## Overview

Implement Escape key functionality to allow users to navigate back to previous view levels. This is a critical accessibility feature that provides users with a clear way to exit current views and return to higher-level navigation.

---

## Current State Analysis

### Existing Implementation

**No Escape Key Handler**: Currently, there is no Escape key handler in the calendar renderer. Users cannot navigate back from:
- Month day selection view → Year view
- Hour selection view → Day selection view
- Minute selection view → Hour selection view

**View Navigation**:
- Users can only navigate forward (year → month → day → time)
- No backward navigation mechanism via keyboard
- Mouse users can click outside or use UI controls (if any)

---

## Technical Requirements

### 1. Escape Key Handler

**Functionality**:
- Escape key returns to previous view level
- Escape key closes any open modals/overlays
- Escape key behavior is consistent across all views

**View Hierarchy**:
```
Year View (root)
  └─ Month Day Selection
      └─ Hour Selection
          └─ Minute Selection
```

**Navigation Rules**:
- Year view → No action (already at root)
- Month day selection → Year view
- Hour selection → Day selection (for selected day)
- Minute selection → Hour selection

### 2. View State Management

**Requirements**:
- Track current view level
- Track previous view state
- Restore previous view when going back
- Maintain selected date/time when going back

### 3. Focus Management

**Requirements**:
- Focus returns to element that triggered current view
- Or focus moves to logical position in previous view
- No focus loss during Escape navigation

---

## Implementation Approach

### Step 1: Create View State Manager

**New File**: `src/utils/viewStateManager.js`

**Purpose**: Track view navigation state

**Functions**:
```javascript
export class ViewStateManager {
  constructor() {
    this.viewStack = [];
    this.currentView = 'year';
  }

  pushView(viewName, context = {}) {
    // Push current view to stack
  }

  popView() {
    // Return to previous view
  }

  getCurrentView() {
    // Get current view name
  }

  canGoBack() {
    // Check if navigation back is possible
  }
}
```

### Step 2: Update Calendar Renderer

**File**: `src/renderer/calendarRenderer.js`

**Changes**:
1. Import view state manager
2. Track view changes
3. Add Escape key event listener
4. Implement back navigation logic

**Code Pattern**:
```javascript
import { ViewStateManager } from '../utils/viewStateManager.js';

const viewState = new ViewStateManager();

// In showMonthDaySelection():
viewState.pushView('monthDays', { monthIndex: i });
showMonthDaySelection(i);

// Add Escape key handler:
svg.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    e.preventDefault();
    handleEscapeKey();
  }
});

function handleEscapeKey() {
  if (!viewState.canGoBack()) {
    return; // Already at root
  }

  const previousView = viewState.popView();
  
  switch (previousView.name) {
    case 'year':
      drawCalendar();
      drawCircle();
      break;
    case 'monthDays':
      // Return to day selection for that month
      showMonthDaySelection(previousView.context.monthIndex);
      break;
    // ... other cases
  }
  
  // Restore focus
  restoreFocusForView(previousView);
}
```

### Step 3: Integrate with Existing Navigation

**Coordinate with**:
- `drawCalendar()` - Returns to year view
- `showMonthDaySelection()` - Enters day selection
- `showHourSelection()` - Enters hour selection
- `showMinuteSelection()` - Enters minute selection

---

## Testing Requirements

### Unit Tests

**File**: `tests/viewStateManager.test.js`

**Test Cases**:
1. `pushView()` adds view to stack
2. `popView()` returns previous view
3. `canGoBack()` returns correct value
4. Stack maintains correct order

**Example Test**:
```javascript
import { describe, it, expect } from 'vitest';
import { ViewStateManager } from '../src/utils/viewStateManager.js';

describe('ViewStateManager', () => {
  it('pushes and pops views correctly', () => {
    const manager = new ViewStateManager();
    manager.pushView('monthDays', { monthIndex: 0 });
    expect(manager.getCurrentView()).toBe('monthDays');
    
    const previous = manager.popView();
    expect(previous.name).toBe('year');
    expect(manager.getCurrentView()).toBe('year');
  });
});
```

### Integration Tests

**File**: `tests/calendarRenderer.test.js`

**Test Cases**:
1. Escape key returns from day selection to year view
2. Escape key returns from hour selection to day selection
3. Escape key does nothing in year view
4. Focus is restored after Escape navigation
5. Selected date/time is maintained

---

## Acceptance Criteria

✅ **Escape key returns to previous view**
- Day selection → Year view
- Hour selection → Day selection
- Minute selection → Hour selection

✅ **Escape key closes any open modals/overlays**
- Any overlays are closed
- Calendar returns to base state

✅ **Escape key behavior is consistent across all views**
- Same behavior in all views
- Predictable navigation
- No unexpected side effects

---

## Dependencies

- **Feature 03**: Focus Management (coordinate focus restoration)

## Related Files

- `src/renderer/calendarRenderer.js` - Main renderer (needs updates)
- `src/utils/viewStateManager.js` - New utility file
- `tests/viewStateManager.test.js` - New test file
- `tests/calendarRenderer.test.js` - Integration tests

---

## TDD Approach

### Red Phase
1. Write failing tests for ViewStateManager
2. Write failing tests for Escape key handler
3. Write failing integration tests

### Green Phase
1. Implement ViewStateManager
2. Add Escape key handler
3. Integrate with calendar renderer
4. Make tests pass

### Refactor Phase
1. Extract common navigation patterns
2. Improve view state tracking
3. Add JSDoc comments

---

**Estimated Effort**: 4-6 hours  
**Complexity**: Low-Medium  
**Risk**: Low
