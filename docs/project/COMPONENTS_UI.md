# 🧩 UI Components Reference

This document provides a comprehensive reference for all global UI components in `src/components/ui/`. These are the building blocks used throughout the application.

## 📋 **Component Overview**

| Component | Purpose | Props | Emits | Usage |
|-----------|---------|-------|-------|-------|
| `BaseButton` | Generic button with variants | `variant`, `size`, `disabled`, `loading` | `click` | Primary actions, forms |
| `BaseCard` | Container with consistent styling | `dataTestid` | - | Content grouping |
| `BaseInput` | Form input field | `modelValue`, `type`, `placeholder`, `disabled` | `update:modelValue` | Text inputs |
| `BaseModal` | Modal dialog container | `modelValue`, `title`, `size` | `update:modelValue` | Modal dialogs |
| `BaseSelect` | Dropdown selection | `modelValue`, `options`, `disabled` | `update:modelValue` | Dropdowns |
| `BaseTable` | Data table with sorting | `data`, `columns`, `sortable` | `sort` | Data display |
| `ConfirmDialog` | Confirmation modal | - | - | User confirmations |
| `EmptyState` | Empty state display | `title`, `description`, `actionText` | `action` | Empty lists |
| `LocaleSwitcher` | Language switcher | - | - | i18n toggle |
| `PageLoading` | Loading indicator | `message` | - | Page loading |
| `TimePill` | Time display component | `time`, `format` | - | Time display |
| `UiModal` | Generic modal wrapper | `modelValue`, `title`, `size` | `update:modelValue` | Modal dialogs |

---

## 🔘 **BaseButton**

**File**: `src/components/ui/BaseButton.vue`  
**Purpose**: Generic button component with multiple variants and states

### **Props**
```typescript
interface Props {
  variant?: "primary" | "ghost" | "danger";  // Button style
  size?: "sm" | "md" | "lg";                 // Button size
  type?: "button" | "submit" | "reset";      // HTML button type
  disabled?: boolean;                         // Disabled state
  loading?: boolean;                          // Loading state
  dataTestid?: string;                        // Test identifier
}
```

### **Emits**
```typescript
interface Emits {
  (e: "click", event: MouseEvent): void;
}
```

### **Usage Examples**

#### **Primary Button**
```vue
<template>
  <BaseButton 
    variant="primary" 
    size="md"
    @click="handleSave"
  >
    Save Changes
  </BaseButton>
</template>
```

#### **Danger Button**
```vue
<template>
  <BaseButton 
    variant="danger" 
    size="sm"
    :loading="isDeleting"
    @click="handleDelete"
  >
    Delete Branch
  </BaseButton>
</template>
```

#### **Ghost Button**
```vue
<template>
  <BaseButton 
    variant="ghost" 
    size="lg"
    @click="handleCancel"
  >
    Cancel
  </BaseButton>
</template>
```

### **Styling Classes**
- **Base**: `inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed`
- **Primary**: `bg-primary-600 text-white hover:bg-primary-700`
- **Ghost**: `border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50`
- **Danger**: `bg-danger-600 text-white hover:bg-danger-700`
- **Sizes**: `px-3 py-1.5 text-sm` (sm), `px-6 py-3 text-base` (md), `px-8 py-4 text-lg` (lg)

---

## 🃏 **BaseCard**

**File**: `src/components/ui/BaseCard.vue`  
**Purpose**: Container component with consistent card styling

### **Props**
```typescript
interface Props {
  dataTestid?: string;  // Test identifier
}
```

### **Usage Examples**

#### **Basic Card**
```vue
<template>
  <BaseCard>
    <h3>Card Title</h3>
    <p>Card content goes here...</p>
  </BaseCard>
</template>
```

#### **Card with Test ID**
```vue
<template>
  <BaseCard data-testid="branch-card">
    <BranchInfo :branch="branch" />
  </BaseCard>
</template>
```

### **Styling Classes**
- **Base**: `bg-white rounded-card shadow-sm border border-neutral-200 overflow-hidden`

---

## 📝 **BaseInput**

**File**: `src/components/ui/BaseInput.vue`  
**Purpose**: Form input field with consistent styling

### **Props**
```typescript
interface Props {
  modelValue: string;           // v-model value
  type?: "text" | "email" | "password" | "number";  // Input type
  placeholder?: string;         // Placeholder text
  disabled?: boolean;           // Disabled state
  dataTestid?: string;          // Test identifier
}
```

### **Emits**
```typescript
interface Emits {
  (e: "update:modelValue", value: string): void;
}
```

### **Usage Examples**

