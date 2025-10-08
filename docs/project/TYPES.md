# 📝 Types Reference

This document covers all type definitions in `src/types/`. These types provide type safety throughout the application.

## 📋 **Types Overview**

| File | Purpose | Key Types |
|------|---------|-----------|
| `api.ts` | HTTP and API types | `ApiError`, `FoodicsResponse` |
| `async.ts` | Async operation types | `AsyncActionState` |
| `confirm.ts` | Confirmation dialog types | `ConfirmOptions` |
| `duration.ts` | Duration field types | `UseDurationFieldOptions`, `UseDurationFieldReturn` |
| `foodics.ts` | Foodics API data types | `Weekday`, `SlotTuple` |
| `locale.ts` | Internationalization types | `SupportedLocale` |
| `modal.ts` | Modal component types | `ModalOptions` |
| `selection.ts` | Selection functionality types | `SelectableItem`, `SelectionState` |
| `toast.ts` | Toast notification types | `Toast` |
| `ui.ts` | UI store types | `ModalName`, `ConfirmDialogState` |
| `validation.ts` | Form validation types | `ValidationErrors` |

---

## 🌐 **API Types**

**File**: `src/types/api.ts`

### **ApiError**
```typescript
interface ApiError {
  status: number;        // HTTP status code
  message: string;       // Error message
  details?: unknown;     // Additional error details
}
```

**Usage**:
```typescript
try {
  await apiCall();
} catch (error: ApiError) {
  console.error(`Error ${error.status}: ${error.message}`);
  if (error.details) {
    console.error('Details:', error.details);
  }
}
```

### **FoodicsResponse**
```typescript
interface FoodicsResponse<T> {
  data: T;              // The actual response data
}
```

**Usage**:
```typescript
const { data } = await httpClient.get<FoodicsResponse<Branch[]>>('/branches');
const branches = data.data; // Extract the actual data
```

---

## ⚡ **Async Types**

**File**: `src/types/async.ts`

### **AsyncActionState**
```typescript
import type { Ref } from "vue";

interface AsyncActionState {
  busy: Ref<boolean>;           // Loading state
  error: Ref<string | null>;    // Error message
  reset: () => void;           // Reset function
}
```

**Usage**:
```typescript
const { busy, error, reset } = useAsyncAction();

// Use in component
<BaseButton :loading="busy" :disabled="busy">
  {{ busy ? 'Loading...' : 'Save' }}
</BaseButton>

// Handle errors
watch(error, (newError) => {
  if (newError) {
    console.error('Async error:', newError);
  }
});
```

---

## ✅ **Confirm Types**

**File**: `src/types/confirm.ts`

### **ConfirmOptions**
```typescript
interface ConfirmOptions {
  title: string;                                    // Dialog title
  message: string;                                  // Dialog message
  confirmText?: string;                             // Confirm button text
  cancelText?: string;                              // Cancel button text
  variant?: "danger" | "warning" | "info";         // Visual variant
}
```

**Usage**:
```typescript
const confirmed = await useConfirm({
  title: 'Delete Branch',
  message: 'Are you sure you want to delete this branch?',
  confirmText: 'Delete',
  cancelText: 'Cancel',
  variant: 'danger'
});

if (confirmed) {
  await deleteBranch();
}
```

---

## ⏱️ **Duration Types**

**File**: `src/types/duration.ts`

### **UseDurationFieldOptions**
```typescript
import type { Ref, ComputedRef } from "vue";

interface UseDurationFieldOptions {
  modelValue: number | null;     // Current duration value
  min?: number;                  // Minimum duration
  max?: number;                  // Maximum duration
}
```

### **UseDurationFieldReturn**
```typescript
interface UseDurationFieldReturn {
  rawValue: Ref<string>;                    // Raw input value
  isValid: ComputedRef<boolean>;           // Validation state
  error: ComputedRef<string | undefined>;  // Error message
  handleInput: (event: Event) => Promise<void>;  // Input handler
}
```

**Usage**:
```typescript
const durationField = useDurationField({
  modelValue: duration.value,
  min: 30,
  max: 480
});

// Use in component
<BaseInput
  v-model="durationField.rawValue.value"
  @input="durationField.handleInput"
  :class="{ 'border-red-500': !durationField.isValid.value }"
/>
```

---

## 🏢 **Foodics Types**

**File**: `src/types/foodics.ts`

### **Weekday**
```typescript
export type Weekday = 
  | "saturday" 
  | "sunday" 
  | "monday" 
  | "tuesday" 
  | "wednesday" 
  | "thursday" 
  | "friday";
```

### **SlotTuple**
```typescript
export type SlotTuple = [string, string];  // [startTime, endTime]
```

