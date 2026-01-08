# Feature 01: Keyboard Navigation for SVG Elements

**Priority**: 🔴 Critical  
**Status**: Not Implemented  
**Feature ID**: F01  
**Category**: Accessibility

---

## Overview

Make all SVG path elements (month segments, day segments, hour/minute segments) fully keyboard accessible. Currently, only the month view grid uses semantic HTML buttons that are keyboard accessible. The circular calendar SVG elements are mouse/touch only, which violates WCAG 2.1 AA requirements.

---

## Current State Analysis

### Existing Implementation

**Location**: `src/renderer/calendarRenderer.js`

**Current Code Pattern**:
```javascript
const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
path.setAttribute('d', createArcPath(...));
path.setAttribute('class', 'calendar-segment');
path.style.cursor = 'pointer';

path.addEventListener('click', (e) => {
  e.preventDefault();
  showMonthDaySelection(i);
});
```

**Issues**:
- No `tabindex` attribute - elements are not focusable
- No keyboard event handlers
- No focus indicators
- No logical tab order
- Screen readers cannot navigate these elements

### What Works

- Month view (`src/renderer/monthViewRenderer.js`) uses semantic `<button>` elements which are keyboard accessible
- Click handlers work correctly
- Visual hover states exist

---

## Technical Requirements

### 1. Make SVG Elements Focusable

**Requirement**: All interactive SVG elements must be focusable via keyboard.

**Implementation**:
- Add `tabindex="0"` to all interactive SVG paths
- Ensure elements are in logical tab order
- Remove `tabindex` from non-interactive elements (labels, decorative elements)

**SVG Path Elements to Update**:
- Month segments (year view) - 12 paths
- Day segments (month day selection) - 28-31 paths
- Hour segments (time selection) - 12 or 24 paths
- Minute segments (time selection) - 60 paths
- AM/PM selectors (if applicable) - 2 text elements

### 2. Keyboard Event Handlers

**Requirement**: Handle keyboard interactions for all SVG elements.

**Key Events to Handle**:
- `Enter` - Activate selection (same as click)
- `Space` - Activate selection (same as click)
- `ArrowLeft` / `ArrowRight` - Navigate to previous/next segment
- `ArrowUp` / `ArrowDown` - Navigate to previous/next segment (alternative)
- `Home` - Jump to first segment
- `End` - Jump to last segment
- `Escape` - Return to previous view (handled in separate feature)

**Navigation Logic**:
- Year view: Arrow keys move clockwise/counter-clockwise between months
- Day selection: Arrow keys move between days (1-31)
- Hour selection: Arrow keys move between hours (0-23 or 1-12)
- Minute selection: Arrow keys move between minutes (0-59)

### 3. Focus Indicators

**Requirement**: Visible focus indicators with 3:1 contrast ratio minimum.

**Visual Options**:
- Stroke outline (2-3px, contrasting colour)
- Glow effect (drop-shadow filter)
- Background highlight (for circular segments)
- Combination approach

**CSS Approach**:
```css
.calendar-segment:focus {
  outline: 3px solid #0066cc;
  outline-offset: 2px;
  filter: drop-shadow(0 0 4px rgba(0, 102, 204, 0.8));
}
```

**SVG Approach**:
- Add/remove stroke on focus
- Change stroke-width on focus
- Add filter effect on focus

### 4. Tab Order Management

**Requirement**: Logical tab order throughout calendar.

**Tab Order**:
1. Year input (if visible)
2. Month segments (year view) - clockwise starting from January
3. Day segments (month view) - 1 to 31
4. Hour segments (time view) - 0-23 or 1-12
5. Minute segments (time view) - 0-59
6. AM/PM selectors (if 12-hour mode)

**Implementation**:
- Set `tabindex` values programmatically based on position
- Or rely on DOM order (preferred)
- Ensure no keyboard traps

---

## Implementation Approach

### Step 1: Create Keyboard Navigation Utility

**New File**: `src/utils/keyboardNavigation.js`

**Purpose**: Centralised keyboard navigation logic

**Functions**:
```javascript
export function makeSvgElementFocusable(element, options = {}) {
  // Add tabindex, ARIA attributes, keyboard handlers
}

export function handleArrowKeyNavigation(event, segments, currentIndex, options = {}) {
  // Handle arrow key navigation logic
}

export function handleActivationKey(event, callback) {
  // Handle Enter/Space activation
}
```

### Step 2: Update Calendar Renderer

**File**: `src/renderer/calendarRenderer.js`

**Changes**:
1. Import keyboard navigation utilities
2. Update `drawCalendar()` to make month segments focusable
3. Update `showMonthDaySelection()` to make day segments focusable
4. Update `showHourSelection()` to make hour segments focusable
5. Update `showMinuteSelection()` to make minute segments focusable
6. Add focus indicator styling

**Code Pattern**:
```javascript
import { makeSvgElementFocusable, handleArrowKeyNavigation } from '../utils/keyboardNavigation.js';

// In drawCalendar():
const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
// ... existing attributes ...

// Make focusable
makeSvgElementFocusable(path, {
  tabindex: 0,
  role: 'button',
  ariaLabel: `Select ${months[i]}, ${days} days`,
  onActivate: () => showMonthDaySelection(i),
  onArrowKey: (direction) => handleMonthNavigation(direction, i)
});
```

### Step 3: Add Focus Styles