#### **Text Input**
```vue
<template>
  <BaseInput
    v-model="branchName"
    placeholder="Enter branch name"
    data-testid="branch-name-input"
  />
</template>

<script setup>
const branchName = ref('');
</script>
```

#### **Password Input**
```vue
<template>
  <BaseInput
    v-model="password"
    type="password"
    placeholder="Enter password"
  />
</template>
```

### **Styling Classes**
- **Base**: `block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:bg-neutral-50 disabled:text-neutral-500`

---

## 🪟 **BaseModal**

**File**: `src/components/ui/BaseModal.vue`  
**Purpose**: Modal dialog container with consistent behavior

### **Props**
```typescript
interface Props {
  modelValue: boolean;          // v-model for open/close
  title?: string;               // Modal title
  size?: "sm" | "md" | "lg" | "xl";  // Modal size
  dataTestid?: string;          // Test identifier
}
```

### **Emits**
```typescript
interface Emits {
  (e: "update:modelValue", value: boolean): void;
}
```

### **Slots**
- **default**: Modal content
- **actions**: Action buttons area

### **Usage Examples**

#### **Basic Modal**
```vue
<template>
  <BaseModal
    v-model="isOpen"
    title="Add New Branch"
    size="md"
    data-testid="add-branch-modal"
  >
    <p>Modal content goes here...</p>
    
    <template #actions>
      <BaseButton variant="ghost" @click="isOpen = false">
        Cancel
      </BaseButton>
      <BaseButton variant="primary" @click="handleSave">
        Save
      </BaseButton>
    </template>
  </BaseModal>
</template>

<script setup>
const isOpen = ref(false);
</script>
```

#### **Large Modal**
```vue
<template>
  <BaseModal
    v-model="showSettings"
    title="Branch Settings"
    size="xl"
  >
    <BranchSettingsForm />
  </BaseModal>
</template>
```

### **Modal Sizes**
- **sm**: Small modal (max-width: 400px)
- **md**: Medium modal (max-width: 600px)
- **lg**: Large modal (max-width: 800px)
- **xl**: Extra large modal (max-width: 1200px)

---

## 📋 **BaseSelect**

**File**: `src/components/ui/BaseSelect.vue`  
**Purpose**: Dropdown selection component

### **Props**
```typescript
interface Props {
  modelValue: string;           // v-model value
  options: Array<{             // Select options
    value: string;
    label: string;
    disabled?: boolean;
  }>;
  placeholder?: string;         // Placeholder text
  disabled?: boolean;           // Disabled state
  dataTestid?: string;          // Test identifier
}
```

### **Emits**
```typescript
interface Emits {
  (e: "update:modelValue", value: string): void;
}
```

### **Usage Examples**

#### **Basic Select**
```vue
<template>
  <BaseSelect
    v-model="selectedBranch"
    :options="branchOptions"
    placeholder="Select a branch"
    data-testid="branch-select"
  />
</template>

<script setup>
const selectedBranch = ref('');
const branchOptions = computed(() => 
  branches.value.map(branch => ({
    value: branch.id,
    label: branch.name
  }))
);
</script>
```

---

## 📊 **BaseTable**

**File**: `src/components/ui/BaseTable.vue`  
**Purpose**: Data table with sorting capabilities

### **Props**
```typescript
interface Props {
  data: any[];                 // Table data
  columns: Array<{             // Column definitions
    key: string;
    label: string;
    sortable?: boolean;
  }>;
  sortable?: boolean;          // Enable sorting
  dataTestid?: string;         // Test identifier
}
```

### **Emits**
```typescript
interface Emits {
  (e: "sort", column: string, direction: "asc" | "desc"): void;
}
```

### **Usage Examples**

#### **Basic Table**
```vue
<template>
  <BaseTable
    :data="branches"
    :columns="columns"
    data-testid="branches-table"
    @sort="handleSort"
  />
</template>

<script setup>
const columns = [
  { key: 'name', label: 'Branch Name', sortable: true },
  { key: 'status', label: 'Status', sortable: false },
  { key: 'actions', label: 'Actions', sortable: false }
];

const handleSort = (column: string, direction: 'asc' | 'desc') => {
  // Handle sorting logic
};
</script>
```

---

## ✅ **ConfirmDialog**

**File**: `src/components/ui/ConfirmDialog.vue`  
**Purpose**: Confirmation modal for user actions

### **Usage**
This component is automatically managed by the UI store. Use the `useConfirm` composable to trigger it.

### **Usage Examples**

