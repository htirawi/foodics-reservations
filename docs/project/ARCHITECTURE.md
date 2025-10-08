# 🏗️ Architecture Overview

This document explains the overall architecture and design patterns used in the Foodics Reservations application.

## 🎯 **Architectural Principles**

### 1. **Feature-First Architecture**
The application is organized around **features** rather than technical layers:

```
src/
  features/
    branches/           # 🎯 Branches feature
      components/       # Feature-specific UI
      composables/      # Feature-specific logic
      stores/           # Feature-specific state
      services/         # Feature-specific API
      views/            # Feature-specific pages
  components/           # 🌍 Global components (reusable)
  composables/          # 🌍 Global composables (reusable)
  services/             # 🌍 Cross-feature services
  stores/               # 🌍 Cross-feature state
```

### 2. **Separation of Concerns**
Each layer has a specific responsibility:

| Layer | Responsibility | Example |
|-------|---------------|---------|
| **Views** | Route-level screens | `BranchesListView.vue` |
| **Components** | UI pieces (tiny) | `BranchesTable.vue` |
| **Composables** | Reusable logic (no DOM) | `useBranchSelection()` |
| **Stores** | State management | `branches.store.ts` |
| **Services** | API communication | `branches.service.ts` |

### 3. **Global vs Feature-Scoped**

#### 🌍 **Global** (Reusable across features)
- **Components**: `BaseButton`, `UiModal`, `LocaleSwitcher`
- **Composables**: `useToast()`, `useModal()`, `useAsyncAction()`
- **Services**: `httpClient` (centralized HTTP)
- **Types**: `ApiError`, `Toast`, `ModalOptions`

#### 🎯 **Feature-Scoped** (Branches-specific)
- **Components**: `BranchesTable`, `AddBranchesModal`
- **Composables**: `useBranchSelection()`, `useSettingsForm()`
- **Services**: `BranchesService` (branches API calls)
- **Types**: `Branch`, `ReservationTimes`

## 🧩 **Component Architecture**

### **Two-Tier Component System**

```
Global Components (src/components/)
├── ui/                    # Primitives
│   ├── BaseButton.vue     # Generic button
│   ├── BaseModal.vue      # Generic modal
│   ├── BaseInput.vue      # Generic input
│   └── ...
└── layout/                # Layout components
    ├── AppHeader.vue      # App header
    └── Toaster.vue        # Toast notifications

Feature Components (src/features/branches/components/)
├── BranchesTable.vue      # Branch-specific table
├── AddBranchesModal.vue   # Branch-specific modal
└── ...
```

### **Component Size Limits**
- **SFC**: ≤ 150 lines total
- **Script**: ≤ 120 lines
- **Complexity**: ≤ 8 (cyclomatic)
- **Max Depth**: ≤ 2 (nesting)

### **Component Responsibilities**

#### ✅ **Components SHOULD**
- Handle props/emits
- Manage small local state
- Wire up composables/stores
- Structure the template
- Handle simple event handlers

#### ❌ **Components SHOULD NOT**
- Make direct API calls
- Contain business logic
- Have complex async operations
- Exceed size limits

## 🔧 **Composable Architecture**

### **Global Composables** (`src/composables/`)
Reusable logic that can be used by any feature:

```typescript
// useAsyncAction.ts - Handle loading states
const { busy, error, run } = useAsyncAction();

// useToast.ts - Show notifications
const { success, error, warning } = useToast();

// useModal.ts - Modal state management
const { isOpen, open, close } = useModal();

// useSelection.ts - Generic selection logic
const selection = useSelection(items);
```

### **Feature Composables** (`src/features/branches/composables/`)
Logic specific to a feature:

```typescript
// useBranchSelection.ts - Branch-specific selection
const branchSelection = useBranchSelection(branches);

// useSettingsForm.ts - Settings form logic
const settingsForm = useSettingsForm(initialData);
```

### **Composable Patterns**

#### 1. **State Management**
```typescript
export function useFeature() {
  const state = ref(initialValue);
  const computed = computed(() => /* derived value */);
  
  return {
    state,
    computed,
    // ... actions
  };
}
```

#### 2. **Async Operations**
```typescript
export function useAsyncFeature() {
  const { busy, error, run } = useAsyncAction();
  
  const performAction = () => run(async () => {
    // async operation
  });
  
  return { busy, error, performAction };
}
```

