# Validation & Utilities Documentation

**CARD 10** — Pure time and slot validation utilities

## Overview

This document covers pure TypeScript utility functions for time parsing/formatting and slot validation. All functions are:

- **Pure**: No side effects, no DOM, no Date libraries
- **Typed strictly**: No `any` or `unknown`
- **i18n-ready**: Return error keys (not messages); UI translates via `$t(key)`
- **Testable**: Offline, deterministic, fast

---

## Time Utils (`src/utils/time.ts`)

### Core Functions

#### `parseTime(input: string): { h: number; m: number } | null`

Parses a time string in HH:mm format (24-hour).

**Inputs:**
- `input` — Time string (e.g., `"09:30"`)

**Outputs:**
- Object `{ h: number; m: number }` if valid
- `null` if invalid format

**Examples:**
```typescript
parseTime("09:30"); // { h: 9, m: 30 }
parseTime("00:00"); // { h: 0, m: 0 }
parseTime("23:59"); // { h: 23, m: 59 }
parseTime("9:30");  // null (missing zero-pad)
parseTime("24:00"); // null (invalid hour)
```

**Invariants:**
- Accepts only `HH:mm` format (hours 00–23, minutes 00–59)
- Returns `null` for any invalid format

---

#### `formatTime(h: number, m: number): string`

Formats hours and minutes into zero-padded HH:mm string.

**Inputs:**
- `h` — Hours (0–23)
- `m` — Minutes (0–59)

**Outputs:**
- Zero-padded string (e.g., `"09:30"`)

**Examples:**
```typescript
formatTime(9, 30);  // "09:30"
formatTime(0, 5);   // "00:05"
formatTime(23, 59); // "23:59"
```

**Invariants:**
- Always zero-pads to 2 digits
- Pure (no Date libraries)

---

#### `toMinutes(time: { h: number; m: number }): number`

Converts `{ h, m }` to total minutes since midnight.

**Inputs:**
- `time` — Object with `h` and `m`

**Outputs:**
- Total minutes (0–1439)

**Examples:**
```typescript
toMinutes({ h: 9, m: 30 });  // 570
toMinutes({ h: 0, m: 0 });   // 0
toMinutes({ h: 23, m: 59 }); // 1439
```

---

#### `fromMinutes(total: number): { h: number; m: number }`

Converts total minutes since midnight to `{ h, m }`.

**Inputs:**
- `total` — Minutes since midnight

**Outputs:**
- Object `{ h: number; m: number }`

**Examples:**
```typescript
fromMinutes(570);   // { h: 9, m: 30 }
fromMinutes(0);     // { h: 0, m: 0 }
fromMinutes(1439);  // { h: 23, m: 59 }
fromMinutes(-10);   // { h: 0, m: 0 } (clamped)
fromMinutes(2000);  // { h: 23, m: 59 } (clamped)
```

**Invariants:**
- Clamps input to `[0..1439]`

---

### Roundtrip Guarantees

```typescript
// parseTime → toMinutes → fromMinutes → formatTime
const original = "09:30";
const parsed = parseTime(original);      // { h: 9, m: 30 }
const minutes = toMinutes(parsed!);      // 570
const back = fromMinutes(minutes);       // { h: 9, m: 30 }
const formatted = formatTime(back.h, back.m); // "09:30"
// formatted === original ✅
```

---

## Slot Utils (`src/utils/slots.ts`)

### Core Functions

#### `isValidRange(slot: SlotTuple): ValidationResult`

Validates a single slot `[start, end]` for format and order.

**Inputs:**
- `slot` — Tuple `[string, string]` (HH:mm format)

**Outputs:**
- `{ ok: true }` if valid
- `{ ok: false; error: string }` with i18n key if invalid

**Error keys:**
- `"settings.slots.errors.format"` — Invalid HH:mm format
- `"settings.slots.errors.order"` — Start >= end

