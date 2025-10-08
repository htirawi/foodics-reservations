# 🛠️ Utils & Pure Functions Documentation

**Updated**: CARD 10 - Pure time/slots validation with i18n support  
**Status**: Active

---

## Overview

This document covers all pure utility functions in the codebase. Utils are **pure functions** that contain reusable logic extracted from components to keep them tiny and maintainable.

## 🎯 **Core Principles**

### ✅ **What Utils ARE**
- **Pure functions** - No side effects, no DOM, no external dependencies
- **Type-safe** - Strictly typed with TypeScript, no `any` or `unknown`
- **Testable** - Easy to test in isolation with comprehensive unit tests
- **Reusable** - Can be used across multiple components/features
- **i18n-ready** - Return error keys (not messages) for UI translation

### ❌ **What Utils ARE NOT**
- Vue composables (use `ref`, `computed`, lifecycle hooks)
- Components with DOM manipulation
- Services with API calls
- Stores with state management

---

## 📁 **Utils Structure**

```
src/utils/                    # Global utils
├── time.ts                   # Time parsing/formatting (pure, no Date libs)
├── slots.ts                  # Slot validation and operations
└── tables.ts                 # Table counting and formatting

src/features/branches/utils/   # Feature-specific utils
├── reservation.validation.ts  # Aggregated validation utilities
└── (legacy files - being migrated to global utils)
```

---

## ⏰ **Time Utilities** (`src/utils/time.ts`)

**Purpose**: Pure time parsing, formatting, and conversion without Date libraries.

### **Core Functions**

#### `parseTime(input: string): { h: number; m: number } | null`
Parses HH:mm format string to hours/minutes object.

```typescript
parseTime("09:30"); // { h: 9, m: 30 }
parseTime("00:00"); // { h: 0, m: 0 }
parseTime("23:59"); // { h: 23, m: 59 }
parseTime("9:30");  // null (missing zero-pad)
parseTime("24:00"); // null (invalid hour)
```

#### `formatTime(h: number, m: number): string`
Formats hours/minutes to zero-padded HH:mm string.

```typescript
formatTime(9, 30);  // "09:30"
formatTime(0, 5);   // "00:05"
formatTime(23, 59); // "23:59"
```

#### `toMinutes(time: { h: number; m: number }): number`
Converts time object to total minutes since midnight.

```typescript
toMinutes({ h: 9, m: 30 });  // 570
toMinutes({ h: 0, m: 0 });   // 0
toMinutes({ h: 23, m: 59 }); // 1439
```

#### `fromMinutes(total: number): { h: number; m: number }`
Converts total minutes to time object (clamped to valid range).

```typescript
fromMinutes(570);   // { h: 9, m: 30 }
fromMinutes(0);     // { h: 0, m: 0 }
fromMinutes(1439);  // { h: 23, m: 59 }
fromMinutes(-10);   // { h: 0, m: 0 } (clamped)
fromMinutes(2000);  // { h: 23, m: 59 } (clamped)
```

### **Roundtrip Guarantees**
```typescript
// parseTime → toMinutes → fromMinutes → formatTime
const original = "09:30";
const parsed = parseTime(original);      // { h: 9, m: 30 }
const minutes = toMinutes(parsed!);      // 570
const back = fromMinutes(minutes);       // { h: 9, m: 30 }
const formatted = formatTime(back.h, back.m); // "09:30"
// formatted === original ✅
```

### **Benefits**
- ✅ **Pure functions** - No Date libraries, no side effects
- ✅ **Type-safe** - Strict TypeScript types
- ✅ **Comprehensive tests** - 25+ unit tests covering edge cases
- ✅ **Consistent** - Same time handling across all features

---

## 🕐 **Slot Utilities** (`src/utils/slots.ts`)

**Purpose**: Time slot validation, overlap detection, and operations.

### **Core Functions**

#### `isValidRange(slot: SlotTuple): ValidationResult`
Validates single slot `[start, end]` for format and order.

```typescript
isValidRange(["09:00", "12:00"]); // { ok: true }
isValidRange(["9:00", "12:00"]);  // { ok: false, error: "settings.slots.errors.format" }
isValidRange(["12:00", "09:00"]); // { ok: false, error: "settings.slots.errors.order" }
isValidRange(["12:00", "12:00"]); // { ok: false, error: "settings.slots.errors.order" }
```

