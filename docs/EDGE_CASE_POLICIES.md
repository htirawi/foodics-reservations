# Edge-Case Policies

## Overview

Edge-case policies define strict rules for handling boundary conditions in the Foodics Reservations system. All policies are implemented as pure functions in `src/utils/policies/` with comprehensive unit tests (150+ test cases).

## Policy Categories

### 1. Time Boundaries (`src/utils/policies/time-boundaries.ts`)

**Rules:**
- ✓ Allow `00:00` as start time
- ✓ Allow `23:59` as end time
- ✗ Reject overnight ranges (end ≤ start)
- ✓ Enforce minimum duration (1 minute)

**Edge Cases:**
- `00:00-00:01` → Valid (minimum at start of day)
- `23:58-23:59` → Valid (minimum at end of day)
- `00:00-23:59` → Valid (full day slot)
- `23:59-00:00` → Invalid (overnight)
- `12:00-12:00` → Invalid (zero duration)

### 2. Overlap Detection (`src/utils/policies/overlap-detection.ts`)

**Rules:**
- ✓ Touching boundaries allowed (a_end === b_start)
- ✗ Strict overlap forbidden (a_end > b_start && a_start < b_end)

**Edge Cases:**
- `[09:00,12:00]` + `[12:00,15:00]` → Valid (touching)
- `[09:00,12:01]` + `[12:00,15:00]` → Invalid (overlap by 1 min)
- `[00:00,01:00]` + `[01:00,02:00]` → Valid (edge-to-edge)

### 3. Slot Limits (`src/utils/policies/slot-limits.ts`)

**Rules:**
- ✓ Maximum 3 slots per day (business rule)
- ✗ 4th slot rejected with error `settings.slots.errors.max`

**Edge Cases:**
- 0 slots → Can add (0 < 3)
- 3 slots → Cannot add (3 >= 3)

### 4. Duration Bounds (`src/utils/policies/duration-bounds.ts`)

**Rules:**
- Min: 1 minute
- Max: 1440 minutes (24 hours)
- ✗ Reject ≤ 0, NaN, Infinity
- ✓ Clamp > max → max
- ✓ Floor floats

**Edge Cases:**
- `0` → null
- `1441` → 1440 (clamp)
- `15.7` → 15 (floor)
- `NaN` → null

### 5. Normalization (`src/utils/policies/normalization.ts`)

**Guarantees:**
- Idempotency: `f(f(x)) === f(x)`
- Stability: No mutation of input
- Deep clone: Result is independent copy

### 6. Null Safety (`src/utils/policies/null-safety.ts`)

**Rules:**
- ✗ Never throw exceptions
- ✓ Return null for invalid input
- ✓ Handle null, undefined, empty string gracefully

**Edge Cases:**
- `null` → `null`
- `undefined` → `null`
- `""` → `null`
- `"   "` → `null` (whitespace)

## Testing

- **Unit Tests:** 150+ test cases across 6 policy modules
- **Coverage:** 100% for all policy files
- **Location:** `tests/unit/utils/policies/`

## See Also

- [src/utils/policies/](../src/utils/policies/)
- [tests/unit/utils/policies/](../tests/unit/utils/policies/)
- [docs/UTILS.md](./UTILS.md)
- [docs/validation.md](./validation.md)
