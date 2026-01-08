# Feature 16: Dark Mode

**Priority**: 🟢 Medium  
**Status**: Not Implemented  
**Feature ID**: F16  
**Category**: Enhancement

---

## Overview

Implement dark mode support with an alternative colour scheme for low-light environments. Must maintain all contrast ratios and accessibility requirements.

---

## Technical Requirements

### 1. Colour Adaptation

**Seasonal Colours**:
- Adapt all 12 month colours for dark mode
- Maintain visual distinction
- Preserve seasonal progression

**Background/Foreground**:
- Dark background (#1a1a1a or similar)
- Light text
- Maintain contrast ratios

### 2. Detection

**Options**:
- Respect `prefers-color-scheme: dark`
- Manual toggle
- Both (automatic with override)

### 3. Contrast Requirements

**Maintain**:
- 4.5:1 for normal text
- 3:1 for large text
- 3:1 for focus indicators
- All WCAG AA requirements

---

## Implementation Approach

**CSS Variables**:
```css
:root {
  --bg-color: #ffffff;
  --text-color: #333333;
  --month-jan: #48589a;
  /* ... */
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg-color: #1a1a1a;
    --text-color: #e0e0e0;
    --month-jan: #6b7bb8;
    /* ... adapted colours */
  }
}
```

**Toggle Option**:
```javascript
function setDarkMode(enabled) {
  document.documentElement.setAttribute('data-theme', enabled ? 'dark' : 'light');
}
```

---

## Testing Requirements

**Visual Testing**:
- Verify all colours work in dark mode
- Check contrast ratios
- Test on different displays

**Accessibility Testing**:
- Verify contrast requirements met
- Test with screen readers
- Test focus indicators

---

## Acceptance Criteria

✅ **Dark mode maintains all contrast requirements**
✅ **Colours are adapted appropriately**
✅ **Toggle or automatic detection**

---

**Estimated Effort**: 8-10 hours  
**Complexity**: Medium  
**Risk**: Low-Medium (colour adaptation complexity)