**Usage**:
```typescript
const reservationTimes: Record<Weekday, SlotTuple[]> = {
  saturday: [["09:00", "17:00"]],
  sunday: [["10:00", "16:00"]],
  monday: [["09:00", "17:00"]],
  tuesday: [["09:00", "17:00"]],
  wednesday: [["09:00", "17:00"]],
  thursday: [["09:00", "17:00"]],
  friday: [["09:00", "17:00"]]
};

// Type-safe weekday access
const getSlotsForDay = (day: Weekday): SlotTuple[] => {
  return reservationTimes[day] || [];
};
```

---

## 🌍 **Locale Types**

**File**: `src/types/locale.ts`

### **SupportedLocale**
```typescript
export type SupportedLocale = "en" | "ar";
```

**Usage**:
```typescript
const { currentLocale, setLocale } = useLocale();

// Type-safe locale switching
const switchToArabic = () => {
  setLocale('ar'); // ✅ Valid
};

const switchToFrench = () => {
  setLocale('fr'); // ❌ TypeScript error
};

// Type-safe locale checking
const isEnglish = currentLocale.value === 'en';
const isArabic = currentLocale.value === 'ar';
```

---

## 🪟 **Modal Types**

**File**: `src/types/modal.ts`

### **ModalOptions**
```typescript
interface ModalOptions {
  size?: "sm" | "md" | "lg" | "xl";  // Modal size
}
```

**Usage**:
```typescript
const { open, options } = useModal();

// Type-safe modal opening
const openSmallModal = () => {
  open({ size: 'sm' }); // ✅ Valid
};

const openInvalidModal = () => {
  open({ size: 'tiny' }); // ❌ TypeScript error
};

// Access modal options
const modalSize = options.value.size; // "sm" | "md" | "lg" | "xl" | undefined
```

---

## 🎯 **Selection Types**

**File**: `src/types/selection.ts`

### **SelectableItem**
```typescript
interface SelectableItem {
  id: string;  // Required ID for selection
}
```

### **SelectionState**
```typescript
import type { Ref, ComputedRef } from "vue";

interface SelectionState<T extends SelectableItem> {
  selectedIds: Ref<string[]>;                    // Selected item IDs
  selectedItems: Ref<T[]>;                      // Selected items
  selectedIdsSet: Ref<Set<string>>;             // Set for O(1) lookup
  isAllSelected: ComputedRef<boolean>;          // All items selected
  hasSelection: ComputedRef<boolean>;           // Any items selected
  selectionCount: ComputedRef<number>;          // Number of selected items
  isSelected: (id: string) => boolean;          // Check if item is selected
  toggleOne: (id: string) => void;              // Toggle single item
  toggleAll: () => void;                        // Toggle all items
  setSelected: (ids: string[]) => void;         // Set selected items
  clearSelection: () => void;                   // Clear selection
}
```

**Usage**:
```typescript
// Generic selection for any item with ID
interface Branch extends SelectableItem {
  id: string;
  name: string;
  status: string;
}

const branches = ref<Branch[]>([]);
const selection = useSelection(branches);

// Type-safe selection operations
const isBranchSelected = selection.isSelected('branch-1');
const selectedBranches = selection.selectedItems.value; // Branch[]

// Use with different item types
interface User extends SelectableItem {
  id: string;
  name: string;
  email: string;
}

const users = ref<User[]>([]);
const userSelection = useSelection(users); // Automatically typed as SelectionState<User>
```

---

## 🍞 **Toast Types**

**File**: `src/types/toast.ts`

### **Toast**
```typescript
interface Toast {
  id: string;                           // Unique identifier
  message: string;                      // Toast message
  type: "success" | "error" | "warning" | "info";  // Toast type
  duration?: number;                    // Auto-dismiss duration (0 = persistent)
}
```

**Usage**:
```typescript
const { show, success, error, warning, info } = useToast();

// Type-safe toast creation
const showSuccessToast = () => {
  success('Operation completed successfully!');
};

const showCustomToast = () => {
  show('Custom message', 'warning', 3000);
};

// Type-safe toast type checking
const handleToastClick = (toast: Toast) => {
  switch (toast.type) {
    case 'success':
      console.log('Success toast clicked');
      break;
    case 'error':
      console.log('Error toast clicked');
      break;
    case 'warning':
      console.log('Warning toast clicked');
      break;
    case 'info':
      console.log('Info toast clicked');
      break;
    default:
      // TypeScript ensures all cases are handled
      const exhaustiveCheck: never = toast.type;
      break;
  }
};
```

---

## 🎨 **UI Types**

**File**: `src/types/ui.ts`

### **ModalName**
```typescript
export type ModalName = "addBranches" | "settings";
```

