# 📦 Imports & Usage Patterns

This document explains all the import patterns and usage examples throughout the codebase. Understanding these patterns will help you work effectively with the codebase.

## 📋 **Import Patterns Overview**

| Pattern | Usage | Example |
|---------|-------|---------|
| **Alias Imports** | All imports use `@/*` aliases | `import { useToast } from '@/composables/useToast'` |
| **Type Imports** | Use `import type` for types | `import type { Branch } from '@/types/foodics'` |
| **Named Imports** | Prefer named over default exports | `import { ref, computed } from 'vue'` |
| **Relative Imports** | Avoid deep relative paths | Use `@/` instead of `../../../` |

---

## 🎯 **Alias Import System**

### **Configuration**
The `@/*` alias is configured in:
- `tsconfig.json` (TypeScript resolution)
- `vite.config.ts` (Vite bundler)
- `vitest.config.ts` (Test runner)

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

### **Alias Mapping**
```
@/                    → src/
@/components          → src/components
@/composables         → src/composables
@/features           → src/features
@/services           → src/services
@/stores             → src/stores
@/types              → src/types
@/app                → src/app
```

---

## 🧩 **Component Imports**

### **Global Components**
```typescript
// UI primitives
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseModal from '@/components/ui/BaseModal.vue';
import BaseInput from '@/components/ui/BaseInput.vue';
import BaseCard from '@/components/ui/BaseCard.vue';

// Layout components
import AppHeader from '@/components/layout/AppHeader.vue';
import Toaster from '@/components/layout/Toaster.vue';
```

### **Feature Components**
```typescript
// Branches feature components
import BranchesTable from '@/features/branches/components/BranchesTable.vue';
import AddBranchesModal from '@/features/branches/components/AddBranchesModal.vue';
import BranchSettingsModal from '@/features/branches/components/BranchSettingsModal.vue';

// Nested feature components
import DaySlotsEditor from '@/features/branches/components/ReservationSettingsModal/DaySlotsEditor.vue';
import DurationField from '@/features/branches/components/ReservationSettingsModal/DurationField.vue';
```

### **Component Usage Examples**
```vue
<template>
  <div>
    <AppHeader />
    
    <BaseCard>
      <BranchesTable :branches="branches" />
      
      <BaseButton @click="showAddModal">
        Add Branch
      </BaseButton>
    </BaseCard>
    
    <AddBranchesModal v-model="showModal" />
  </div>
</template>

<script setup>
import AppHeader from '@/components/layout/AppHeader.vue';
import BaseCard from '@/components/ui/BaseCard.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BranchesTable from '@/features/branches/components/BranchesTable.vue';
import AddBranchesModal from '@/features/branches/components/AddBranchesModal.vue';

const branches = ref([]);
const showModal = ref(false);
</script>
```

---

## 🔧 **Composable Imports**

### **Global Composables**
```typescript
// Async operations
import { useAsyncAction } from '@/composables/useAsyncAction';

// UI interactions
import { useToast } from '@/composables/useToast';
import { useConfirm } from '@/composables/useConfirm';
import { useModal } from '@/composables/useModal';

// Selection logic
import { useSelection } from '@/composables/useSelection';

// Internationalization
import { useLocale } from '@/composables/useLocale';

// Toast display logic
import { useToastDisplay } from '@/composables/useToastDisplay';
```

### **Feature Composables**
```typescript
// Branches feature composables
import { useBranchSelection } from '@/features/branches/composables/useBranchSelection';
import { useSettingsForm } from '@/features/branches/composables/useSettingsForm';
import { useDurationField } from '@/features/branches/composables/useDurationField';
import { useDaySlotsEditor } from '@/features/branches/composables/useDaySlotsEditor';
import { useSettingsValidation } from '@/features/branches/composables/useSettingsValidation';
```

### **Composable Usage Examples**
```vue
<script setup>
// Global composables
import { useAsyncAction } from '@/composables/useAsyncAction';
import { useToast } from '@/composables/useToast';
import { useConfirm } from '@/composables/useConfirm';

// Feature composables
import { useBranchSelection } from '@/features/branches/composables/useBranchSelection';
import { useDurationField } from '@/features/branches/composables/useDurationField';

// Combined usage
const { busy, run } = useAsyncAction();
const { success, error } = useToast();
const confirm = useConfirm();

const { selectedBranches, toggleBranch } = useBranchSelection(branches);
const durationField = useDurationField({
  modelValue: duration.value,
  min: 30,
  max: 480
});

const handleDelete = async () => {
  const confirmed = await confirm({
    title: 'Delete Branches',
    message: `Delete ${selectedBranches.value.length} branches?`,
    variant: 'danger'
  });
  
  if (confirmed) {
    await run(async () => {
      await deleteBranches(selectedBranches.value);
      success('Branches deleted successfully');
    });
  }
};
</script>
```

