# 🔧 Global Composables Reference

This document covers all global composables in `src/composables/`. These are reusable pieces of logic that can be used across any feature in the application.

## 📋 **Global Composables Overview**

| Composable | Purpose | Returns | Usage |
|------------|---------|---------|-------|
| `useAsyncAction` | Handle async operations with loading states | `busy`, `error`, `run`, `reset` | API calls, async operations |
| `useConfirm` | Show confirmation dialogs | `confirm` function | User confirmations |
| `useLocale` | Manage locale and RTL support | `currentLocale`, `isRTL`, `setLocale`, `toggleLocale` | i18n and RTL |
| `useModal` | Manage modal state | `isOpen`, `options`, `open`, `close` | Modal dialogs |
| `useSelection` | Generic selection logic | Selection state and actions | Multi-select functionality |
| `useToast` | Show toast notifications | `toasts`, `success`, `error`, `warning`, `info` | User notifications |
| `useToastDisplay` | Toast styling and icons | `toastClasses`, `closeButtonClasses`, `iconComponent` | Toast display logic |

---

## ⚡ **useAsyncAction**

**File**: `src/composables/useAsyncAction.ts`  
**Purpose**: Handle async operations with loading states and error handling

### **Type Definition**
```typescript
interface AsyncActionState {
  busy: Ref<boolean>;
  error: Ref<string | null>;
  reset: () => void;
}

// Extended with run method
interface UseAsyncActionReturn extends AsyncActionState {
  run: <T>(fn: () => Promise<T>) => Promise<T>;
}
```

### **Usage Examples**

#### **Basic Async Operation**
```vue
<template>
  <BaseButton 
    :loading="busy" 
    :disabled="busy"
    @click="handleSave"
  >
    {{ busy ? 'Saving...' : 'Save Changes' }}
  </BaseButton>
  
  <div v-if="error" class="text-red-600">
    {{ error }}
  </div>
</template>

<script setup>
import { useAsyncAction } from '@/composables/useAsyncAction';

const { busy, error, run, reset } = useAsyncAction();

const handleSave = async () => {
  await run(async () => {
    await api.saveData(formData.value);
    // Success handling
    showSuccessMessage();
  });
};
</script>
```

#### **With Error Handling**
```vue
<script setup>
const { busy, error, run } = useAsyncAction();

const handleDelete = async () => {
  try {
    await run(async () => {
      await api.deleteItem(itemId.value);
    });
    
    // Success
    router.push('/items');
  } catch (err) {
    // Error is automatically set in the error ref
    console.error('Delete failed:', err);
  }
};
</script>
```

#### **Reset State**
```vue
<script setup>
const { busy, error, reset } = useAsyncAction();

// Reset when component unmounts or form is reset
onUnmounted(() => {
  reset();
});

const resetForm = () => {
  reset();
  formData.value = initialData;
};
</script>
```

### **Key Features**
- **Automatic Loading State**: `busy` ref tracks operation status
- **Error Handling**: `error` ref captures and stores errors
- **Promise Handling**: `run` method wraps async functions
- **State Reset**: `reset` method clears busy and error states

---

## ✅ **useConfirm**

**File**: `src/composables/useConfirm.ts`  
**Purpose**: Show confirmation dialogs with customizable options

### **Type Definition**
```typescript
interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
}

function useConfirm(): (options: ConfirmOptions) => Promise<boolean>;
```

### **Usage Examples**

#### **Basic Confirmation**
```vue
<template>
  <BaseButton variant="danger" @click="confirmDelete">
    Delete Branch
  </BaseButton>
</template>

<script setup>
import { useConfirm } from '@/composables/useConfirm';

const confirmDelete = async () => {
  const confirmed = await useConfirm({
    title: 'Delete Branch',
    message: 'Are you sure you want to delete this branch? This action cannot be undone.',
    confirmText: 'Delete',
    cancelText: 'Cancel',
    variant: 'danger'
  });
  
  if (confirmed) {
    await deleteBranch();
  }
};
</script>
```

#### **Warning Confirmation**
```vue
<script setup>
const confirmDisable = async () => {
  const confirmed = await useConfirm({
    title: 'Disable Reservations',
    message: 'This will disable reservations for all tables in this branch.',
    confirmText: 'Disable',
    cancelText: 'Keep Enabled',
    variant: 'warning'
  });
  
  if (confirmed) {
    await disableReservations();
  }
};
</script>
```