**Examples:**
```typescript
isValidRange(["09:00", "12:00"]); // { ok: true }
isValidRange(["9:00", "12:00"]);  // { ok: false, error: "settings.slots.errors.format" }
isValidRange(["12:00", "09:00"]); // { ok: false, error: "settings.slots.errors.order" }
isValidRange(["12:00", "12:00"]); // { ok: false, error: "settings.slots.errors.order" }
```

**Invariants:**
- Checks format first, then order
- Requires start < end **strictly** (no equal times)

---

#### `isOverlapping(a: SlotTuple, b: SlotTuple): boolean`

Checks if two slot tuples overlap strictly.

**Inputs:**
- `a` — First slot tuple
- `b` — Second slot tuple

**Outputs:**
- `true` if slots overlap strictly
- `false` if touching or separate

**Examples:**
```typescript
isOverlapping(["09:00", "12:00"], ["10:00", "13:00"]); // true (overlap)
isOverlapping(["09:00", "12:00"], ["12:00", "15:00"]); // false (touching)
isOverlapping(["09:00", "10:00"], ["11:00", "12:00"]); // false (separate)
```

**Invariants:**
- Touching boundaries (e.g., `[09:00, 12:00]` and `[12:00, 15:00]`) is **not** overlap
- Returns `false` if either slot has invalid format

---

#### `canAddSlot(existing: SlotTuple[], candidate: SlotTuple, max = 3): ValidationResult`

Validates if a candidate slot can be added to existing slots.

**Inputs:**
- `existing` — Array of existing slot tuples
- `candidate` — Slot tuple to add
- `max` — Maximum slots allowed (default 3)

**Outputs:**
- `{ ok: true }` if valid
- `{ ok: false; error: string }` with i18n key if invalid

**Error keys (fail-fast order):**
1. `"settings.slots.errors.format"` — Invalid format
2. `"settings.slots.errors.order"` — Start >= end
3. `"settings.slots.errors.max"` — Already at max limit
4. `"settings.slots.errors.overlap"` — Overlaps existing slot

**Examples:**
```typescript
canAddSlot([["09:00", "12:00"]], ["13:00", "15:00"]); // { ok: true }
canAddSlot([["09:00", "12:00"]], ["10:00", "13:00"]); // { ok: false, error: "settings.slots.errors.overlap" }
canAddSlot([["09:00", "10:00"], ["11:00", "12:00"], ["13:00", "14:00"]], ["15:00", "16:00"]);
// { ok: false, error: "settings.slots.errors.max" }
```

**Invariants:**
- Validates format/order first
- Enforces max limit before checking overlaps
- Touching boundaries is allowed

---

#### `copySaturdayToAll(rt: ReservationTimes): ReservationTimes`

Deep clones `ReservationTimes` and copies Saturday's slots to all other days.

**Inputs:**
- `rt` — Original `ReservationTimes` object

**Outputs:**
- New `ReservationTimes` with Saturday copied to all days

**Examples:**
```typescript
const original = {
  saturday: [["09:00", "12:00"], ["14:00", "17:00"]],
  sunday: [["10:00", "13:00"]],
  monday: [],
  // ... other days
};

const result = copySaturdayToAll(original);
// All days now have: [["09:00", "12:00"], ["14:00", "17:00"]]
```

**Invariants:**
- Deep clone: modifying result does not affect original
- Saturday's slots are source of truth
- All days get new independent arrays

---

#### `normalizeDay(slots: SlotTuple[]): SlotTuple[]`

Sorts and deduplicates slots for a single day.

**Inputs:**
- `slots` — Array of slot tuples

**Outputs:**
- Sorted and deduplicated array

**Examples:**
```typescript
normalizeDay([["14:00", "15:00"], ["09:00", "10:00"], ["09:00", "10:00"]]);
// [["09:00", "10:00"], ["14:00", "15:00"]]
```

**Invariants:**
- Does not mutate original array
- Sorts by start time (ascending)
- Removes exact duplicates

---

## i18n Error Keys

Utils return **keys** (not messages). UI translates via `$t(key, params)`.