#### `isOverlapping(a: SlotTuple, b: SlotTuple): boolean`
Checks if two slots overlap strictly (touching is allowed).

```typescript
isOverlapping(["09:00", "12:00"], ["10:00", "13:00"]); // true (overlap)
isOverlapping(["09:00", "12:00"], ["12:00", "15:00"]); // false (touching)
isOverlapping(["09:00", "10:00"], ["11:00", "12:00"]); // false (separate)
```

#### `canAddSlot(existing: SlotTuple[], candidate: SlotTuple, max = 3): ValidationResult`
Validates if candidate slot can be added to existing slots.

```typescript
canAddSlot([["09:00", "12:00"]], ["13:00", "15:00"]); // { ok: true }
canAddSlot([["09:00", "12:00"]], ["10:00", "13:00"]); // { ok: false, error: "settings.slots.errors.overlap" }
canAddSlot([["09:00", "10:00"], ["11:00", "12:00"], ["13:00", "14:00"]], ["15:00", "16:00"]);
// { ok: false, error: "settings.slots.errors.max" }
```

#### `copySaturdayToAll(rt: ReservationTimes): ReservationTimes`
Deep clones ReservationTimes and copies Saturday's slots to all other days.

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

#### `normalizeDay(slots: SlotTuple[]): SlotTuple[]`
Sorts and deduplicates slots for a single day.

```typescript
normalizeDay([["14:00", "15:00"], ["09:00", "10:00"], ["09:00", "10:00"]]);
// [["09:00", "10:00"], ["14:00", "15:00"]]
```

### **Error Keys**
Utils return **i18n keys** (not messages) for UI translation:

| Key | EN Message | AR Message |
|-----|-----------|-----------|
| `settings.slots.errors.format` | Use HH:mm (e.g., 09:30). | استخدم تنسيق HH:mm (مثل 09:30). |
| `settings.slots.errors.order` | Start time must be before end time. | يجب أن يكون وقت البداية قبل وقت النهاية. |
| `settings.slots.errors.overlap` | Slots must not overlap. | يجب ألا تتداخل الفترات. |
| `settings.slots.errors.max` | At most 3 slots per day. | 3 فترات كحد أقصى في اليوم. |

### **Benefits**
- ✅ **i18n-ready** - Returns error keys for UI translation
- ✅ **Business rules** - Enforces max 3 slots, no overlaps
- ✅ **Pure functions** - No side effects, easy to test
- ✅ **Comprehensive** - 283 unit tests covering all scenarios

---

## 🪑 **Table Utilities** (`src/utils/tables.ts`)

**Purpose**: Table counting and formatting utilities.

### **Core Functions**

#### `reservableTablesCount(sections: ISection[] | undefined): number`
Counts tables across all sections where `accepts_reservations === true`.

```typescript
import { reservableTablesCount } from '@/utils/tables';

const count = computed(() => {
  return reservableTablesCount(branch.value?.sections);
});
```

#### `formatTableLabel(sectionName: string | null, tableName: string | null, t: (key: string) => string): string`
Formats table label as "Section Name – Table Name" with i18n fallbacks.

```typescript
import { formatTableLabel } from '@/utils/tables';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const label = formatTableLabel(section.name, table.name, t);
// → "Main Hall – Table 1"
// → "Unnamed Section – Table 2" (when section.name is null)
```

### **Benefits**
- ✅ **Null-safe** - Handles undefined/empty sections gracefully
- ✅ **Pure functions** - No side effects
- ✅ **Fully tested** - 14 unit tests
- ✅ **Type-safe** - Strict TypeScript types

---

## 🔧 **Reservation Validation** (`src/features/branches/utils/reservation.validation.ts`)

**Purpose**: Aggregated validation utilities for reservation settings.

### **Core Functions**

#### `sanitizeDuration(value: unknown, options?: IDurationOptions): number | null`
Sanitizes duration input to valid number within min/max range.

```typescript
sanitizeDuration(90, { min: 30, max: 180 }); // 90
sanitizeDuration("90", { min: 30, max: 180 }); // 90
sanitizeDuration(200, { min: 30, max: 180 }); // 180 (clamped)
sanitizeDuration("invalid", { min: 30, max: 180 }); // null
```

