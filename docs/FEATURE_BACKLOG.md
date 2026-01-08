# Feature Backlog
## Circular Calendar - Missing Features

This document lists potential features that still need to be completed based on:
- Current codebase analysis
- PRD requirements (especially accessibility)
- UX/UI gaps
- Ticketlab integration needs

**Priority Legend:**
- 🔴 **Critical** - Required for WCAG 2.1 AA compliance or core functionality
- 🟡 **High** - Important for user experience and Ticketlab integration
- 🟢 **Medium** - Nice to have, enhances experience
- ⚪ **Low** - Future enhancement, not blocking

---

## 🔴 Critical: Accessibility Features

### 1. Keyboard Navigation for SVG Elements
**Status**: Not Implemented  
**Priority**: 🔴 Critical  
**Description**: SVG path elements (month segments, day segments, hour/minute segments) are not keyboard accessible. They need:
- `tabindex="0"` to make them focusable
- Keyboard event handlers (Enter, Space, Arrow keys)
- Focus indicators (high contrast outline/stroke)
- Logical tab order

**Current State**: Only month view buttons are keyboard accessible. Circular calendar segments are mouse/touch only.

**Acceptance Criteria**:
- All month segments can be focused with Tab
- Arrow keys navigate between segments
- Enter/Space activates selection
- Focus is clearly visible (3:1 contrast minimum)

---

### 2. ARIA Labels and Roles for SVG Elements
**Status**: Partially Implemented  
**Priority**: 🔴 Critical  
**Description**: SVG elements lack proper ARIA attributes:
- `role="button"` for interactive segments
- `aria-label` with descriptive text (e.g., "Select January, 31 days")
- `aria-live` regions to announce selections
- `aria-current="date"` for selected date
- `aria-expanded` for view state changes

**Current State**: Month view has some ARIA (buttons, grid role), but circular calendar SVG has none.

**Acceptance Criteria**:
- All interactive SVG elements have descriptive ARIA labels
- Screen reader announces selections and view changes
- ARIA live regions update appropriately

---

### 3. Focus Management and Visual Indicators
**Status**: Not Implemented  
**Priority**: 🔴 Critical  
**Description**: 
- No visible focus indicators on SVG elements
- Focus not managed during view transitions
- No focus trap prevention
- Focus should return to logical position after view change

**Current State**: No focus styles visible, focus can be lost during transitions.

**Acceptance Criteria**:
- Focus indicators are high contrast (3:1 minimum)
- Focus persists or moves logically during view transitions
- No keyboard traps
- Focus visible on all interactive elements

---

### 4. Escape Key Navigation
**Status**: Not Implemented  
**Priority**: 🔴 Critical  
**Description**: Escape key should return to previous view level:
- Year view → (no previous)
- Month day selection → Year view
- Hour selection → Day selection
- Minute selection → Hour selection

**Current State**: No escape key handler.

**Acceptance Criteria**:
- Escape key returns to previous view
- Escape key closes any open modals/overlays
- Escape key behavior is consistent across all views

---

### 5. Arrow Key Navigation Within Views
**Status**: Not Implemented  
**Priority**: 🔴 Critical  
**Description**: Arrow keys should navigate between segments within current view:
- Year view: Arrow keys move between months
- Day selection: Arrow keys move between days
- Hour selection: Arrow keys move between hours
- Minute selection: Arrow keys move between minutes

**Current State**: Arrow keys have no effect.

**Acceptance Criteria**:
- Arrow keys navigate logically (clockwise/counter-clockwise)
- Home/End jump to first/last item
- Page Up/Down navigate months/years
- Navigation wraps appropriately

---

### 6. Screen Reader Announcements
**Status**: Not Implemented  
**Priority**: 🔴 Critical  
**Description**: ARIA live regions should announce:
- Selected month/day/time
- View changes (e.g., "Entering day selection for January")
- Current selection state
- Available actions

**Current State**: No live regions, no announcements.