### Keys Used

| Key | EN Message | AR Message |
|-----|-----------|-----------|
| `settings.slots.errors.format` | Use HH:mm (e.g., 09:30). | استخدم تنسيق HH:mm (مثل 09:30). |
| `settings.slots.errors.order` | Start time must be before end time. | يجب أن يكون وقت البداية قبل وقت النهاية. |
| `settings.slots.errors.overlap` | Slots must not overlap. | يجب ألا تتداخل الفترات. |
| `settings.slots.errors.max` | At most 3 slots per day. | 3 فترات كحد أقصى في اليوم. |

**Usage in UI:**
```vue
<script setup lang="ts">
import { canAddSlot } from '@/utils/slots';

const result = canAddSlot(existingSlots, newSlot);
if (!result.ok) {
  errorMessage.value = $t(result.error); // Translates key
}
</script>
```

---

## Consumption Patterns

### In Composables

```typescript
// src/features/branches/composables/useDaySlotsEditor.ts
import { canAddSlot, isValidRange } from '@/utils/slots';
import type { SlotTuple } from '@/types/foodics';

export function useDaySlotsEditor() {
  const addSlot = (day: Weekday) => {
    const candidate: SlotTuple = ["09:00", "17:00"];
    const validation = canAddSlot(slots.value[day], candidate);
    
    if (!validation.ok) {
      errorKey.value = validation.error; // UI will $t(errorKey)
      return;
    }
    
    slots.value[day].push(candidate);
  };
}
```

### In Components (Tiny UI)

```vue
<template>
  <div v-if="error" class="text-red-600">
    {{ $t(error) }}
  </div>
</template>

<script setup lang="ts">
import { useDaySlotsEditor } from '@/features/branches/composables/useDaySlotsEditor';

const { error, addSlot } = useDaySlotsEditor();
</script>
```

---

## Testing

### Unit Tests

- Located in `tests/unit/utils.time.spec.ts` and `tests/unit/utils.slots.spec.ts`
- Cover all functions with edge cases
- Fast, deterministic, offline

**Run:**
```bash
npm run test:unit
```

### E2E Smoke Test

- Located in `tests/e2e/settings.day-slots.utils-wire.spec.ts`
- Proves error keys → localized messages in UI
- Offline with intercepts
- Tests both EN and AR locales

**Run:**
```bash
npx playwright test tests/e2e/settings.day-slots.utils-wire.spec.ts --project=chromium
LOCALE=ar npx playwright test tests/e2e/settings.day-slots.utils-wire.spec.ts --project=chromium
```

---

## Design Principles

1. **Pure functions**: No Date, no DOM, no globals, no side effects
2. **Strict typing**: No `any` or `unknown`; use types from `/types`
3. **i18n separation**: Utils return keys; UI translates
4. **Fail-fast**: Check cheapest validations first (format before overlap)
5. **No external libs**: Pure TypeScript only
6. **Testable**: Deterministic, fast, offline

---

## Related Files

- `src/utils/time.ts` — Time parsing/formatting
- `src/utils/slots.ts` — Slot validation
- `src/types/foodics.ts` — Type definitions (Weekday, SlotTuple, ReservationTimes)
- `tests/unit/utils.time.spec.ts` — Time utils tests
- `tests/unit/utils.slots.spec.ts` — Slot utils tests
- `tests/e2e/settings.day-slots.utils-wire.spec.ts` — UI wiring smoke test
- `src/app/i18n/locales/en.json` — EN i18n keys
- `src/app/i18n/locales/ar.json` — AR i18n keys

---

## Acceptance Criteria

✅ All functions pure (no Date/DOM/globals)  
✅ Strictly typed (no `any`/`unknown`)  
✅ Return i18n keys (not messages)  
✅ Unit tests pass (parse/format/minutes, order/overlap/max, deep-clone)  
✅ E2E smoke proves error keys → localized messages (EN/AR)  
✅ Lint/typecheck green  

---

**Last updated:** CARD 10 implementation