#### **Info Confirmation**
```vue
<script setup>
const confirmUpdate = async () => {
  const confirmed = await useConfirm({
    title: 'Update Settings',
    message: 'This will update the reservation settings for this branch.',
    confirmText: 'Update',
    variant: 'info'
  });
  
  if (confirmed) {
    await updateSettings();
  }
};
</script>
```

### **Key Features**
- **Promise-based**: Returns a promise that resolves to boolean
- **Customizable**: Title, message, button text, and variant
- **Variant Support**: Different visual styles (danger, warning, info)
- **Non-blocking**: UI remains responsive during confirmation

---

## 🌍 **useLocale**

**File**: `src/composables/useLocale.ts`  
**Purpose**: Manage locale switching and RTL support

### **Type Definition**
```typescript
type SupportedLocale = "en" | "ar";

interface UseLocaleReturn {
  currentLocale: ComputedRef<SupportedLocale>;
  isRTL: ComputedRef<boolean>;
  availableLocales: ComputedRef<string[]>;
  setLocale: (locale: SupportedLocale) => void;
  restoreLocale: () => SupportedLocale;
  toggleLocale: () => void;
}
```

### **Usage Examples**

#### **Basic Locale Management**
```vue
<template>
  <div>
    <p>Current Language: {{ currentLocale }}</p>
    <p>Direction: {{ isRTL ? 'RTL' : 'LTR' }}</p>
    
    <BaseButton @click="toggleLocale">
      Switch to {{ currentLocale === 'en' ? 'Arabic' : 'English' }}
    </BaseButton>
  </div>
</template>

<script setup>
import { useLocale } from '@/composables/useLocale';

const { currentLocale, isRTL, toggleLocale } = useLocale();
</script>
```

#### **Set Specific Locale**
```vue
<script setup>
import { useLocale } from '@/composables/useLocale';

const { setLocale, currentLocale } = useLocale();

const switchToArabic = () => {
  setLocale('ar');
};

const switchToEnglish = () => {
  setLocale('en');
};
</script>
```

#### **Restore Locale on App Start**
```vue
<script setup>
import { useLocale } from '@/composables/useLocale';

const { restoreLocale } = useLocale();

// In your main.ts or app initialization
onMounted(() => {
  restoreLocale(); // Restores from localStorage or defaults to 'en'
});
</script>
```

#### **Conditional RTL Styling**
```vue
<template>
  <div :class="{ 'text-right': isRTL }">
    <h1>Title</h1>
    <p>Content</p>
  </div>
</template>

<script setup>
import { useLocale } from '@/composables/useLocale';

const { isRTL } = useLocale();
</script>
```

### **Key Features**
- **Persistence**: Automatically saves locale to localStorage
- **RTL Detection**: Computed property for RTL layout
- **Document Updates**: Sets `dir` and `lang` attributes on document
- **Fallback**: Defaults to English if localStorage fails

---

## 🪟 **useModal**

**File**: `src/composables/useModal.ts`  
**Purpose**: Manage modal state and configuration

### **Type Definition**
```typescript
interface ModalOptions {
  size?: "sm" | "md" | "lg" | "xl";
}

interface UseModalReturn {
  isOpen: Ref<boolean>;
  options: Ref<ModalOptions>;
  open: (options?: ModalOptions) => void;
  close: () => void;
}
```

### **Usage Examples**

#### **Basic Modal**
```vue
<template>
  <BaseButton @click="openModal">
    Open Modal
  </BaseButton>
  
  <BaseModal
    v-model="isOpen"
    :title="'Settings'"
    :size="options.size"
  >
    <p>Modal content goes here...</p>
    
    <template #actions>
      <BaseButton variant="ghost" @click="close">
        Cancel
      </BaseButton>
      <BaseButton variant="primary" @click="saveAndClose">
        Save
      </BaseButton>
    </template>
  </BaseModal>
</template>

<script setup>
import { useModal } from '@/composables/useModal';

const { isOpen, options, open, close } = useModal();

const openModal = () => {
  open({ size: 'lg' });
};

const saveAndClose = () => {
  // Save logic
  close();
};
</script>
```

#### **Multiple Modal Sizes**
```vue
<script setup>
const { isOpen, options, open, close } = useModal();

const openSmallModal = () => {
  open({ size: 'sm' });
};

const openLargeModal = () => {
  open({ size: 'xl' });
};

const openMediumModal = () => {
  open({ size: 'md' }); // Default
};
</script>
```