### **ConfirmDialogState**
```typescript
interface ConfirmDialogState {
  isOpen: boolean;                    // Dialog open state
  options: ConfirmOptions | null;     // Dialog options
  resolve: ((value: boolean) => void) | null;  // Promise resolver
}
```

**Usage**:
```typescript
// Type-safe modal names
const openAddBranchesModal = () => {
  uiStore.openModal('addBranches'); // ✅ Valid
};

const openInvalidModal = () => {
  uiStore.openModal('invalidModal'); // ❌ TypeScript error
};

// Type-safe confirm dialog state
const { confirmDialog } = storeToRefs(uiStore);

// Access with type safety
if (confirmDialog.value.isOpen) {
  const title = confirmDialog.value.options?.title; // string | undefined
  const variant = confirmDialog.value.options?.variant; // "danger" | "warning" | "info" | undefined
}
```

---

## ✅ **Validation Types**

**File**: `src/types/validation.ts`

### **ValidationErrors**
```typescript
import type { Weekday } from "./foodics";

interface ValidationErrors {
  duration?: string | undefined;                           // Duration validation error
  slots?: Partial<Record<Weekday, string>> | undefined;   // Day-specific slot errors
}
```

**Usage**:
```typescript
const errors = ref<ValidationErrors>({});

// Type-safe error setting
const setDurationError = (message: string) => {
  errors.value.duration = message;
};

const setSlotError = (day: Weekday, message: string) => {
  if (!errors.value.slots) {
    errors.value.slots = {};
  }
  errors.value.slots[day] = message;
};

// Type-safe error checking
const hasErrors = computed(() => {
  return !!(errors.value.duration || 
    Object.values(errors.value.slots || {}).some(error => error));
});

// Type-safe error access
const getSlotError = (day: Weekday): string | undefined => {
  return errors.value.slots?.[day];
};
```

---

## 🎯 **Type Usage Patterns**

### **1. Generic Types**
```typescript
// Reusable generic interfaces
interface ApiResponse<T> {
  data: T;
  status: number;
}

interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

// Usage with specific types
const branchResponse: ApiResponse<Branch> = await api.getBranch(id);
const branchesResponse: PaginatedResponse<Branch> = await api.getBranches();
```

### **2. Union Types**
```typescript
// Discriminated unions for type safety
type LoadingState = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: Branch[] }
  | { status: 'error'; error: string };

// Type-safe state handling
const handleState = (state: LoadingState) => {
  switch (state.status) {
    case 'idle':
      return 'Ready to load';
    case 'loading':
      return 'Loading...';
    case 'success':
      return `Loaded ${state.data.length} branches`;
    case 'error':
      return `Error: ${state.error}`;
    default:
      const exhaustiveCheck: never = state;
      return exhaustiveCheck;
  }
};
```

### **3. Utility Types**
```typescript
// Built-in TypeScript utility types
type PartialBranch = Partial<Branch>;           // All properties optional
type BranchId = Pick<Branch, 'id'>;            // Only id property
type BranchWithoutId = Omit<Branch, 'id'>;     // All properties except id
type BranchKeys = keyof Branch;                // Union of property names
type BranchValues = Branch[BranchKeys];        // Union of property values

// Custom utility types
type NonNullable<T> = T extends null | undefined ? never : T;
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
```

### **4. Conditional Types**
```typescript
// Conditional type based on generic parameter
type ApiResult<T> = T extends string 
  ? { message: T } 
  : { data: T };

// Usage
const stringResult: ApiResult<string> = { message: 'Success' };
const dataResult: ApiResult<Branch> = { data: branch };
```

---

## 🚀 **Best Practices**

### ✅ **DO**
- Use strict TypeScript configuration
- Define types for all data structures
- Use generic types for reusable interfaces
- Leverage union types for state management
- Use utility types to transform existing types
- Export types from a central location

### ❌ **DON'T**
- Use `any` or `unknown` unless absolutely necessary
- Define types inline when they're reused
- Forget to handle all cases in discriminated unions
- Skip type definitions for API responses
- Use loose typing for form validation
- Ignore TypeScript errors

---

## 🧪 **Testing Types**

### **Type Tests**
```typescript
// Test that types work as expected
import type { Equal, Expect } from '@type-challenges/utils';

// Test utility type
type TestPartial = Expect<Equal<Partial<Branch>, {
  id?: string;
  name?: string;
  status?: string;
}>>;

// Test generic type
type TestSelection = Expect<Equal<
  SelectionState<Branch>['selectedItems'],
  Ref<Branch[]>
>>;

// Test union type
type TestLoadingState = Expect<Equal<
  LoadingState['status'],
  'idle' | 'loading' | 'success' | 'error'
>>;
```

---

This completes the types reference. These type definitions provide comprehensive type safety throughout the application, ensuring compile-time error checking and better developer experience.
