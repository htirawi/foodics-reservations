# Reservation Settings Modal - Structure & Implementation

**Purpose:** Modal shell for editing branch reservation settings (duration, tables, time slots)

**Card:** 6 - Reservation Settings Modal (structure only, no API coupling)

**Status:** ✅ Complete

---

## Overview

The Reservation Settings Modal is a structured, multi-section form that allows users to configure reservation settings for a branch. This implementation focuses on the UI structure, validation, and component composition without direct API coupling.

### Key Principles
- **Separation of Concerns:** Modal shell orchestrates child components; validation lives in pure utilities
- **Progressive Validation:** Field-level validation in children; aggregated validity in parent
- **No Service Imports:** No `@/services/**` or `axios` in `.vue` files; parent will wire save action later
- **Accessibility:** Full keyboard nav, focus trap, Esc to close, restore focus on close
- **i18n/RTL:** All strings translatable; RTL-safe layout with logical properties

---

## File Structure

```
src/features/branches/components/ReservationSettingsModal/
├── Index.vue              # Modal shell (orchestrator)
├── DurationField.vue      # Duration input with validation
├── TablesList.vue         # Read-only tables/sections display
└── DaySlotsEditor.vue     # Day-by-day slot editing

src/features/branches/utils/
└── reservation.validation.ts  # Pure validation functions

tests/unit/features/branches/
├── reservation.validation.spec.ts
├── ReservationSettingsModal.index.spec.ts
└── ReservationSettingsModal.children.spec.ts

tests/e2e/
└── branches.settings-modal.spec.ts
```

---

## Components

### 1. Index.vue (Modal Shell)

**Responsibilities:**
- Composes child sections (DurationField, TablesList, DaySlotsEditor)
- Manages overall form state (duration, reservation_times)
- Aggregates child validity into `isFormValid`
- Emits `save(payload)` with `UpdateBranchSettingsPayload`
- Emits `close()` on Cancel/Esc

**Props:**
```ts
{
  branch: Branch | null;  // null = show guard view
  isOpen: boolean;
}
```

**Emits:**
```ts
{
  save: [payload: UpdateBranchSettingsPayload];
  close: [];
}
```

**Behavior:**
- When `branch` is `null`: shows "No branch selected" and disables Save
- When `branch` is provided: initializes form with `branch.reservation_duration` and `branch.reservation_times`
- Save button enabled only when `isFormValid === true` (both duration and slots valid)
- Cancel/Esc closes modal and emits `close()`
- Uses `UiModal` with `role="dialog"`, `aria-modal="true"`, `aria-labelledby="settings-modal-title"`

**Test IDs:**
- `settings-modal` (modal root)
- `working-hours-info` (info banner)
- `settings-save` (Save button)
- `settings-cancel` (Cancel button)

---

### 2. DurationField.vue

**Responsibilities:**
- Displays numeric input for reservation duration (minutes)
- Validates using `isValidDuration()` from validation utils
- Emits `update:modelValue` and `update:valid` on changes

**Props:**
```ts
{
  modelValue: number;
  minDuration?: number;
  maxDuration?: number;
}
```

**Emits:**
```ts
{
  'update:modelValue': [value: number];
  'update:valid': [valid: boolean];
}
```

**Validation:**
- Required (non-zero)
- Must be >= 1 and <= 1440 (24 hours in minutes)
- Shows error message via `settings.validation.durationRequired` or `settings.validation.durationMin`

**Test IDs:**
- `settings-duration` (container)
- `duration-input` (BaseInput)

---

### 3. TablesList.vue (Read-Only)

**Responsibilities:**
- Displays branch sections and their tables
- Shows table names, IDs, and seat counts
- No editing in this card (structure only)

**Props:**
```ts
{
  sections: Section[] | undefined;
}
```

**Behavior:**
- Groups tables by section
- Shows "No sections available" when `sections` is empty or undefined
- Shows "No tables available" when a section has no tables
- Displays seat count if available: `(4 seats)`

**Test IDs:**
- `settings-tables` (container)
- `section-{sectionId}` (each section card)
- `table-{tableId}` (each table pill)

---

### 4. DaySlotsEditor.vue

**Responsibilities:**
- Renders per-weekday slot editors (Saturday–Friday)
- Validates slots using `validateDaySlots()` from validation utils
- Allows add/remove slot rows
- Provides "Apply to all days" action per day
- Emits `update:modelValue` and `update:valid` on changes

**Props:**
```ts
{
  modelValue: ReservationTimes;
}
```

**Emits:**
```ts
{
  'update:modelValue': [value: ReservationTimes];
  'update:valid': [valid: boolean];
}
```