### **Key Features**
- **Reactive State**: `isOpen` ref for modal visibility
- **Configurable**: Size options for different modal types
- **Simple API**: Easy open/close methods
- **Options Persistence**: Options persist until modal closes

---

## 🎯 **useSelection**

**File**: `src/composables/useSelection.ts`  
**Purpose**: Generic selection logic for multi-select functionality

### **Type Definition**
```typescript
interface SelectableItem {
  id: string;
}

interface SelectionState<T extends SelectableItem> {
  selectedIds: Ref<string[]>;
  selectedItems: Ref<T[]>;
  selectedIdsSet: Ref<Set<string>>;
  isAllSelected: Ref<boolean>;
  hasSelection: Ref<boolean>;
  selectionCount: Ref<number>;
  isSelected: (id: string) => boolean;
  toggleOne: (id: string) => void;
  toggleAll: () => void;
  setSelected: (ids: string[]) => void;
  clearSelection: () => void;
}

function useSelection<T extends SelectableItem>(
  items: Ref<T[] | undefined>
): SelectionState<T>;
```

### **Usage Examples**

#### **Basic Selection**
```vue
<template>
  <div>
    <BaseButton 
      :disabled="!hasSelection"
      @click="deleteSelected"
    >
      Delete Selected ({{ selectionCount }})
    </BaseButton>
    
    <div v-for="item in items" :key="item.id">
      <input 
        type="checkbox"
        :checked="isSelected(item.id)"
        @change="toggleOne(item.id)"
      />
      {{ item.name }}
    </div>
  </div>
</template>

<script setup>
import { useSelection } from '@/composables/useSelection';

const items = ref([
  { id: '1', name: 'Item 1' },
  { id: '2', name: 'Item 2' },
  { id: '3', name: 'Item 3' }
]);

const {
  selectedIds,
  selectedItems,
  isAllSelected,
  hasSelection,
  selectionCount,
  isSelected,
  toggleOne,
  toggleAll,
  clearSelection
} = useSelection(items);

const deleteSelected = async () => {
  for (const item of selectedItems.value) {
    await deleteItem(item.id);
  }
  clearSelection();
};
</script>
```

#### **Select All Functionality**
```vue
<template>
  <div>
    <input 
      type="checkbox"
      :checked="isAllSelected"
      @change="toggleAll"
    />
    Select All
    
    <div v-for="branch in branches" :key="branch.id">
      <input 
        type="checkbox"
        :checked="isSelected(branch.id)"
        @change="toggleOne(branch.id)"
      />
      {{ branch.name }}
    </div>
  </div>
</template>

<script setup>
import { useSelection } from '@/composables/useSelection';

const branches = ref([
  { id: '1', name: 'Branch 1' },
  { id: '2', name: 'Branch 2' }
]);

const { isAllSelected, isSelected, toggleOne, toggleAll } = useSelection(branches);
</script>
```

#### **Programmatic Selection**
```vue
<script setup>
const { setSelected, clearSelection } = useSelection(items);

// Select specific items
const selectFirstTwo = () => {
  setSelected(['1', '2']);
};

// Clear all selections
const clearAll = () => {
  clearSelection();
};
</script>
```

### **Key Features**
- **Generic**: Works with any object that has an `id` property
- **Efficient**: Uses Set for O(1) lookup performance
- **Computed Properties**: Reactive derived state (count, all selected, etc.)
- **Flexible**: Multiple selection methods (toggle, set, clear)

---

## 🍞 **useToast**

**File**: `src/composables/useToast.ts`  
**Purpose**: Show toast notifications with different types

### **Type Definition**
```typescript
interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
  duration?: number;
}

interface UseToastReturn {
  toasts: Ref<Toast[]>;
  show: (message: string, type: Toast["type"], duration?: number) => string;
  remove: (id: string) => void;
  success: (message: string, duration?: number) => string;
  error: (message: string, duration?: number) => string;
  warning: (message: string, duration?: number) => string;
  info: (message: string, duration?: number) => string;
}
```

### **Usage Examples**

#### **Basic Toast Types**
```vue
<template>
  <div>
    <BaseButton @click="showSuccess">Success</BaseButton>
    <BaseButton @click="showError">Error</BaseButton>
    <BaseButton @click="showWarning">Warning</BaseButton>
    <BaseButton @click="showInfo">Info</BaseButton>
  </div>
</template>

<script setup>
import { useToast } from '@/composables/useToast';

const { success, error, warning, info } = useToast();

const showSuccess = () => {
  success('Operation completed successfully!');
};

const showError = () => {
  error('Something went wrong!');
};

const showWarning = () => {
  warning('Please check your input');
};

const showInfo = () => {
  info('New feature available!');
};
</script>
```