---

## 🗃️ **Store Imports**

### **Global Stores**
```typescript
// UI state management
import { useUIStore } from '@/stores/ui.store';
```

### **Feature Stores**
```typescript
// Branches feature store
import { useBranchesStore } from '@/features/branches/stores/branches.store';
```

### **Store Usage Examples**
```vue
<script setup>
import { storeToRefs } from 'pinia';
import { useUIStore } from '@/stores/ui.store';
import { useBranchesStore } from '@/features/branches/stores/branches.store';

// Store instances
const uiStore = useUIStore();
const branchesStore = useBranchesStore();

// Reactive store state
const { toasts, modals } = storeToRefs(uiStore);
const { branches, loading } = storeToRefs(branchesStore);

// Store actions
const { showToast, openModal } = uiStore;
const { fetchBranches, updateBranch } = branchesStore;

// Usage
onMounted(() => {
  fetchBranches();
});

const handleBranchUpdate = async (id: string, data: BranchData) => {
  await updateBranch(id, data);
  showToast('Branch updated successfully', 'success');
};
</script>
```

---

## 🌐 **Service Imports**

### **HTTP Client**
```typescript
// Centralized HTTP client
import { httpClient } from '@/services/http';
```

### **API Services**
```typescript
// Feature-specific services
import { BranchesService } from '@/services/branches.service';
```

### **Service Usage Examples**
```vue
<script setup>
import { BranchesService } from '@/services/branches.service';
import { useAsyncAction } from '@/composables/useAsyncAction';
import { useToast } from '@/composables/useToast';

const { busy, run } = useAsyncAction();
const { success, error } = useToast();

const handleEnableBranch = async (branchId: string) => {
  await run(async () => {
    const updatedBranch = await BranchesService.enableBranch(branchId);
    success('Branch enabled successfully');
    return updatedBranch;
  });
};

const handleUpdateSettings = async (branchId: string, settings: BranchSettings) => {
  await run(async () => {
    await BranchesService.updateBranchSettings(branchId, settings);
    success('Settings updated successfully');
  });
};
</script>
```

---

## 📝 **Type Imports**

### **Type Import Patterns**
```typescript
// Always use 'import type' for types
import type { Branch } from '@/types/foodics';
import type { ApiError } from '@/types/api';
import type { Toast } from '@/types/toast';
import type { ConfirmOptions } from '@/types/confirm';
import type { ModalOptions } from '@/types/modal';
import type { SelectableItem, SelectionState } from '@/types/selection';
import type { AsyncActionState } from '@/types/async';
import type { ValidationErrors } from '@/types/validation';
import type { UseDurationFieldOptions, UseDurationFieldReturn } from '@/types/duration';
import type { SupportedLocale } from '@/types/locale';
import type { ModalName } from '@/types/ui';
```

### **Type Usage Examples**
```vue
<script setup lang="ts">
import type { Branch, Weekday, SlotTuple } from '@/types/foodics';
import type { ApiError } from '@/types/api';
import type { ConfirmOptions } from '@/types/confirm';

// Type-safe props
const props = defineProps<{
  branches: Branch[];
  onUpdate: (branch: Branch) => void;
}>();

// Type-safe emits
const emit = defineEmits<{
  update: [branch: Branch];
  delete: [id: string];
}>();

// Type-safe reactive data
const selectedBranch = ref<Branch | null>(null);
const reservationTimes = ref<Record<Weekday, SlotTuple[]>>({});

// Type-safe error handling
const handleApiError = (error: ApiError) => {
  console.error(`API Error ${error.status}: ${error.message}`);
};

// Type-safe confirm options
const confirmOptions: ConfirmOptions = {
  title: 'Delete Branch',
  message: 'Are you sure?',
  variant: 'danger'
};
</script>
```

---

## 🔄 **Vue Imports**