**Validation:**
- Per slot: `isValidSlotTuple()` checks HH:mm format and end > start
- Per day: `validateDaySlots()` checks for overlaps
- Shows first error per day if any

**Test IDs:**
- `settings-day-slots` (container)
- `settings-slot-day-{day}` (each day card)
- `settings-slot-row-{day}-{index}` (each slot row)
- `add-slot-{day}` (Add button per day)
- `apply-all-{day}` (Apply to all days button)
- `error-{day}` (error message)

---

## Validation Utilities

**File:** `src/features/branches/utils/reservation.validation.ts`

**Pure Functions:**

| Function | Purpose |
|----------|---------|
| `isValidDuration(n: number): boolean` | Checks if duration is between 1 and 1440 |
| `isValidTimeFormat(time: string): boolean` | Validates HH:mm format (24-hour) |
| `timeToMinutes(time: string): number \| null` | Converts HH:mm to minutes since midnight |
| `isValidSlotTuple(tuple: SlotTuple): boolean` | Validates [start, end] tuple (format + end > start) |
| `slotsOverlap(slot1, slot2): boolean` | Checks if two slots overlap |
| `validateDaySlots(slots: SlotTuple[]): string[]` | Returns array of error messages for a day's slots |
| `isValidReservationTimes(rt: ReservationTimes): ReservationTimesValidation` | Validates entire weekly structure; returns `{ ok, errors }` |

**Key Rules:**
- Duration: 1 ≤ n ≤ 1440
- Time format: `HH:mm` (00:00 to 23:59)
- Slot validity: end time must be after start time
- Overlaps: slots on the same day cannot overlap

---

## Events & Data Flow

### Opening the Modal

```ts
// Parent component (e.g., BranchesListView)
<ReservationSettingsModal
  :branch="selectedBranch"
  :is-open="isSettingsModalOpen"
  @save="handleSettingsSave"
  @close="handleSettingsClose"
/>
```

### Save Flow

```
User fills form → DurationField emits update:valid
                → DaySlotsEditor emits update:valid
                → Index aggregates into isFormValid
                → User clicks Save
                → Index emits save({ reservation_duration, reservation_times })
                → Parent handles API call (not in this card)
```

### Close Flow

```
User clicks Cancel OR presses Esc
→ Index emits close()
→ Parent sets isOpen = false
→ Focus restored to opener (handled by UiModal)
```

---

## i18n Keys

**Added to `en.json` and `ar.json`:**

```json
{
  "settings": {
    "title": "Edit {branchName} branch reservation settings",
    "noBranch": "No branch selected",
    "workingHours": "Branch working hours are {from} - {to}",
    "duration": {
      "label": "Reservation Duration (minutes)",
      "placeholder": "Enter duration in minutes"
    },
    "tables": {
      "label": "Tables",
      "noTables": "No tables available",
      "noSections": "No sections available",
      "seats": "seats"
    },
    "slots": {
      "title": "Reservation Time Slots"
    },
    "days": {
      "saturday": "Saturday",
      "sunday": "Sunday",
      ...
    },
    "timeSlots": {
      "add": "Add Available Reservation Times",
      "applyToAll": "Apply on all days",
      ...
    },
    "actions": {
      "save": "Save",
      "close": "Close"
    },
    "validation": {
      "durationRequired": "Duration is required",
      "durationMin": "Duration must be at least 1 minute",
      ...
    }
  }
}
```

---

## Accessibility

### Keyboard Navigation
- **Tab:** Moves focus through modal elements (trapped within modal)
- **Shift+Tab:** Moves focus backward
- **Escape:** Closes modal and restores focus to opener
- **Enter:** On Save/Cancel buttons triggers action

### ARIA Attributes
- `role="dialog"` on modal container
- `aria-modal="true"` (locks screen reader to modal)
- `aria-labelledby="settings-modal-title"` (points to title div)
- All inputs have associated labels
- Error messages are announced (via BaseInput error prop)

### Focus Management
- Focus trapped within modal (handled by UiModal)
- First focusable element gets focus on open
- Focus restored to opener on close

### Screen Reader Considerations
- Section headings (Duration, Tables, Slots) use semantic headings
- Input labels and errors properly associated
- Buttons have clear, descriptive text

---

## RTL Support

### Layout
- Uses Tailwind logical properties (`inline-start`, `inline-end`)
- No hard-coded `left`/`right` positioning
- Modal and child components mirror correctly in RTL

### i18n
- All weekday names, labels, and messages translated to Arabic
- E2E tests run in both EN (LTR) and AR (RTL) modes
- `document.documentElement.dir` asserted in tests

---

## Testing Strategy

### Unit Tests

