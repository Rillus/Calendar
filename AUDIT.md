# Pull request audit

**PR:** [#9 — Draggable month circle alignment](https://github.com/Rillus/Calendar/pull/9)  
**Branch:** `cursor/draggable-month-circle-alignment-6253`  
**Base:** `master`  
**Audit date:** 2026-10-16  

## Title vs changes

| Aspect | Assessment |
|--------|------------|
| PR title | *Draggable month circle alignment* |
| Primary feature | Drag the **year (month) ring** and **month day ring** to change the selected date while the **sun stays fixed** as the angular reference. |
| Latest commit focus | Listener lifecycle (`AbortController`), shared `getMonthDayForAngleInYear`, committed `dist/` rebuild. |

**Verdict:** The title is **not drift**. It describes the user-facing interaction model (ring drag + sun-as-anchor alignment). The automated review commit is corrective maintenance on the same feature branch, not a unrelated scope change.

**Minor naming note:** The implementation covers both the year ring and the month day ring; the PR body is slightly more precise than the title alone.

## Automated review verification

### AbortController for ring drag handlers

- `yearRingDragAbort` and `monthDayRingDragAbort` abort prior document-level `mousemove` / `mouseup` / touch listeners when:
  - `setupYearRingDragHandlers` / `setupMonthDayRingDragHandlers` run again
  - `drawCalendar`, `clearYearView`, or `clearDaySelectionView` tear down a view
- Listeners registered on `document` use `{ signal }`, which addresses the leak reproduced by `should not notify twice for one drag move after redrawCalendar`.

**Correct:** Yes — scoped to ring drag; matches the regression test.

### Helper deduplication (`getMonthDayForAngleInYear`)

- Year-ring drag and sun drag both map a normalised angle to `{ monthIndex, dayInMonth }` via one helper.
- Month day ring uses separate `getDayForAngleInMonth` (appropriate: fixed month context).

**Correct:** Yes — behaviour stays consistent with fixed sun + optional `yearRingRotation`.

### CI / `dist` sync

- Workflow runs `npm run build` then fails if `git status` is dirty (`.github/workflows/tests.yml`).
- `npm run build` on this branch produces a clean tree; `dist/circular-calendar.min.js` includes the renderer changes from commit `d44b098`.

**Correct:** Yes.

## Test evidence

```text
npm ci && npm test
→ 13 files, 175 tests passed (Vitest 1.6.1)
```

Notable coverage added on this branch:

- Day ring drag updates date; sun `transform` unchanged
- Year ring drag updates month; sun static
- Post-drag click suppression (year and day views)
- Single notification after `drawCalendar()` during an in-flight year-ring drag

## Residual risks (out of automated review scope)

1. **Sun drag document listeners** — `setupSunDragHandlers` still attaches `document` listeners without `AbortController`. Each `showSunAndMoonForDate` → `hideSunAndMoon` cycle can leave orphaned handlers if the sun is recreated often (pre-existing pattern; not introduced by ring drag).
2. **Ring handler group listeners** — `mousedown` / `click` on the SVG group are not tied to `signal`; safe today because groups are removed from the DOM, but document listeners were the critical leak.
3. **No dedicated unit test** for `getMonthDayForAngleInYear` edge cases (wrap-around segments, leap February); behaviour is exercised indirectly via integration tests.

## Merge readiness

| Check | Status |
|-------|--------|
| Tests green locally | Pass |
| `dist/` matches build | Pass |
| Title matches feature scope | Pass |
| Ring listener leak fix | Pass |
| Documented in this audit | Pass |

**Recommendation:** Approve from a technical review standpoint; consider a follow-up to align sun-drag teardown with ring-drag `AbortController` pattern if `selectDate` / `setYear` churn becomes heavy.