#### **Using with Composable**
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
    variant: 'danger',
    confirmText: 'Delete',
    cancelText: 'Cancel'
  });
  
  if (confirmed) {
    await deleteBranch();
  }
};
</script>
```

---

## 📭 **EmptyState**

**File**: `src/components/ui/EmptyState.vue`  
**Purpose**: Display empty state when no data is available

### **Props**
```typescript
interface Props {
  title?: string;              // Empty state title
  description?: string;        // Empty state description
  actionText?: string;         // Action button text
}
```

### **Emits**
```typescript
interface Emits {
  (e: "action"): void;         // Action button clicked
}
```

### **Slots**
- **action**: Custom action button

### **Usage Examples**

#### **Basic Empty State**
```vue
<template>
  <EmptyState
    title="No Branches Found"
    description="You haven't created any branches yet. Get started by adding your first branch."
    action-text="Add Branch"
    @action="showAddBranchModal"
  />
</template>
```

#### **Custom Action**
```vue
<template>
  <EmptyState
    title="No Reservations"
    description="No reservations have been made for this branch."
  >
    <template #action>
      <BaseButton variant="primary" @click="refresh">
        Refresh
      </BaseButton>
    </template>
  </EmptyState>
</template>
```

---

## 🌍 **LocaleSwitcher**

**File**: `src/components/ui/LocaleSwitcher.vue`  
**Purpose**: Language switcher for i18n

### **Usage**
```vue
<template>
  <LocaleSwitcher />
</template>
```

This component automatically:
- Shows current language
- Provides toggle functionality
- Updates document direction (RTL/LTR)
- Persists language preference

---

## ⏳ **PageLoading**

**File**: `src/components/ui/PageLoading.vue`  
**Purpose**: Loading indicator for page-level loading states

### **Props**
```typescript
interface Props {
  message?: string;            // Loading message
}
```

### **Usage Examples**

#### **Basic Loading**
```vue
<template>
  <PageLoading />
</template>
```

#### **With Custom Message**
```vue
<template>
  <PageLoading message="Loading branches..." />
</template>
```

---

## ⏰ **TimePill**

**File**: `src/components/ui/TimePill.vue`  
**Purpose**: Display time values in a pill format

### **Props**
```typescript
interface Props {
  time: string;                // Time value (HH:MM format)
  format?: "12h" | "24h";      // Time format
}
```

### **Usage Examples**

#### **24-Hour Format**
```vue
<template>
  <TimePill time="14:30" format="24h" />
</template>
```

#### **12-Hour Format**
```vue
<template>
  <TimePill time="14:30" format="12h" />
</template>
```

---

## 🪟 **UiModal**

**File**: `src/components/ui/UiModal.vue`  
**Purpose**: Alternative modal implementation (if different from BaseModal)

### **Usage**
Similar to BaseModal, but may have different styling or behavior. Check the actual implementation for specific differences.

---

## 🎯 **Component Usage Patterns**

### **1. Consistent Styling**
All components use Tailwind CSS classes and follow the design system:
- Consistent spacing (`p-4`, `gap-4`)
- Consistent colors (`bg-primary-600`, `text-neutral-900`)
- Consistent focus states (`focus:ring-2 focus:ring-primary-500`)

### **2. Accessibility**
All components include proper accessibility features:
- ARIA attributes (`aria-busy`, `role="banner"`)
- Keyboard navigation support
- Focus management
- Screen reader compatibility

### **3. Testing Support**
All components include `data-testid` props for reliable testing:
```vue
<BaseButton data-testid="save-button" @click="save">
  Save
</BaseButton>
```

### **4. RTL Support**
Components use logical CSS properties for RTL support:
- `ms-4` instead of `ml-4`
- `me-4` instead of `mr-4`
- `start` instead of `left`

### **5. Composition Pattern**
Components are designed to be composed together:
```vue
<template>
  <BaseCard>
    <BaseModal v-model="isOpen" title="Settings">
      <BaseInput v-model="name" placeholder="Name" />
      <BaseSelect v-model="status" :options="statusOptions" />
      
      <template #actions>
        <BaseButton variant="ghost" @click="isOpen = false">
          Cancel
        </BaseButton>
        <BaseButton variant="primary" @click="save">
          Save
        </BaseButton>
      </template>
    </BaseModal>
  </BaseCard>
</template>
```

---

## 🚀 **Best Practices**

### ✅ **DO**
- Use semantic HTML elements
- Include proper accessibility attributes
- Provide meaningful `data-testid` values
- Follow the design system consistently
- Use TypeScript for all props and emits

### ❌ **DON'T**
- Add business logic to UI components
- Create components that are too specific to one feature
- Forget accessibility considerations
- Use inline styles instead of Tailwind classes
- Skip the `data-testid` prop for testable components

---

This completes the UI components reference. These components form the foundation of the application's user interface and should be used consistently throughout the codebase.