**Acceptance Criteria**:
- All selections are announced
- View changes are announced
- Announcements are timely and descriptive
- Screen reader users can navigate independently

---

### 7. Touch Target Size Verification
**Status**: Needs Verification  
**Priority**: 🔴 Critical  
**Description**: Verify all touch targets meet WCAG 2.1 AA requirement of 44×44px minimum.

**Current State**: Unknown if touch targets meet size requirements, especially for hour/minute segments.

**Acceptance Criteria**:
- All interactive elements are at least 44×44px
- Adequate spacing between touch targets
- Touch targets work reliably on mobile devices

---

### 8. Skip Links
**Status**: Not Implemented  
**Priority**: 🔴 Critical  
**Description**: Skip links for efficient navigation:
- Skip to calendar
- Skip to month view
- Skip to selected date

**Current State**: No skip links.

**Acceptance Criteria**:
- Skip links are keyboard accessible
- Skip links appear on focus
- Skip links navigate to logical sections

---

## 🟡 High Priority: User Experience Features

### 9. Smooth View Transitions
**Status**: Not Implemented  
**Priority**: 🟡 High  
**Description**: Smooth animations when transitioning between views:
- Year → Month → Day transitions
- Fade/slide animations
- Respect `prefers-reduced-motion`

**Current State**: Views change instantly with no animation.

**Acceptance Criteria**:
- Transitions are smooth (60fps)
- Animations respect accessibility preferences
- Transitions don't cause jank or performance issues

---

### 10. Error Handling and Validation
**Status**: Not Implemented  
**Priority**: 🟡 High  
**Description**: 
- Validate date/time selections
- Show error messages for invalid dates
- Prevent selection of past dates (if required for tickets)
- Clear error recovery

**Current State**: No validation or error messages.

**Acceptance Criteria**:
- Invalid dates are prevented or clearly marked
- Error messages are accessible (ARIA)
- Users can easily correct errors
- Errors don't block calendar functionality

---

### 11. Keyboard Shortcuts Help
**Status**: Not Implemented  
**Priority**: 🟡 High  
**Description**: Discoverable keyboard shortcuts:
- "T" for today
- "N" for next month
- "P" for previous month
- "?" to show help
- Tooltip or help panel

**Current State**: No keyboard shortcuts or help text.

**Acceptance Criteria**:
- Shortcuts are discoverable
- Help is accessible
- Shortcuts are documented
- Shortcuts work consistently

---

### 12. Date Range Restrictions
**Status**: Not Implemented  
**Priority**: 🟡 High  
**Description**: For Ticketlab integration:
- Disable past dates (if tickets are future-only)
- Disable unavailable dates
- Show available date ranges
- Visual indication of restricted dates

**Current State**: All dates are selectable.

**Acceptance Criteria**:
- Restricted dates are visually distinct
- Restricted dates are not selectable
- Screen reader announces restrictions
- Clear indication of why dates are restricted

---

### 13. Week View
**Status**: Not Implemented  
**Priority**: 🟡 High  
**Description**: Add week view between month and day:
- Year → Month → Week → Day navigation
- Show 7 days in circular format
- Navigate weeks with arrow keys

**Current State**: Only year, month, and day views exist.

**Acceptance Criteria**:
- Week view displays 7 days
- Week view is keyboard accessible
- Week view integrates with existing navigation

---

### 14. Today Button/Shortcut
**Status**: Not Implemented  
**Priority**: 🟡 High  
**Description**: Quick navigation to today's date:
- "Today" button in UI
- Keyboard shortcut "T"
- Visual highlight of today

**Current State**: Today is highlighted but no quick navigation.

**Acceptance Criteria**:
- Today button is accessible
- Keyboard shortcut works
- Today is clearly indicated

---

### 15. Selected Date Display
**Status**: Partially Implemented  
**Priority**: 🟡 High  
**Description**: Clear display of selected date/time:
- Prominent display of selected date
- Format: "15 January 2024, 2:30 PM"
- Editable date display (future enhancement)