#### **Custom Duration**
```vue
<script setup>
const { show, remove } = useToast();

const showPersistentToast = () => {
  const id = show('This toast stays until dismissed', 'info', 0);
  
  // Remove it manually after 10 seconds
  setTimeout(() => {
    remove(id);
  }, 10000);
};

const showQuickToast = () => {
  show('This disappears quickly', 'success', 2000);
};
</script>
```

#### **API Integration**
```vue
<script setup>
const { success, error } = useToast();

const handleSave = async () => {
  try {
    await api.saveData(formData.value);
    success('Data saved successfully!');
  } catch (err) {
    error(`Failed to save: ${err.message}`);
  }
};

const handleDelete = async () => {
  try {
    await api.deleteItem(itemId.value);
    success('Item deleted successfully');
    router.push('/items');
  } catch (err) {
    error('Failed to delete item');
  }
};
</script>
```

### **Key Features**
- **Multiple Types**: Success, error, warning, info
- **Auto-dismiss**: Configurable duration (default 5000ms)
- **Manual Control**: Remove toasts programmatically
- **Unique IDs**: Each toast has a unique identifier

---

## 🎨 **useToastDisplay**

**File**: `src/composables/useToastDisplay.ts`  
**Purpose**: Provide styling and icon logic for toast notifications

### **Type Definition**
```typescript
interface UseToastDisplayReturn {
  toastClasses: (type: Toast["type"]) => string;
  closeButtonClasses: (type: Toast["type"]) => string;
  iconComponent: (type: Toast["type"]) => VNode;
}
```

### **Usage Examples**

#### **In Toast Component**
```vue
<template>
  <div :class="toastClasses(toast.type)">
    <component :is="iconComponent(toast.type)" />
    {{ toast.message }}
    <button :class="closeButtonClasses(toast.type)" @click="remove(toast.id)">
      ×
    </button>
  </div>
</template>

<script setup>
import { useToastDisplay } from '@/composables/useToastDisplay';

const { toastClasses, closeButtonClasses, iconComponent } = useToastDisplay();
</script>
```

### **Key Features**
- **Type-specific Styling**: Different colors for each toast type
- **Icon Components**: SVG icons for each toast type
- **Consistent Design**: Unified styling across all toasts

---

## 🎯 **Composable Usage Patterns**

### **1. Composition Pattern**
```vue
<script setup>
// Combine multiple composables
const { busy, run } = useAsyncAction();
const { success, error } = useToast();
const { confirm } = useConfirm();

const handleDelete = async () => {
  const confirmed = await confirm({
    title: 'Delete Item',
    message: 'Are you sure?',
    variant: 'danger'
  });
  
  if (confirmed) {
    await run(async () => {
      await api.deleteItem(itemId.value);
      success('Item deleted successfully');
    });
  }
};
</script>
```

### **2. Store Integration**
```vue
<script setup>
import { useUIStore } from '@/stores/ui.store';

// Use composables with stores
const uiStore = useUIStore();
const { showToast } = uiStore;

const { busy, run } = useAsyncAction();

const handleAction = async () => {
  await run(async () => {
    await api.performAction();
    showToast('Action completed', 'success');
  });
};
</script>
```

### **3. Feature Integration**
```vue
<script setup>
// Use global composables in feature-specific logic
const { busy, run } = useAsyncAction();
const { success, error } = useToast();

const { enableBranch } = useBranchActions(); // Feature composable

const handleEnableBranch = async (branchId: string) => {
  await run(async () => {
    await enableBranch(branchId);
    success('Branch enabled successfully');
  });
};
</script>
```

---

## 🚀 **Best Practices**

### ✅ **DO**
- Use composables for reusable logic
- Combine composables for complex functionality
- Handle errors appropriately in async operations
- Use TypeScript for type safety
- Test composables thoroughly

### ❌ **DON'T**
- Put DOM manipulation in composables
- Make composables too specific to one feature
- Forget to handle loading states
- Ignore error handling in async operations
- Skip cleanup in composables with side effects

---

This completes the global composables reference. These composables provide the foundation for reusable logic throughout the application.