**validation.spec.ts:**
- Duration boundaries (0, 1, 1440, 1441)
- Time format validity (`09:00`, `9:00`, `25:00`)
- Slot tuple validity (end > start, invalid formats)
- Overlap detection (overlapping vs non-overlapping)
- Day-level validation (errors aggregated)
- Full reservation times validation (per-day errors)

**index.spec.ts:**
- Renders all sections when branch provided
- Shows guard view when branch is null
- Aggregates child validity into isFormValid
- Disables Save when invalid
- Emits save(payload) with correct shape
- Emits close() on Cancel/Esc

**children.spec.ts:**
- DurationField: emits updates, shows errors, emits valid flag
- TablesList: renders sections/tables, shows empty states
- DaySlotsEditor: add/remove rows, validates per day, applies to all days

### E2E Tests

**branches.settings-modal.spec.ts:**
- **EN Locale:**
  - Opens modal with all sections visible
  - Save disabled initially
  - Enables Save when form valid
  - Disables Save when duration invalid
  - Closes with Cancel/Esc
  - Keyboard nav (Tab, Escape)
  - Add/remove slots
  - Apply to all days
- **AR Locale:**
  - Renders in RTL (`dir="rtl"`)
  - Arabic text visible (weekday names)
  - Keyboard nav works in RTL
  - Functional operations work (add/remove)

**Offline Guarantee:**
- All API calls intercepted with `page.route()`
- No real network requests in E2E tests

---

## Design Parity

**Reference:** `docs/reference/` (general Foodics UI patterns)

**Tokens Applied:**
- **Spacing:** `p-4`, `p-6`, `gap-2`, `gap-3`, `space-y-4`, `space-y-6` (consistent rhythm)
- **Radii:** `rounded-lg` for cards/sections, `rounded-2xl` for modal container
- **Typography:** `text-sm`, `font-medium` for labels; `text-lg`, `font-semibold` for modal title
- **Colors:** `primary-*` for info banner, `neutral-*` for sections, `red-600` for errors
- **Layout:** Stacked sections in modal body; action buttons right-aligned

**Notes:**
- Modal uses UiModal with `size="xl"` for adequate width
- Section cards use `border`, `bg-neutral-50`, and padding for visual separation
- Focus states handled by BaseInput and BaseButton primitives

---

## Limitations & Future Work

**Current Scope (Card 6):**
- ✅ Modal structure and sections
- ✅ Field-level validation (duration, slots)
- ✅ Aggregated validity (Save button enabled/disabled)
- ✅ i18n EN/AR + RTL
- ✅ A11y (keyboard nav, focus trap, ARIA)
- ✅ Tests (unit + E2E offline)

**Out of Scope (Future Cards):**
- ❌ API integration (save action will be wired in parent or store later)
- ❌ Optimistic updates / rollback
- ❌ Toast notifications on save success/error
- ❌ Disable Reservations button (exists in old BranchSettingsModal, may be integrated later)

---

## Test IDs Reference

| Test ID | Component | Element |
|---------|-----------|---------|
| `settings-modal` | Index.vue | Modal root |
| `settings-modal-title` | Index.vue | Title div (for aria-labelledby) |
| `working-hours-info` | Index.vue | Info banner |
| `settings-save` | Index.vue | Save button |
| `settings-cancel` | Index.vue | Cancel button |
| `settings-duration` | DurationField.vue | Container |
| `duration-input` | DurationField.vue | BaseInput |
| `settings-tables` | TablesList.vue | Container |
| `section-{id}` | TablesList.vue | Section card |
| `table-{id}` | TablesList.vue | Table pill |
| `settings-day-slots` | DaySlotsEditor.vue | Container |
| `settings-slot-day-{day}` | DaySlotsEditor.vue | Day card |
| `settings-slot-row-{day}-{index}` | DaySlotsEditor.vue | Slot row (TimePill) |
| `add-slot-{day}` | DaySlotsEditor.vue | Add button |
| `apply-all-{day}` | DaySlotsEditor.vue | Apply to all button |
| `error-{day}` | DaySlotsEditor.vue | Error message |

---

## Commands

```bash
# Lint
npm run lint

# Type check
npm run typecheck

# Unit tests
npm run test:unit

# E2E tests (offline, EN & AR)
npx playwright install --with-deps
npm run test:e2e

# Run all quality gates
npm run test:ci
```

---

## Related Documentation

- [UI Modal](./UI_MODAL.md) - UiModal component reference
- [Components vs Composables](./COMPONENTS_VS_COMPOSABLES.md) - Architecture guidance
- [Master Study Guide](./MASTER_STUDY_GUIDE.md) - Complete project reference

---

**Status:** Ready for integration. Parent component can wire `@save` event to store/service in a future card.