#### `isValidDuration(value: unknown, options?: IDurationOptions): value is number`
Type guard for valid duration values.

```typescript
isValidDuration(90, { min: 30, max: 180 }); // true
isValidDuration("invalid", { min: 30, max: 180 }); // false
```

### **Benefits**
- ✅ **Type-safe** - Proper TypeScript type guards
- ✅ **Flexible** - Handles various input types
- ✅ **Configurable** - Min/max duration options
- ✅ **Pure functions** - No side effects

---

## 🎯 **Usage Patterns**

### **In Components**
```vue
<template>
  <div v-if="error" class="text-red-600">
    {{ $t(error) }}
  </div>
</template>

<script setup lang="ts">
import { canAddSlot } from '@/utils/slots';
import { parseTime, formatTime } from '@/utils/time';

const result = canAddSlot(existingSlots, newSlot);
if (!result.ok) {
  errorMessage.value = $t(result.error); // Translates key
}
</script>
```

### **In Composables**
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

### **In Tests**
```typescript
// tests/unit/utils.slots.spec.ts
import { canAddSlot, isValidRange } from '@/utils/slots';

describe('canAddSlot', () => {
  it('should allow non-overlapping slots', () => {
    const existing = [["09:00", "12:00"]];
    const candidate = ["13:00", "15:00"];
    
    const result = canAddSlot(existing, candidate);
    expect(result.ok).toBe(true);
  });
});
```

---

## 🧪 **Testing Strategy**

### **Unit Tests**
- **Location**: `tests/unit/utils.*.spec.ts`
- **Coverage**: All functions with edge cases
- **Strategy**: Fast, deterministic, offline
- **Count**: 454+ unit tests passing

### **E2E Smoke Tests**
- **Location**: `tests/e2e/settings.day-slots.utils-wire.spec.ts`
- **Purpose**: Proves error keys → localized messages in UI
- **Strategy**: Offline with intercepts, EN & AR locales

---

## 📋 **Best Practices**

### ✅ **DO**
- Extract complex logic from components
- Write pure functions (no side effects)
- Add comprehensive unit tests
- Use TypeScript strict types
- Return i18n keys for error messages
- Include JSDoc comments

### ❌ **DON'T**
- Put DOM manipulation in utils
- Add side effects (API calls, store mutations)
- Use utils for component-specific logic (use composables instead)
- Skip types or tests
- Return hardcoded error messages

---

## 🔄 **Utils vs Composables**

| Utils | Composables |
|-------|-------------|
| Pure functions | Can have state/effects |
| No Vue dependencies | Use Vue APIs (ref, computed, etc.) |
| Simple transformations | Complex logic with lifecycle |
| Easy to test | Require Vue test utils |

**Rule of thumb**: If it needs `ref`, `computed`, or lifecycle hooks → composable. If it's a pure transformation → util.

---

## 🎓 **Interview Talking Points**

### **"How do you handle complex logic in components?"**
> "We extract complex logic to pure utility functions. For example, time slot validation is handled by pure functions in `src/utils/slots.ts` that return i18n error keys. This keeps components tiny (under 150 lines) and makes the logic testable and reusable."

### **"How do you ensure type safety in utilities?"**
> "All utils use strict TypeScript with no `any` or `unknown`. We have comprehensive unit tests (454+ tests) and the functions are pure with no side effects, making them easy to test and reason about."

### **"How do you handle internationalization in utilities?"**
> "Utils return i18n error keys rather than hardcoded messages. The UI translates these keys using `$t()`. This separates concerns - utils handle logic, UI handles presentation."

### **"What's your testing strategy for utilities?"**
> "We have comprehensive unit tests for all utils (time parsing, slot validation, table counting). We also have E2E smoke tests that verify error keys are properly translated in the UI for both EN and AR locales."

---

## 📚 **Related Documentation**

- [`ARCHITECTURE.md`](./ARCHITECTURE.md) - Overall system design
- [`COMPOSABLES_GLOBAL.md`](./COMPOSABLES_GLOBAL.md) - When to use composables vs utils
- [`TYPES.md`](./TYPES.md) - Type definitions used by utils
- [`SERVICES.md`](./SERVICES.md) - API layer (different from utils)

---

**Last updated**: CARD 10 - Pure time/slots validation with i18n support
