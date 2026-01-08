# Feature 03: Focus Management and Visual Indicators

**Priority**: 🔴 Critical  
**Status**: Not Implemented  
**Feature ID**: F03  
**Category**: Accessibility

---

## Overview

Implement comprehensive focus management and high-contrast visual focus indicators for all interactive elements. Currently, there are no visible focus indicators on SVG elements, and focus is not managed during view transitions, making keyboard navigation difficult and violating WCAG 2.1 AA requirements.

---

## Current State Analysis

### Existing Implementation

**Month View** (`src/renderer/monthViewRenderer.js`):
- Uses semantic `<button>` elements
- Browser default focus styles may apply
- No custom focus management

**Circular Calendar SVG** (`src/renderer/calendarRenderer.js`):
- No focus indicators on SVG paths
- No focus management during transitions
- Focus can be lost when views change

**CSS** (`styles.css`):
- No custom focus styles for SVG elements
- Year input has basic focus style:
```css
#year-input:focus {
  outline: none;
  border-color: #48589a;
}
```

---

## Technical Requirements

### 1. Visible Focus Indicators

**WCAG Requirement**: 3:1 contrast ratio minimum for focus indicators.

**Visual Options**:
- **Stroke Outline**: 3-4px stroke around element
- **Glow Effect**: Drop-shadow filter
- **Background Highlight**: Semi-transparent overlay
- **Combination**: Multiple visual cues

**Implementation**:
```css
.calendar-segment:focus {
  stroke: #0066cc;
  stroke-width: 3px;
  filter: drop-shadow(0 0 6px rgba(0, 102, 204, 0.9));
}
```

### 2. Focus Management During Transitions

**Requirements**:
- Focus persists or moves logically when views change
- No focus loss during transitions
- Focus moves to first element in new view (if appropriate)
- Focus returns to logical position when returning to previous view

**Transition Scenarios**:
1. Year view → Month day selection: Focus moves to first day
2. Day selection → Hour selection: Focus moves to first hour
3. Hour selection → Minute selection: Focus moves to first minute
4. Any view → Previous view: Focus returns to triggering element

### 3. Focus Trap Prevention

**Requirements**:
- No keyboard traps
- User can always navigate away
- Tab order is complete and logical
- Escape key works (Feature 04)

### 4. High Contrast Mode Support

**Requirements**:
- Focus indicators work in high contrast mode
- Increased visibility in high contrast
- Respects `prefers-contrast: high`

---

## Implementation Approach

### Step 1: Create Focus Management Utility

**New File**: `src/utils/focusManagement.js`

**Purpose**: Centralised focus management logic

**Functions**:
```javascript
export function setFocusIndicator(element, options = {}) {
  // Add focus indicator styles/classes
}

export function manageFocusTransition(fromView, toView, options = {}) {
  // Handle focus during view transitions
}

export function focusFirstElement(container, selector) {
  // Focus first focusable element in container
}

export function saveFocusState(view) {
  // Save current focus for restoration
}

export function restoreFocusState(view) {
  // Restore saved focus
}
```

### Step 2: Update Calendar Renderer

**File**: `src/renderer/calendarRenderer.js`

**Changes**:
1. Import focus management utilities
2. Add focus indicator classes/styles to elements
3. Manage focus during view transitions
4. Save/restore focus state

**Code Pattern**:
```javascript
import { manageFocusTransition, focusFirstElement } from '../utils/focusManagement.js';

// In showMonthDaySelection():
const previousFocus = document.activeElement;
showMonthDaySelection(monthIndex);

// After rendering day segments:
const firstDay = svg.querySelector('.day-segment[tabindex="0"]');
if (firstDay) {
  firstDay.focus();
} else {
  // Fallback: focus first element
  focusFirstElement(svg, '.day-segment');
}
```

### Step 3: Add Focus Indicator Styles

**File**: `styles.css`

**Add**:
```css
/* SVG Focus Indicators */
.calendar-segment:focus,
.day-segment:focus,
.hour-segment:focus,
.minute-segment:focus {
  stroke: #0066cc;
  stroke-width: 3px;
  stroke-opacity: 1;
  filter: drop-shadow(0 0 6px rgba(0, 102, 204, 0.9));
  outline: none; /* SVG doesn't use outline */
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .calendar-segment:focus,
  .day-segment:focus,
  .hour-segment:focus,
  .minute-segment:focus {
    stroke-width: 4px;
    stroke: #000000;
    filter: drop-shadow(0 0 8px rgba(0, 0, 0, 1));
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .calendar-segment:focus,
  .day-segment:focus {
    filter: none; /* Remove animations */
  }
}
```

