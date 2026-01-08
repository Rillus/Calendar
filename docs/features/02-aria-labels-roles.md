# Feature 02: ARIA Labels and Roles for SVG Elements

**Priority**: 🔴 Critical  
**Status**: Partially Implemented  
**Feature ID**: F02  
**Category**: Accessibility

---

## Overview

Add comprehensive ARIA attributes to all SVG elements to ensure screen reader compatibility. Currently, the month view uses semantic HTML with some ARIA, but the circular calendar SVG elements have no ARIA attributes, making them inaccessible to screen reader users.

---

## Current State Analysis

### Existing Implementation

**Month View** (`src/renderer/monthViewRenderer.js`):
```javascript
return `<button type="button" class="${classes.join(' ')}" 
        data-iso-date="${escapeHtml(day.isoDate)}" 
        aria-label="${escapeHtml(day.isoDate)}">${day.dayNumber}</button>`;
```
- ✅ Uses semantic `<button>` elements
- ✅ Has `aria-label` attributes
- ✅ Has `role="grid"` on container

**Circular Calendar SVG** (`src/renderer/calendarRenderer.js`):
```javascript
const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
path.setAttribute('class', 'calendar-segment');
// No ARIA attributes
```
- ❌ No `role` attributes
- ❌ No `aria-label` attributes
- ❌ No `aria-live` regions
- ❌ No `aria-current` for selected items

---

## Technical Requirements

### 1. ARIA Roles

**Interactive Elements**:
- `role="button"` - Month segments, day segments, hour/minute segments
- `role="group"` - Container groups (segments-group, day-segments-group)
- `role="radiogroup"` - AM/PM selector (if applicable)
- `role="listbox"` - Alternative for hour/minute selection

**Non-Interactive Elements**:
- No role needed (decorative elements)
- `aria-hidden="true"` for purely decorative elements

### 2. ARIA Labels

**Descriptive Labels Required**:
- Month segments: `"Select January, 31 days"`
- Day segments: `"Select January 15, 2024"`
- Hour segments: `"Select 2 PM"` or `"Select 14:00"`
- Minute segments: `"Select 2:30 PM"` or `"Select 14:30"`
- AM/PM: `"Select AM"` or `"Select PM"`

**Label Format**:
- Include context (month name, day number, time)
- Include state if applicable (selected, disabled)
- Be concise but descriptive

### 3. ARIA Live Regions

**Purpose**: Announce selections and view changes to screen readers.

**Implementation**:
```html
<svg>
  <text id="aria-live-region" 
        aria-live="polite" 
        aria-atomic="true"
        class="sr-only">
  </text>
</svg>
```

**Announcements Needed**:
- View changes: `"Entering day selection for January"`
- Selections: `"Selected January 15, 2024"`
- Time selections: `"Selected 2:30 PM"`
- Navigation: `"Month: January"` (when navigating)

### 4. ARIA Current

**Selected Items**:
- `aria-current="date"` - Currently selected date
- `aria-current="time"` - Currently selected time
- Update when selection changes

### 5. ARIA Expanded

**View State**:
- `aria-expanded="true"` - When in day/hour/minute selection view
- `aria-expanded="false"` - When in year view
- Helps screen readers understand navigation state

---

## Implementation Approach

### Step 1: Create ARIA Utility

**New File**: `src/utils/ariaUtils.js`

**Purpose**: Centralised ARIA attribute management

**Functions**:
```javascript
export function setAriaLabel(element, label) {
  element.setAttribute('aria-label', label);
}

export function setAriaRole(element, role) {
  element.setAttribute('role', role);
}

export function announceToScreenReader(message, priority = 'polite') {
  // Update aria-live region
}

export function setAriaCurrent(element, value) {
  element.setAttribute('aria-current', value);
}
```

### Step 2: Update Calendar Renderer

**File**: `src/renderer/calendarRenderer.js`

**Changes**:
1. Import ARIA utilities
2. Add ARIA live region element
3. Update `drawCalendar()` - add ARIA to month segments
4. Update `showMonthDaySelection()` - add ARIA to day segments
5. Update `showHourSelection()` - add ARIA to hour segments
6. Update `showMinuteSelection()` - add ARIA to minute segments
7. Announce view changes and selections

**Code Pattern**:
```javascript
import { setAriaLabel, setAriaRole, announceToScreenReader } from '../utils/ariaUtils.js';

// In drawCalendar():
const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
// ... existing code ...

setAriaRole(path, 'button');
setAriaLabel(path, `Select ${months[i]}, ${getDaysInMonth(i, currentYear)} days`);
```

### Step 3: Create ARIA Live Region

