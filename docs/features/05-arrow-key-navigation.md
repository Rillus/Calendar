# Feature 05: Arrow Key Navigation Within Views

**Priority**: 🔴 Critical  
**Status**: Not Implemented  
**Feature ID**: F05  
**Category**: Accessibility

---

## Overview

Implement arrow key navigation to allow users to move between segments within the current view. This enables efficient keyboard navigation without requiring Tab through every element.

---

## Current State Analysis

**No Arrow Key Support**: Arrow keys currently have no effect on calendar navigation. Users must use Tab to move between segments, which is inefficient for 12 months, 31 days, 24 hours, or 60 minutes.

---

## Technical Requirements

### 1. Arrow Key Navigation Logic

**Year View (Month Segments)**:
- Left/Right arrows: Move clockwise/counter-clockwise
- Up/Down arrows: Move 6 months (opposite side)
- Home: First month (January)
- End: Last month (December)

**Day Selection**:
- Left/Right arrows: Previous/next day
- Up/Down arrows: Previous/next week (7 days)
- Home: First day of month (1)
- End: Last day of month

**Hour Selection**:
- Left/Right arrows: Previous/next hour
- Up/Down arrows: Previous/next 6 hours
- Home: First hour (0 or 1)
- End: Last hour (23 or 12)

**Minute Selection**:
- Left/Right arrows: Previous/next minute
- Up/Down arrows: Previous/next 15 minutes
- Home: First minute (0)
- End: Last minute (59)

### 2. Wrapping Behavior

**Options**:
- Wrap around (December → January)
- Stop at boundaries
- Configurable behavior

**Default**: Wrap around for circular calendar design.

### 3. Page Up/Down

**Year View**:
- Page Up: Previous year
- Page Down: Next year

**Day Selection**:
- Page Up: Previous month
- Page Down: Next month

---

## Implementation Approach

### Step 1: Create Navigation Utility

**New File**: `src/utils/arrowKeyNavigation.js`

**Functions**:
```javascript
export function handleArrowKeyNavigation(event, segments, currentIndex, options = {}) {
  const { wrap = true, rows = 1, columns = segments.length } = options;
  
  let newIndex = currentIndex;
  
  switch (event.key) {
    case 'ArrowRight':
      newIndex = wrap ? (currentIndex + 1) % segments.length : Math.min(currentIndex + 1, segments.length - 1);
      break;
    case 'ArrowLeft':
      newIndex = wrap ? (currentIndex - 1 + segments.length) % segments.length : Math.max(currentIndex - 1, 0);
      break;
    // ... other cases
  }
  
  return newIndex;
}
```

### Step 2: Update Calendar Renderer

**File**: `src/renderer/calendarRenderer.js`

**Add arrow key handlers to each view**:
```javascript
import { handleArrowKeyNavigation } from '../utils/arrowKeyNavigation.js';

// In drawCalendar():
path.addEventListener('keydown', (e) => {
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key)) {
    e.preventDefault();
    const currentIndex = parseInt(path.getAttribute('data-segment-index'));
    const newIndex = handleArrowKeyNavigation(e, segments, currentIndex, {
      wrap: true,
      total: segments.length
    });
    
    const newSegment = svg.querySelector(`[data-segment-index="${newIndex}"]`);
    if (newSegment) {
      newSegment.focus();
    }
  }
});
```

---

## Testing Requirements

### Unit Tests

**File**: `tests/arrowKeyNavigation.test.js`

**Test Cases**:
1. ArrowRight moves to next segment
2. ArrowLeft moves to previous segment
3. Wrapping works correctly
4. Home/End jump to boundaries
5. Page Up/Down navigation

---

## Acceptance Criteria

✅ **Arrow keys navigate logically**
- Clockwise/counter-clockwise in circular views
- Logical progression in linear views

✅ **Home/End jump to first/last item**
- Home: First item
- End: Last item

✅ **Page Up/Down navigate months/years**
- Page Up: Previous period
- Page Down: Next period

✅ **Navigation wraps appropriately**
- Wraps at boundaries (configurable)
- No focus loss

---

## Dependencies

- **Feature 01**: Keyboard Navigation (focusable elements needed)

## Related Files

- `src/renderer/calendarRenderer.js` - Main renderer
- `src/utils/arrowKeyNavigation.js` - New utility
- `tests/arrowKeyNavigation.test.js` - New test file

---

**Estimated Effort**: 6-8 hours  
**Complexity**: Medium  
**Risk**: Low