## 🗃️ **State Management (Pinia)**

### **Store Structure**

#### **Global Stores** (`src/stores/`)
```typescript
// ui.store.ts - Global UI state
export const useUIStore = defineStore('ui', () => {
  const toasts = ref<Toast[]>([]);
  const modals = ref<Record<string, boolean>>({});
  
  return { toasts, modals, /* actions */ };
});
```

#### **Feature Stores** (`src/features/branches/stores/`)
```typescript
// branches.store.ts - Feature-specific state
export const useBranchesStore = defineStore('branches', () => {
  const branches = ref<Branch[]>([]);
  const loading = ref(false);
  
  return { branches, loading, /* actions */ };
});
```

### **Store Patterns**

#### 1. **Data Fetching**
```typescript
const fetchBranches = async () => {
  loading.value = true;
  try {
    branches.value = await BranchesService.getBranches();
  } catch (error) {
    // handle error
  } finally {
    loading.value = false;
  }
};
```

#### 2. **Optimistic Updates**
```typescript
const updateBranch = async (id: string, data: Partial<Branch>) => {
  // Optimistic update
  const branch = branches.value.find(b => b.id === id);
  if (branch) {
    Object.assign(branch, data);
  }
  
  try {
    await BranchesService.updateBranch(id, data);
  } catch (error) {
    // Rollback on error
    await fetchBranches();
  }
};
```

## 🌐 **Service Layer**

### **HTTP Client** (`src/services/http.ts`)
Centralized Axios instance with:
- **Base URL**: `/api` (proxied to Foodics API)
- **Authentication**: Bearer token from env
- **Error Handling**: Normalized error format
- **Interceptors**: Request/response transformation

### **API Services** (`src/services/`)
Feature-specific API calls:

```typescript
// branches.service.ts
export const BranchesService = {
  async getBranches(): Promise<Branch[]>,
  async enableBranch(id: string): Promise<Branch>,
  async disableBranch(id: string): Promise<Branch>,
  async updateBranchSettings(id: string, payload: UpdateBranchSettingsPayload): Promise<Branch>,
};
```

### **Service Patterns**

#### 1. **Typed Responses**
```typescript
const { data } = await httpClient.get<FoodicsResponse<Branch[]>>('/branches');
return data.data; // Type-safe extraction
```

#### 2. **Error Normalization**
```typescript
// All errors follow the same format
interface ApiError {
  status: number;
  message: string;
  details?: unknown;
}
```

## 🔧 **Utility Functions (Utils)**

### **Pure Helpers** (`src/utils/` & `src/features/branches/utils/`)
Utility functions that contain pure, reusable logic extracted from components to keep them tiny:

```
src/utils/
  ├── tables.ts          # Table-related helpers (counting, formatting)

src/features/branches/utils/
  ├── time.ts            # Time parsing/comparison utilities
  ├── slot.operations.ts # Slot overlap detection, normalization
  ├── slot.validation.ts # Slot validation rules and error handling
  └── reservation.validation.ts # Aggregated validation utilities
```

### **Why Utils?**
- **Keep components tiny** - Extract complex logic to maintain SFC size limits (≤150 lines)
- **Pure functions** - No side effects, easy to test in isolation
- **Reusable** - Can be used across multiple components/features
- **Type-safe** - Fully typed with TypeScript strict mode

### **Time & Slot Utils** (`src/features/branches/utils/`)

#### **Time Utilities** (`time.ts`)
Pure functions for parsing and comparing HH:mm time strings:

```typescript
// Parse HH:mm string to hours/minutes object
parseHHmm(s: string): { h: number; m: number } | null

// Convert time object to minutes
toMinutes(time: { h: number; m: number }): number

// Validate HH:mm format
isHHmm(s: string): boolean

// Compare two HH:mm strings (-1, 0, 1)
compareHHmm(a: string, b: string): -1 | 0 | 1

// Convert HH:mm to total minutes
timeToMinutes(time: string): number | null
```

**Benefits:**
- ✅ Type-safe time parsing and validation
- ✅ Consistent time comparison across features
- ✅ Pure functions (no side effects)
- ✅ Comprehensive unit tests (25+ test cases)