**In Calendar Renderer**:
```javascript
const createAriaLiveRegion = () => {
  const liveRegion = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  liveRegion.setAttribute('id', 'aria-live-region');
  liveRegion.setAttribute('aria-live', 'polite');
  liveRegion.setAttribute('aria-atomic', 'true');
  liveRegion.setAttribute('class', 'sr-only');
  liveRegion.style.position = 'absolute';
  liveRegion.style.left = '-10000px';
  liveRegion.style.width = '1px';
  liveRegion.style.height = '1px';
  liveRegion.style.overflow = 'hidden';
  return liveRegion;
};
```

### Step 4: Screen Reader Only Styles

**File**: `styles.css`

**Add**:
```css
/* Screen reader only - visually hidden but accessible */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

---

## Testing Requirements

### Unit Tests

**File**: `tests/ariaUtils.test.js`

**Test Cases**:
1. `setAriaLabel()` sets correct attribute
2. `setAriaRole()` sets correct attribute
3. `announceToScreenReader()` updates live region
4. `setAriaCurrent()` sets correct value

**Example Test**:
```javascript
import { describe, it, expect } from 'vitest';
import { setAriaLabel, announceToScreenReader } from '../src/utils/ariaUtils.js';

describe('ariaUtils', () => {
  it('sets aria-label attribute', () => {
    const element = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    setAriaLabel(element, 'Select January');
    expect(element.getAttribute('aria-label')).toBe('Select January');
  });
});
```

### Integration Tests

**File**: `tests/calendarRenderer.test.js`

**Test Cases**:
1. All month segments have ARIA labels
2. All day segments have ARIA labels
3. ARIA live region announces selections
4. Selected items have `aria-current="date"`
5. View changes are announced

### Accessibility Tests

**Manual Testing**:
1. Test with NVDA (Windows)
2. Test with JAWS (Windows)
3. Test with VoiceOver (macOS/iOS)
4. Verify all elements are announced
5. Verify announcements are timely and descriptive

**Automated Testing**:
- Use axe-core to verify ARIA attributes
- Verify no missing ARIA labels
- Verify no redundant ARIA attributes

---

## Acceptance Criteria

✅ **All interactive SVG elements have descriptive ARIA labels**
- Month segments: `"Select January, 31 days"`
- Day segments: `"Select January 15, 2024"`
- Hour/minute segments: Descriptive time labels

✅ **Screen reader announces selections and view changes**
- View changes announced: `"Entering day selection for January"`
- Selections announced: `"Selected January 15, 2024"`
- Announcements are timely (polite priority)

✅ **ARIA live regions update appropriately**
- Live region exists and is functional
- Announcements are clear and descriptive
- No duplicate announcements

✅ **Selected items have `aria-current` attribute**
- Selected date has `aria-current="date"`
- Selected time has `aria-current="time"`
- Attribute updates when selection changes

---

## Dependencies

- **Feature 01**: Keyboard Navigation (coordinate focus and ARIA)
- **Feature 06**: Screen Reader Announcements (this feature provides the mechanism)

## Related Files

- `src/renderer/calendarRenderer.js` - Main renderer (needs updates)
- `src/utils/ariaUtils.js` - New utility file
- `styles.css` - Screen reader only styles
- `tests/ariaUtils.test.js` - New test file
- `tests/calendarRenderer.test.js` - Integration tests

---

## TDD Approach

### Red Phase
1. Write failing tests for ARIA utility functions
2. Write failing tests for ARIA label generation
3. Write failing tests for live region announcements
4. Write failing integration tests

### Green Phase
1. Implement ARIA utility functions
2. Add ARIA attributes to all SVG elements
3. Create and integrate ARIA live region
4. Add announcement calls
5. Make tests pass

### Refactor Phase
1. Extract label generation logic
2. Optimise announcement frequency
3. Improve label descriptions
4. Add JSDoc comments

---

## Implementation Notes

### Label Generation

**Considerations**:
- Labels should be concise but descriptive
- Include context (month, year, time)
- Use natural language
- Consider locale (future i18n support)

**Example Labels**:
```javascript
function generateMonthLabel(monthIndex, year) {
  const monthName = months[monthIndex];
  const days = getDaysInMonth(monthIndex, year);
  return `Select ${monthName}, ${days} days, ${year}`;
}

function generateDayLabel(day, monthIndex, year) {
  const monthName = months[monthIndex];
  return `Select ${monthName} ${day}, ${year}`;
}
```

### Live Region Priority

**Polite vs Assertive**:
- Use `polite` for normal announcements (selections, navigation)
- Use `assertive` only for critical errors
- Default to `polite` to avoid interrupting screen reader

### ARIA Best Practices

- Don't use redundant ARIA (e.g., `role="button"` on `<button>`)
- Use semantic HTML where possible (month view buttons)
- Test with actual screen readers, not just automated tools

---

## Success Metrics

- All interactive elements have ARIA labels
- Screen reader users can navigate independently
- Selections and view changes are announced
- WCAG 2.1 AA compliance for ARIA
- No accessibility violations in automated testing

---

**Estimated Effort**: 6-8 hours  
**Complexity**: Medium  
**Risk**: Low (well-documented ARIA patterns)