### Step 4: JavaScript Focus Management

**For SVG Elements** (since `:focus` may not work):
```javascript
path.addEventListener('focus', () => {
  path.classList.add('focused');
  path.setAttribute('stroke', '#0066cc');
  path.setAttribute('stroke-width', '3');
});

path.addEventListener('blur', () => {
  path.classList.remove('focused');
  path.setAttribute('stroke', '#fff');
  path.setAttribute('stroke-width', '1');
});
```

---

## Testing Requirements

### Unit Tests

**File**: `tests/focusManagement.test.js`

**Test Cases**:
1. `setFocusIndicator()` applies correct styles
2. `manageFocusTransition()` moves focus correctly
3. `focusFirstElement()` focuses first element
4. `saveFocusState()` saves current focus
5. `restoreFocusState()` restores saved focus

**Example Test**:
```javascript
import { describe, it, expect, beforeEach } from 'vitest';
import { focusFirstElement } from '../src/utils/focusManagement.js';

describe('focusManagement', () => {
  it('focuses first element in container', () => {
    const container = document.createElement('div');
    const first = document.createElement('button');
    first.setAttribute('tabindex', '0');
    const second = document.createElement('button');
    second.setAttribute('tabindex', '0');
    container.appendChild(first);
    container.appendChild(second);
    
    focusFirstElement(container, 'button');
    
    expect(document.activeElement).toBe(first);
  });
});
```

### Integration Tests

**File**: `tests/calendarRenderer.test.js`

**Test Cases**:
1. Focus moves to first day when entering day selection
2. Focus returns when leaving day selection
3. Focus indicators are visible
4. No focus loss during transitions
5. Focus order is logical

### Visual Testing

**Manual Testing**:
1. Tab through all elements - verify focus indicators
2. Check contrast ratio (use browser DevTools)
3. Test in high contrast mode
4. Test with keyboard navigation
5. Verify focus persists during transitions

**Contrast Testing**:
- Use browser DevTools to check contrast ratios
- Verify 3:1 minimum for focus indicators
- Test on all background colours

---

## Acceptance Criteria

✅ **Focus indicators are high contrast (3:1 minimum)**
- Focus indicators visible on all backgrounds
- Contrast ratio meets WCAG AA (3:1 minimum)
- Works in high contrast mode

✅ **Focus persists or moves logically during view transitions**
- Focus moves to first element in new view
- Focus returns to logical position when going back
- No focus loss during transitions

✅ **No keyboard traps**
- User can always navigate away
- Tab order is complete
- Escape key works (Feature 04)

✅ **Focus visible on all interactive elements**
- All SVG paths show focus indicators
- All buttons show focus indicators
- Focus indicators are consistent

---

## Dependencies

- **Feature 01**: Keyboard Navigation (focusable elements needed first)
- **Feature 04**: Escape Key Navigation (coordinate focus restoration)

## Related Files

- `src/renderer/calendarRenderer.js` - Main renderer (needs updates)
- `src/utils/focusManagement.js` - New utility file
- `styles.css` - Focus indicator styles
- `tests/focusManagement.test.js` - New test file
- `tests/calendarRenderer.test.js` - Integration tests

---

## TDD Approach

### Red Phase
1. Write failing tests for focus management utilities
2. Write failing tests for focus transitions
3. Write failing tests for focus indicators
4. Write failing integration tests

### Green Phase
1. Implement focus management utilities
2. Add focus indicator styles
3. Implement focus transition logic
4. Update calendar renderer
5. Make tests pass

### Refactor Phase
1. Extract common focus patterns
2. Optimise focus management
3. Improve focus indicator visibility
4. Add JSDoc comments

---

## Implementation Notes

### SVG Focus Limitations

**Challenge**: SVG `:focus` pseudo-class support varies by browser.

**Solution**: Use JavaScript event listeners:
```javascript
element.addEventListener('focus', handleFocus);
element.addEventListener('blur', handleBlur);
```

### Focus Indicator Design

**Considerations**:
- Must be visible on all background colours
- Should not obscure content
- Should be consistent across all views
- Should respect user preferences (reduced motion, high contrast)

### Performance

- Minimise DOM queries
- Use CSS classes where possible
- Debounce focus changes if needed

---

## Success Metrics

- All interactive elements have visible focus indicators
- Focus indicators meet contrast requirements (3:1 minimum)
- Focus is managed during all transitions
- No keyboard traps
- WCAG 2.1 AA compliance for focus management

---

**Estimated Effort**: 6-8 hours  
**Complexity**: Medium  
**Risk**: Low-Medium (SVG focus support varies)