#### **Slot Operations** (`slot.operations.ts`)
Functions for managing time slot arrays:

```typescript
// Check if two slots overlap (touching allowed)
slotOverlaps(slot1: SlotTuple, slot2: SlotTuple): boolean

// Sort slots by start time, remove duplicates
normalizeSlots(slots: SlotTuple[]): SlotTuple[]
```

**Benefits:**
- ✅ Handles edge cases (touching slots, duplicates)
- ✅ Consistent slot ordering
- ✅ Pure functions for easy testing

#### **Slot Validation** (`slot.validation.ts`)
Comprehensive validation rules for time slots:

```typescript
// Check if slot spans overnight (22:00-02:00)
isOvernightRange(slot: SlotTuple): boolean

// Validate start < end time
isValidSlotOrder(slot: SlotTuple): boolean

// Validate single slot against all rules
validateSingleSlot(slot: SlotTuple, index: number, allSlots: SlotTuple[]): string | null

// Validate all slots for a day (max 3, no overlaps)
validateDaySlots(slots: SlotTuple[]): { ok: boolean; errors: string[] }

// Validate entire reservation times object
validateReservationTimes(reservationTimes: ReservationTimes): ReservationTimesValidation
```

**Benefits:**
- ✅ Returns i18n error keys for user-friendly messages
- ✅ Enforces business rules (max 3 slots, no overnight)
- ✅ Comprehensive validation coverage
- ✅ Structured error reporting

### **Tables Utils** (`src/utils/tables.ts`)

#### **`reservableTablesCount(sections)`**
Counts tables across all sections where `accepts_reservations === true`.

```typescript
// Usage in component
import { reservableTablesCount } from '@/utils/tables';

const count = computed(() => {
  return reservableTablesCount(branch.value?.sections);
});
```

**Benefits:**
- ✅ Null-safe (handles undefined/empty sections)
- ✅ Pure function (no side effects)
- ✅ Fully tested (14 unit tests)
- ✅ Type-safe

#### **`formatTableLabel(sectionName, tableName, t)`**
Formats a table label as "Section Name – Table Name" with i18n fallbacks.

```typescript
// Usage in component
import { formatTableLabel } from '@/utils/tables';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const label = formatTableLabel(section.name, table.name, t);
// → "Main Hall – Table 1"
// → "Unnamed Section – Table 2" (when section.name is null)
```

**Benefits:**
- ✅ Handles null/undefined names gracefully
- ✅ i18n-aware (uses translation function)
- ✅ Consistent formatting across UI
- ✅ Pure function

### **Utils Best Practices**

#### ✅ **DO**
- Extract complex logic from components
- Write pure functions (no side effects)
- Add comprehensive unit tests
- Use TypeScript strict types
- Include JSDoc comments

#### ❌ **DON'T**
- Put DOM manipulation in utils
- Add side effects (API calls, store mutations)
- Use utils for component-specific logic (use composables instead)
- Skip types or tests

### **Utils vs Composables**

| Utils | Composables |
|-------|-------------|
| Pure functions | Can have state/effects |
| No Vue dependencies | Use Vue APIs (ref, computed, etc.) |
| Simple transformations | Complex logic with lifecycle |
| Easy to test | Require Vue test utils |

**Rule of thumb:** If it needs `ref`, `computed`, or lifecycle hooks → composable. If it's a pure transformation → util.

## 📁 **Type System**

### **Type Organization** (`src/types/`)

#### **API Types**
- `api.ts` - HTTP response/error types
- `foodics.ts` - Foodics API data types

#### **UI Types**
- `ui.ts` - UI component types
- `toast.ts` - Toast notification types
- `modal.ts` - Modal configuration types

#### **Feature Types**
- `selection.ts` - Selection state types
- `validation.ts` - Form validation types
- `duration.ts` - Duration field types

### **Type Patterns**

#### 1. **Strict TypeScript**
```typescript
// No 'any' or 'unknown' allowed
// All types must be explicit
interface StrictInterface {
  id: string;
  name: string;
  settings: BranchSettings;
}
```

#### 2. **Generic Types**
```typescript
// Reusable generic types
interface SelectionState<T extends SelectableItem> {
  selectedIds: Ref<string[]>;
  selectedItems: Ref<T[]>;
  // ...
}
```

