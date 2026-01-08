# Feature 17: Internationalisation (i18n)

**Priority**: 🟢 Medium  
**Status**: Partially Implemented  
**Feature ID**: F17  
**Category**: Enhancement

---

## Overview

Add support for multiple languages and locales, including month names, weekday labels, date formats, and RTL (right-to-left) support for Arabic/Hebrew.

---

## Current State Analysis

**Current**: Only en-GB locale supported. Month names are hardcoded in `config.js`.

---

## Technical Requirements

### 1. Locale Support

**Languages**:
- English (en-GB, en-US)
- Spanish, French, German
- Arabic, Hebrew (RTL)
- More as needed

### 2. Date Formatting

**Formats**:
- DD/MM/YYYY (UK)
- MM/DD/YYYY (US)
- YYYY-MM-DD (ISO)
- Locale-specific

### 3. RTL Support

**Layout**:
- Mirror circular calendar
- RTL text direction
- Proper text alignment

---

## Implementation Approach

**New File**: `src/utils/i18n.js`

```javascript
const translations = {
  'en-GB': {
    months: ['January', 'February', ...],
    weekdays: ['Monday', 'Tuesday', ...],
    dateFormat: 'DD/MM/YYYY'
  },
  'ar': {
    months: ['يناير', 'فبراير', ...],
    weekdays: ['الاثنين', 'الثلاثاء', ...],
    dateFormat: 'DD/MM/YYYY',
    rtl: true
  }
  // ... more locales
};

export function getTranslation(key, locale = 'en-GB') {
  return translations[locale]?.[key] || translations['en-GB'][key];
}
```

**Intl API**:
```javascript
export function formatDate(date, locale = 'en-GB') {
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
- Translation functions
- Date formatting
- RTL layout

**Manual Testing**:
- Test with multiple languages
- Verify RTL layout
- Check date formats

---

## Acceptance Criteria

✅ **Multiple languages supported**
✅ **Locale-specific date formats**
✅ **RTL layout support**
✅ **Configurable via options**

---

**Estimated Effort**: 16-20 hours  
**Complexity**: High  
**Risk**: Medium (RTL complexity)