### **Vue Composition API**
```typescript
// Core reactivity
import { ref, reactive, computed, watch, watchEffect } from 'vue';

// Lifecycle hooks
import { onMounted, onUnmounted, onUpdated } from 'vue';

// Utility functions
import { nextTick, toRefs } from 'vue';

// Type imports
import type { Ref, ComputedRef, WatchStopHandle } from 'vue';
```

### **Vue Router**
```typescript
// Router composables
import { useRouter, useRoute } from 'vue-router';

// Router types
import type { RouteLocationNormalized } from 'vue-router';
```

### **Vue i18n**
```typescript
// i18n composable
import { useI18n } from 'vue-i18n';

// i18n types
import type { Composer } from 'vue-i18n';
```

### **Pinia**
```typescript
// Store management
import { defineStore } from 'pinia';
import { storeToRefs } from 'pinia';
```

---

## 🎯 **Import Organization Patterns**

### **1. Grouped Imports**
```typescript
// 1. Vue core imports
import { ref, computed, onMounted } from 'vue';

// 2. Third-party imports
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';

// 3. Type imports
import type { Branch } from '@/types/foodics';
import type { ApiError } from '@/types/api';

// 4. Global composables
import { useAsyncAction } from '@/composables/useAsyncAction';
import { useToast } from '@/composables/useToast';

// 5. Feature imports
import { useBranchSelection } from '@/features/branches/composables/useBranchSelection';
import BranchesTable from '@/features/branches/components/BranchesTable.vue';

// 6. Services
import { BranchesService } from '@/services/branches.service';

// 7. Stores
import { useBranchesStore } from '@/features/branches/stores/branches.store';
```

### **2. Component Import Pattern**
```vue
<script setup lang="ts">
// Vue imports
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

// Type imports
import type { Branch } from '@/types/foodics';

// Global composables
import { useAsyncAction } from '@/composables/useAsyncAction';
import { useToast } from '@/composables/useToast';

// Feature composables
import { useBranchSelection } from '@/features/branches/composables/useBranchSelection';

// Components
import BaseButton from '@/components/ui/BaseButton.vue';
import BranchesTable from '@/features/branches/components/BranchesTable.vue';

// Services
import { BranchesService } from '@/services/branches.service';

// Store
import { useBranchesStore } from '@/features/branches/stores/branches.store';

// Component logic here...
</script>
```

---

## 🚀 **Best Practices**

### ✅ **DO**
- Use `@/*` aliases for all imports
- Use `import type` for type-only imports
- Group imports logically
- Use named imports over default imports
- Import only what you need
- Keep imports at the top of files

### ❌ **DON'T**
- Use deep relative paths (`../../../`)
- Mix type and value imports
- Use default imports for app code
- Import entire libraries when you only need specific functions
- Forget to import types when using TypeScript
- Use circular imports

---

## 🔍 **Common Import Scenarios**

### **1. Component with Props and Emits**
```vue
<script setup lang="ts">
import type { Branch } from '@/types/foodics';
import { useAsyncAction } from '@/composables/useAsyncAction';
import { useToast } from '@/composables/useToast';
import BaseButton from '@/components/ui/BaseButton.vue';

interface Props {
  branch: Branch;
}

interface Emits {
  update: [branch: Branch];
  delete: [id: string];
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const { busy, run } = useAsyncAction();
const { success } = useToast();
</script>
```

### **2. Store with Actions**
```typescript
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Branch } from '@/types/foodics';
import { BranchesService } from '@/services/branches.service';

export const useBranchesStore = defineStore('branches', () => {
  const branches = ref<Branch[]>([]);
  const loading = ref(false);

  const fetchBranches = async () => {
    loading.value = true;
    try {
      branches.value = await BranchesService.getBranches();
    } finally {
      loading.value = false;
    }
  };

  return {
    branches,
    loading,
    fetchBranches
  };
});
```

### **3. Composable with Types**
```typescript
import { ref, computed } from 'vue';
import type { Ref, ComputedRef } from 'vue';
import type { SelectableItem } from '@/types/selection';

export function useSelection<T extends SelectableItem>(
  items: Ref<T[] | undefined>
) {
  const selectedIds = ref<string[]>([]);
  
  const selectedItems = computed(() => 
    (items.value ?? []).filter(item => selectedIds.value.includes(item.id))
  );

  return {
    selectedIds,
    selectedItems
  };
}
```

---

This completes the imports and usage patterns reference. Understanding these patterns will help you navigate and work effectively with the codebase.