**Current State**: Selected date shown in centre but format could be clearer.

**Acceptance Criteria**:
- Selected date is prominently displayed
- Format is clear and readable
- Display updates on selection

---

## 🟢 Medium Priority: Enhancement Features

### 16. Dark Mode
**Status**: Not Implemented  
**Priority**: 🟢 Medium  
**Description**: Alternative colour scheme for low-light environments:
- Respects `prefers-color-scheme: dark`
- Maintains contrast ratios
- Seasonal colours adapted for dark mode

**Current State**: Only light mode exists.

**Acceptance Criteria**:
- Dark mode maintains all contrast requirements
- Colours are adapted appropriately
- Toggle or automatic detection

---

### 17. Internationalisation (i18n)
**Status**: Partially Implemented  
**Priority**: 🟢 Medium  
**Description**: Support for multiple languages and locales:
- Month names in different languages
- Weekday labels
- Date formats (DD/MM vs MM/DD)
- RTL support for Arabic/Hebrew

**Current State**: Only en-GB locale supported.

**Acceptance Criteria**:
- Multiple languages supported
- Locale-specific date formats
- RTL layout support
- Configurable via options

---

### 18. Touch Gestures
**Status**: Not Implemented  
**Priority**: 🟢 Medium  
**Description**: Enhanced touch interactions:
- Swipe to navigate months
- Pinch to zoom (future)
- Long-press for context menu (future)

**Current State**: Only tap interactions work.

**Acceptance Criteria**:
- Swipe gestures are intuitive
- Gestures don't conflict with scrolling
- Gestures work on mobile devices

### 21. Voice Navigation Support
**Status**: Not Implemented  
**Priority**: 🟢 Medium  
**Description**: Voice commands for date selection:
- "Select January 15th"
- "Go to next month"
- Browser API integration where available

**Current State**: No voice support.

**Acceptance Criteria**:
- Voice commands work reliably
- Commands are discoverable
- Fallback for unsupported browsers

---

### 22. Animation and Micro-interactions
**Status**: Not Implemented  
**Priority**: 🟢 Medium  
**Description**: Delightful animations:
- Segment hover animations
- Selection ripple effects
- Smooth transitions
- Respects `prefers-reduced-motion`

**Current State**: Minimal animations.

**Acceptance Criteria**:
- Animations enhance UX without distracting
- Performance is maintained
- Accessibility preferences respected

---

### 26. Analytics Integration
**Status**: Not Implemented  
**Priority**: ⚪ Low  
**Description**: Track usage patterns:
- Interaction methods (keyboard vs mouse)
- Feature usage
- Error tracking
- Performance metrics

**Note**: Privacy-respecting, GDPR-compliant.

---

### 27. A/B Testing Support
**Status**: Not Implemented  
**Priority**: ⚪ Low  
**Description**: Support for testing different UX approaches:
- Feature flags
- Variant testing
- User preference tracking

---

## Implementation Notes

### Testing Requirements
All features must:
- Follow TDD workflow (tests first)
- Include accessibility tests
- Test with screen readers (NVDA, JAWS, VoiceOver)
- Test keyboard navigation
- Test touch interactions
- Verify WCAG 2.1 AA compliance

### Priority Order Recommendation
1. **Phase 1 (Critical)**: Items 1-8 (Accessibility features)
2. **Phase 2 (High)**: Items 9-15 (Core UX features)
3. **Phase 3 (Medium)**: Items 16-23 (Enhancements)
4. **Phase 4 (Low)**: Items 24-27 (Future considerations)

### Dependencies
- Accessibility features (Phase 1) should be completed before Ticketlab integration
- Week view (13) may require refactoring navigation structure
- Internationalisation (17) may affect date formatting utilities
- Event integration (19) requires Ticketlab API design

---

**Last Updated**: 2024  
**Next Review**: After Phase 1 completion
