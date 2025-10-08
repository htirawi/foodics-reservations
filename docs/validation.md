## Validation & Utils

**Purpose:** Time/slots utilities, validation rules, and error mapping.

---

### Time Utils (`src/utils/time.ts`)

**Purpose:** Convert between minutes, hours, and formatted time strings.

**Functions:**

| Function | Input | Output | Purpose |
|----------|-------|--------|---------|
| `minutesToHours` | `number` | `number` | Convert minutes to hours (e.g., 90 → 1.5) |
| `hoursToMinutes` | `number` | `number` | Convert hours to minutes (e.g., 1.5 → 90) |
| `formatMinutesToTime` | `number` | `string` | Format minutes as HH:MM (e.g., 90 → "01:30") |
| `parseTimeToMinutes` | `string` | `number` | Parse HH:MM to minutes (e.g., "01:30" → 90) |

**Examples:**

```typescript
import { formatMinutesToTime, parseTimeToMinutes } from '@/utils/time';

formatMinutesToTime(90);  // "01:30"
formatMinutesToTime(785); // "13:05"

parseTimeToMinutes("01:30"); // 90
parseTimeToMinutes("13:05"); // 785
```

**Validation:**

- Times must be in 24-hour format
- Minutes must be ≥0 and ≤1440 (24 hours)
- Invalid input returns 0 or empty string (graceful degradation)

---

### Slots Utils (`src/utils/slots.ts`)

**Purpose:** Validate time slots (start < end, no overlap, within bounds).

**Types:**

```typescript
interface ITimeSlot {
  start: string; // "HH:MM"
  end: string;   // "HH:MM"
}

interface ISlotValidation {
  isValid: boolean;
  errors: string[]; // i18n error keys
}
```

**Functions:**

| Function | Purpose |
|----------|---------|
| `isValidTimeRange(start, end)` | Check if start < end |
| `doSlotsOverlap(slot1, slot2)` | Check if two slots overlap |
| `validateSlots(slots)` | Validate array of slots (range + overlap) |
| `isSlotWithinBounds(slot, min, max)` | Check if slot is within time bounds |

**Example:**

```typescript
import { validateSlots } from '@/utils/slots';

const slots = [
  { start: "09:00", end: "12:00" },
  { start: "13:00", end: "17:00" },
  { start: "11:00", end: "14:00" }, // Overlaps with first
];

const validation = validateSlots(slots);
// validation.isValid === false
// validation.errors === ['branches.settings.slots.overlap']
```

**Validation Rules:**

1. **Valid range**: `start < end` for each slot
2. **No overlap**: Slots must not overlap (touching is OK)
3. **Within bounds**: Slots must be within 00:00 – 23:59
4. **Max slots**: ≤3 slots per day (configurable via `MAX_SLOTS_PER_DAY` constant)

---

### Tables Utils (`src/utils/tables.ts`)

**Purpose:** Calculate max reservations per day based on tables.

**Functions:**

| Function | Input | Output | Purpose |
|----------|-------|--------|---------|
| `calculateMaxReservations` | `ITables` | `number` | Sum of all table capacities |
| `validateTables` | `ITables` | `IValidation` | Validate table counts are ≥0 |

**Example:**

```typescript
import { calculateMaxReservations } from '@/utils/tables';

const tables = {
  tables_2: 5,  // 5 tables for 2 people
  tables_4: 3,  // 3 tables for 4 people
  tables_6: 2,  // 2 tables for 6 people
};

const max = calculateMaxReservations(tables);
// max = (5 * 2) + (3 * 4) + (2 * 6) = 10 + 12 + 12 = 34
```

---

### Error Mapping (`src/composables/useErrorMapper.ts`)

**Purpose:** Map API errors to user-friendly i18n messages.

**Usage:**

```typescript
import { useErrorMapper } from '@/composables/useErrorMapper';

const { mapError } = useErrorMapper();

try {
  await updateBranch(id, payload);
} catch (error) {
  const message = mapError(error);
  // message is i18n key like 'errors.networkError' or 'errors.unauthorized'
  toast.add({ type: 'error', message: t(message) });
}
```

**Error Mappings:**

| HTTP Status | i18n Key |
|-------------|----------|
| 400 | `errors.badRequest` |
| 401 | `errors.unauthorized` |
| 403 | `errors.forbidden` |
| 404 | `errors.notFound` |
| 422 | `errors.validationError` |
| 500 | `errors.serverError` |
| Network | `errors.networkError` |

**Custom Errors:**

Domain-specific errors can be added:

```typescript
// In i18n locales
{
  "branches": {
    "errors": {
      "invalidSlots": "Time slots overlap or are invalid",
      "maxSlotsExceeded": "Maximum 3 time slots per day"
    }
  }
}
```

---

### Validation Patterns

**Regex Constants** (`src/constants/regex.ts`):

```typescript
export const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;
export const PHONE_PATTERN = /^\+?[1-9]\d{1,14}$/;
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
```

**Usage:**

```typescript
import { TIME_PATTERN } from '@/constants/regex';

const isValid = TIME_PATTERN.test("09:30"); // true
const isInvalid = TIME_PATTERN.test("25:00"); // false
```

---

### Testing Utils

**Unit tests** validate edge cases and error conditions:

```typescript
import { validateSlots } from '@/utils/slots';

describe('validateSlots', () => {
  it('should detect overlapping slots', () => {
    const slots = [
      { start: "09:00", end: "12:00" },
      { start: "11:00", end: "14:00" },
    ];
    const result = validateSlots(slots);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('branches.settings.slots.overlap');
  });

  it('should accept touching slots', () => {
    const slots = [
      { start: "09:00", end: "12:00" },
      { start: "12:00", end: "14:00" },
    ];
    const result = validateSlots(slots);
    expect(result.isValid).toBe(true);
  });
});
```

See `tests/unit/utils.*.spec.ts` for full test coverage.

---

### Best Practices

1. **Centralize validation**: Utils handle all domain validation logic
2. **Return i18n keys**: Errors are i18n keys, not hardcoded strings
3. **Pure functions**: Utils are stateless and side-effect-free
4. **Edge cases**: Test boundaries (midnight, 23:59, empty arrays)
5. **Graceful degradation**: Return safe defaults on invalid input