**File**: `styles.css`

**Add**:
```css
/* SVG Focus Indicators */
.calendar-segment:focus,
.day-segment:focus,
.hour-segment:focus,
.minute-segment:focus {
  outline: 3px solid #0066cc;
  outline-offset: 2px;
  filter: drop-shadow(0 0 6px rgba(0, 102, 204, 0.9));
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .calendar-segment:focus {
    outline: 4px solid;
    outline-offset: 3px;
  }
}
```

### Step 4: Update ARIA Attributes

**Integration with Feature 02**: Coordinate with ARIA labels feature.

**Basic ARIA**:
- `role="button"` on all interactive paths
- `tabindex="0"` on focusable elements
- `tabindex="-1"` on non-interactive elements

---

## Testing Requirements

### Unit Tests

**File**: `tests/keyboardNavigation.test.js`

**Test Cases**:
1. `makeSvgElementFocusable()` adds correct attributes
2. Arrow key navigation moves focus correctly
3. Enter/Space activates selection
4. Tab order is logical
5. Focus indicators are applied

**Example Test**:
```javascript
import { describe, it, expect, beforeEach } from 'vitest';
import { makeSvgElementFocusable } from '../src/utils/keyboardNavigation.js';

describe('makeSvgElementFocusable', () => {
  it('adds tabindex="0" to element', () => {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    makeSvgElementFocusable(path);
    expect(path.getAttribute('tabindex')).toBe('0');
  });

  it('handles Enter key activation', () => {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    let activated = false;
    makeSvgElementFocusable(path, {
      onActivate: () => { activated = true; }
    });
    
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    path.dispatchEvent(enterEvent);
    
    expect(activated).toBe(true);
  });
});
```

### Integration Tests

**File**: `tests/calendarRenderer.test.js`

**Test Cases**:
1. Month segments are focusable
2. Tab navigation works through all segments
3. Arrow keys navigate between segments
4. Focus persists during view transitions
5. No keyboard traps exist

### Accessibility Tests

**Manual Testing**:
1. Navigate entire calendar using only keyboard
2. Test with NVDA screen reader (Windows)
3. Test with JAWS screen reader (Windows)
4. Test with VoiceOver (macOS/iOS)
5. Verify focus indicators are visible
6. Verify 3:1 contrast ratio on focus indicators

**Automated Testing**:
- Use axe-core for accessibility testing
- Verify no keyboard traps
- Verify all interactive elements are focusable

---

## Acceptance Criteria

✅ **All month segments can be focused with Tab**
- Each of 12 month segments receives focus when tabbing
- Focus order is logical (January → December)

✅ **Arrow keys navigate between segments**
- Left/Right arrows move between adjacent segments
- Navigation wraps appropriately (December → January)
- Works in all views (year, day, hour, minute)

✅ **Enter/Space activates selection**
- Enter key triggers same action as click
- Space key triggers same action as click
- Activation works in all views

✅ **Focus is clearly visible (3:1 contrast minimum)**
- Focus indicators are visible on all backgrounds
- Contrast ratio meets WCAG AA (3:1 minimum)
- Focus indicators work in high contrast mode

✅ **No keyboard traps**
- User can always navigate away from calendar
- Tab order is logical and complete
- Escape key works (handled in Feature 04)

---

## Dependencies

- **Feature 02**: ARIA Labels and Roles (coordinate ARIA attributes)
- **Feature 03**: Focus Management (coordinate focus indicators)
- **Feature 05**: Arrow Key Navigation (this feature enables it)

## Related Files

- `src/renderer/calendarRenderer.js` - Main renderer (needs updates)
- `src/utils/keyboardNavigation.js` - New utility file
- `styles.css` - Focus indicator styles
- `tests/keyboardNavigation.test.js` - New test file
- `tests/calendarRenderer.test.js` - Integration tests

---

## TDD Approach

### Red Phase
1. Write failing tests for `makeSvgElementFocusable()`
2. Write failing tests for arrow key navigation
3. Write failing tests for Enter/Space activation
4. Write failing integration tests

### Green Phase
1. Implement `makeSvgElementFocusable()` utility
2. Implement keyboard event handlers
3. Update calendar renderer to use utilities
4. Add focus indicator styles
5. Make tests pass

### Refactor Phase
1. Extract common patterns
2. Optimise event handler performance
3. Improve code organisation
4. Add JSDoc comments

---

## Implementation Notes

### SVG Focus Limitations

**Challenge**: SVG elements don't support `:focus` pseudo-class in all browsers.

**Solution**: Use JavaScript to add/remove focus classes:
```javascript
path.addEventListener('focus', () => {
  path.classList.add('focused');
});
path.addEventListener('blur', () => {
  path.classList.remove('focused');
});
```

### Performance Considerations

- Debounce arrow key navigation if needed
- Use event delegation for many segments
- Minimise DOM queries

### Browser Compatibility

- Test in Chrome, Firefox, Safari, Edge
- Verify SVG focus support
- Fallback for older browsers if needed

---

## Success Metrics

- All interactive SVG elements are keyboard accessible
- Keyboard navigation works in all views
- Focus indicators meet contrast requirements
- No keyboard traps
- Screen reader users can navigate independently
- WCAG 2.1 AA compliance achieved

---

**Estimated Effort**: 8-12 hours  
**Complexity**: Medium-High  
**Risk**: Medium (SVG focus support varies by browser)