## 🔄 **Data Flow**

### **Component → Composable → Store → Service → API**

```
Component (UI)
    ↓ (calls composable)
Composable (logic)
    ↓ (calls store action)
Store (state management)
    ↓ (calls service)
Service (API layer)
    ↓ (HTTP request)
External API
```

### **Example Flow: Enable Branch**

1. **Component**: User clicks "Enable" button
2. **Composable**: `useBranchActions().enableBranch(id)`
3. **Store**: `branchesStore.enableBranch(id)`
4. **Service**: `BranchesService.enableBranch(id)`
5. **API**: `PUT /branches/{id}` with `accepts_reservations: true`
6. **Response**: Updated branch data flows back through the chain

## 🎨 **Styling Architecture**

### **Tailwind CSS**
- **Design Tokens**: Consistent spacing, colors, typography
- **Mobile-First**: Responsive design from mobile up
- **RTL Support**: Logical properties for Arabic support

### **Component Styling**
```vue
<template>
  <button :class="buttonClasses">
    <slot />
  </button>
</template>

<script setup>
const buttonClasses = computed(() => {
  const base = "inline-flex items-center justify-center font-medium";
  const variants = {
    primary: "bg-primary-600 text-white hover:bg-primary-700",
    danger: "bg-danger-600 text-white hover:bg-danger-700",
  };
  return [base, variants[props.variant]].join(" ");
});
</script>
```

## 🌍 **Internationalization (i18n)**

### **Structure**
```
src/app/i18n/
├── index.ts              # i18n setup
└── locales/
    ├── en.json           # English translations
    └── ar.json           # Arabic translations
```

### **Usage Patterns**
```vue
<template>
  <h1>{{ $t('app.title') }}</h1>
  <p>{{ $t('branches.count', { count: branches.length }) }}</p>
</template>

<script setup>
const { t } = useI18n();
const title = t('app.title');
</script>
```

### **RTL Support**
```vue
<template>
  <div class="flex items-center gap-4">
    <!-- Uses logical properties for RTL -->
    <span class="ms-4">Arabic text</span>
  </div>
</template>
```

## 🧪 **Testing Architecture**

### **Test Structure**
```
tests/
├── unit/                 # Unit tests (mirrors src/)
│   ├── components/       # Component tests
│   ├── composables/      # Composable tests
│   ├── stores/           # Store tests
│   └── services/         # Service tests
└── e2e/                  # E2E tests
    ├── fixtures/         # Mock data
    ├── setup/            # Test setup
    └── *.spec.ts         # E2E test files
```

### **Testing Patterns**

#### 1. **Unit Tests** (Vitest)
```typescript
describe('useAsyncAction', () => {
  it('should handle async operations', async () => {
    const { busy, run } = useAsyncAction();
    
    expect(busy.value).toBe(false);
    
    const result = await run(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
      return 'success';
    });
    
    expect(result).toBe('success');
    expect(busy.value).toBe(false);
  });
});
```

#### 2. **E2E Tests** (Playwright)
```typescript
test('should enable branch', async ({ page }) => {
  await page.goto('/branches');
  await page.click('[data-testid="enable-branch-1"]');
  await expect(page.locator('[data-testid="branch-status-1"]')).toHaveText('Enabled');
});
```

## 📋 **Key Architectural Decisions**

### ✅ **Why These Choices?**

1. **Feature-First**: Easier to scale, teams can work independently
2. **Tiny Components**: Easier to test, understand, and maintain
3. **Composables**: Reusable logic without framework coupling
4. **Pinia**: Simple, TypeScript-friendly state management
5. **Centralized HTTP**: Consistent error handling and authentication
6. **Strict TypeScript**: Catches errors at compile time
7. **Tailwind**: Rapid development with consistent design
8. **i18n/RTL**: Global-ready from day 1

### 🚀 **Benefits**

- **Maintainable**: Clear separation of concerns
- **Scalable**: Easy to add new features
- **Testable**: Each layer can be tested independently
- **Type-Safe**: Compile-time error checking
- **Accessible**: A11y considerations built-in
- **Global**: Multi-language and RTL support

---

This architecture provides a solid foundation for building and maintaining a complex Vue 3 application while following industry best practices.
