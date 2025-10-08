# 🎯 Feature Components Reference

This document covers all feature-specific components in `src/features/branches/components/`. These components are specific to the branches feature and handle branch management functionality.

## 📋 **Feature Components Overview**

| Component | Purpose | Props | Emits | Usage |
|-----------|---------|-------|-------|-------|
| `AddBranchesModal.vue` | Modal for adding new branches | `modelValue` | `update:modelValue`, `branches-added` | Add branches interface |
| `BranchesCards.vue` | Card-based branch display | `branches`, `loading` | `update`, `delete` | Mobile branch view |
| `BranchesTable.vue` | Table-based branch display | `branches`, `loading` | `update`, `delete`, `enable`, `disable` | Desktop branch view |
| `BranchSettingsModal.vue` | Branch settings configuration | `modelValue`, `branch` | `update:modelValue`, `settings-updated` | Settings management |
| `DaySlots.vue` | Day-specific slot display | `day`, `slots`, `errors` | `update`, `add`, `remove` | Time slot management |
| `DisableAllButton.vue` | Bulk disable functionality | `branches`, `disabled` | `disable-all` | Bulk operations |
| `ReservationSettingsModal/DaySlotsEditor.vue` | Advanced slot editing | `modelValue` | `update:modelValue`, `update:valid` | Complex slot editing |
| `ReservationSettingsModal/DurationField.vue` | Duration input field | `modelValue`, `min`, `max` | `update:modelValue` | Duration configuration |
| `ReservationSettingsModal/SettingsModalIndex.vue` | Main settings modal | `modelValue`, `branch` | `update:modelValue`, `settings-updated` | Settings modal container |
| `ReservationSettingsModal/TablesList.vue` | Read-only tables display | `sections`, `reservableOnly` | *(none - read-only)* | Display tables context |

---

## ➕ **AddBranchesModal**

**File**: `src/features/branches/components/AddBranchesModal.vue`  
**Purpose**: Modal interface for adding new branches to the system

### **Props**
```typescript
interface Props {
  modelValue: boolean;  // v-model for modal open/close
}
```

### **Emits**
```typescript
interface Emits {
  (e: "update:modelValue", value: boolean): void;
  (e: "branches-added", branches: Branch[]): void;
}
```

### **Usage Examples**

#### **Basic Usage**
```vue
<template>
  <AddBranchesModal 
    v-model="showAddModal"
    @branches-added="handleBranchesAdded"
  />
</template>

<script setup>
import AddBranchesModal from '@/features/branches/components/AddBranchesModal.vue';

const showAddModal = ref(false);

const handleBranchesAdded = (newBranches: Branch[]) => {
  console.log('Added branches:', newBranches);
  // Update local state or refresh data
  fetchBranches();
};
</script>
```

#### **Triggered from Button**
```vue
<template>
  <BaseButton @click="showAddModal = true">
    Add New Branches
  </BaseButton>
  
  <AddBranchesModal 
    v-model="showAddModal"
    @branches-added="onBranchesAdded"
  />
</template>

<script setup>
const showAddModal = ref(false);

const onBranchesAdded = async (branches: Branch[]) => {
  // Refresh branches list
  await branchesStore.fetchBranches();
  showAddModal.value = false;
};
</script>
```

---

## 🃏 **BranchesCards**

**File**: `src/features/branches/components/BranchesCards.vue`  
**Purpose**: Card-based layout for displaying branches (mobile-friendly)

### **Props**
```typescript
interface Props {
  branches: Branch[];     // Array of branch data
  loading?: boolean;      // Loading state
}
```

### **Emits**
```typescript
interface Emits {
  (e: "update", branch: Branch): void;
  (e: "delete", id: string): void;
}
```

### **Usage Examples**

#### **Basic Usage**
```vue
<template>
  <BranchesCards 
    :branches="branches"
    :loading="loading"
    @update="handleBranchUpdate"
    @delete="handleBranchDelete"
  />
</template>

<script setup>
import BranchesCards from '@/features/branches/components/BranchesCards.vue';

const branches = ref<Branch[]>([]);
const loading = ref(false);

const handleBranchUpdate = (branch: Branch) => {
  // Navigate to settings or update inline
  showBranchSettings(branch);
};

const handleBranchDelete = async (id: string) => {
  const confirmed = await confirm({
    title: 'Delete Branch',
    message: 'Are you sure you want to delete this branch?',
    variant: 'danger'
  });
  
  if (confirmed) {
    await deleteBranch(id);
  }
};
</script>
```

#### **With Loading State**
```vue
<template>
  <div>
    <PageLoading v-if="loading" message="Loading branches..." />
    <BranchesCards 
      v-else
      :branches="branches"
      @update="handleUpdate"
      @delete="handleDelete"
    />
  </div>
</template>
```

---

## 📊 **BranchesTable**

**File**: `src/features/branches/components/BranchesTable.vue`  
**Purpose**: Table-based layout for displaying branches (desktop-friendly)

### **Props**
```typescript
interface Props {
  branches: Branch[];     // Array of branch data
  loading?: boolean;      // Loading state
}
```

### **Emits**
```typescript
interface Emits {
  (e: "update", branch: Branch): void;
  (e: "delete", id: string): void;
  (e: "enable", id: string): void;
  (e: "disable", id: string): void;
}
```

### **Usage Examples**

#### **Basic Usage**
```vue
<template>
  <BranchesTable 
    :branches="branches"
    :loading="loading"
    @update="handleBranchUpdate"
    @delete="handleBranchDelete"
    @enable="handleBranchEnable"
    @disable="handleBranchDisable"
  />
</template>

<script setup>
import BranchesTable from '@/features/branches/components/BranchesTable.vue';
import { useAsyncAction } from '@/composables/useAsyncAction';
import { useToast } from '@/composables/useToast';

const { busy, run } = useAsyncAction();
const { success, error } = useToast();

const handleBranchEnable = async (id: string) => {
  await run(async () => {
    await BranchesService.enableBranch(id);
    success('Branch enabled successfully');
  });
};

const handleBranchDisable = async (id: string) => {
  const confirmed = await confirm({
    title: 'Disable Branch',
    message: 'This will disable reservations for this branch.',
    variant: 'warning'
  });
  
  if (confirmed) {
    await run(async () => {
      await BranchesService.disableBranch(id);
      success('Branch disabled successfully');
    });
  }
};
</script>
```

#### **With Selection**
```vue
<template>
  <div>
    <BranchesTable 
      :branches="branches"
      @enable="handleEnable"
      @disable="handleDisable"
    />
    
    <div v-if="hasSelection" class="mt-4">
      <BaseButton @click="enableSelected">
        Enable Selected ({{ selectionCount }})
      </BaseButton>
      <BaseButton variant="danger" @click="disableSelected">
        Disable Selected
      </BaseButton>
    </div>
  </div>
</template>

<script setup>
const { hasSelection, selectionCount, selectedItems } = useBranchSelection(branches);

const enableSelected = async () => {
  for (const branch of selectedItems.value) {
    await BranchesService.enableBranch(branch.id);
  }
  success(`Enabled ${selectionCount.value} branches`);
};

const disableSelected = async () => {
  const confirmed = await confirm({
    title: 'Disable Selected Branches',
    message: `Disable ${selectionCount.value} branches?`,
    variant: 'warning'
  });
  
  if (confirmed) {
    for (const branch of selectedItems.value) {
      await BranchesService.disableBranch(branch.id);
    }
    success(`Disabled ${selectionCount.value} branches`);
  }
};
</script>
```

---

## ⚙️ **BranchSettingsModal**

**File**: `src/features/branches/components/BranchSettingsModal.vue`  
**Purpose**: Modal for configuring branch settings and reservation parameters

### **Props**
```typescript
interface Props {
  modelValue: boolean;  // v-model for modal open/close
  branch: Branch;       // Branch to configure
}
```

### **Emits**
```typescript
interface Emits {
  (e: "update:modelValue", value: boolean): void;
  (e: "settings-updated", branch: Branch): void;
}
```

### **Usage Examples**

#### **Basic Usage**
```vue
<template>
  <BranchSettingsModal 
    v-model="showSettings"
    :branch="selectedBranch"
    @settings-updated="handleSettingsUpdated"
  />
</template>

<script setup>
import BranchSettingsModal from '@/features/branches/components/BranchSettingsModal.vue';

const showSettings = ref(false);
const selectedBranch = ref<Branch | null>(null);

const openSettings = (branch: Branch) => {
  selectedBranch.value = branch;
  showSettings.value = true;
};

const handleSettingsUpdated = (updatedBranch: Branch) => {
  // Update local state
  const index = branches.value.findIndex(b => b.id === updatedBranch.id);
  if (index !== -1) {
    branches.value[index] = updatedBranch;
  }
  
  showSettings.value = false;
  success('Settings updated successfully');
};
</script>
```

---

## 📅 **DaySlots**

**File**: `src/features/branches/components/DaySlots.vue`  
**Purpose**: Display and manage time slots for a specific day

### **Props**
```typescript
interface Props {
  day: Weekday;                    // Day of the week
  slots: SlotTuple[];              // Time slots for the day
  errors?: string[];               // Validation errors
}
```

### **Emits**
```typescript
interface Emits {
  (e: "update", slots: SlotTuple[]): void;
  (e: "add"): void;
  (e: "remove", index: number): void;
}
```

### **Usage Examples**

#### **Basic Usage**
```vue
<template>
  <DaySlots 
    day="monday"
    :slots="mondaySlots"
    :errors="mondayErrors"
    @update="handleSlotsUpdate"
    @add="addSlot"
    @remove="removeSlot"
  />
</template>

<script setup>
import DaySlots from '@/features/branches/components/DaySlots.vue';

const mondaySlots = ref<SlotTuple[]>([["09:00", "17:00"]]);
const mondayErrors = ref<string[]>([]);

const handleSlotsUpdate = (newSlots: SlotTuple[]) => {
  mondaySlots.value = newSlots;
  validateSlots();
};

const addSlot = () => {
  mondaySlots.value.push(["09:00", "17:00"]);
};

const removeSlot = (index: number) => {
  mondaySlots.value.splice(index, 1);
};
</script>
```

---

## 🚫 **DisableAllButton**

**File**: `src/features/branches/components/DisableAllButton.vue`  
**Purpose**: Button component for bulk disabling of branches

### **Props**
```typescript
interface Props {
  branches: Branch[];    // Array of branches
  disabled?: boolean;    // Button disabled state
}
```

### **Emits**
```typescript
interface Emits {
  (e: "disable-all"): void;
}
```

### **Usage Examples**

#### **Basic Usage**
```vue
<template>
  <DisableAllButton 
    :branches="branches"
    :disabled="busy"
    @disable-all="handleDisableAll"
  />
</template>

<script setup>
import DisableAllButton from '@/features/branches/components/DisableAllButton.vue';

const { busy, run } = useAsyncAction();
const { success } = useToast();

const handleDisableAll = async () => {
  const confirmed = await confirm({
    title: 'Disable All Branches',
    message: 'This will disable reservations for all branches. Are you sure?',
    variant: 'danger'
  });
  
  if (confirmed) {
    await run(async () => {
      const promises = branches.value.map(branch => 
        BranchesService.disableBranch(branch.id)
      );
      await Promise.all(promises);
      success('All branches disabled successfully');
    });
  }
};
</script>
```

---

## 📝 **ReservationSettingsModal Components**

### **DaySlotsEditor**

**File**: `src/features/branches/components/ReservationSettingsModal/DaySlotsEditor.vue`  
**Purpose**: Advanced editor for managing time slots across multiple days

#### **Props**
```typescript
interface Props {
  modelValue: ReservationTimes;  // v-model for reservation times
}
```

#### **Emits**
```typescript
interface Emits {
  (e: "update:modelValue", value: ReservationTimes): void;
  (e: "update:valid", valid: boolean): void;
}
```

#### **Usage**
```vue
<template>
  <DaySlotsEditor 
    v-model="reservationTimes"
    @update:valid="handleValidityChange"
  />
</template>

<script setup>
import DaySlotsEditor from '@/features/branches/components/ReservationSettingsModal/DaySlotsEditor.vue';

const reservationTimes = ref<ReservationTimes>({
  saturday: [["09:00", "17:00"]],
  sunday: [["10:00", "16:00"]],
  // ... other days
});

const isValid = ref(false);

const handleValidityChange = (valid: boolean) => {
  isValid.value = valid;
};
</script>
```

### **DurationField**

**File**: `src/features/branches/components/ReservationSettingsModal/DurationField.vue`  
**Purpose**: Input field for setting reservation duration

#### **Props**
```typescript
interface Props {
  modelValue: number | null;  // Duration in minutes
  min?: number;               // Minimum duration
  max?: number;               // Maximum duration
}
```

#### **Emits**
```typescript
interface Emits {
  (e: "update:modelValue", value: number | null): void;
}
```

#### **Usage**
```vue
<template>
  <DurationField 
    v-model="duration"
    :min="30"
    :max="480"
  />
</template>

<script setup>
import DurationField from '@/features/branches/components/ReservationSettingsModal/DurationField.vue';

const duration = ref<number | null>(120); // 2 hours default
</script>
```

### **SettingsModalIndex**

**File**: `src/features/branches/components/ReservationSettingsModal/SettingsModalIndex.vue`  
**Purpose**: Main container for the reservation settings modal

#### **Props**
```typescript
interface Props {
  modelValue: boolean;  // v-model for modal open/close
  branch: Branch;       // Branch to configure
}
```

#### **Emits**
```typescript
interface Emits {
  (e: "update:modelValue", value: boolean): void;
  (e: "settings-updated", branch: Branch): void;
}
```

#### **Usage**
```vue
<template>
  <SettingsModalIndex 
    v-model="showModal"
    :branch="selectedBranch"
    @settings-updated="handleUpdate"
  />
</template>

<script setup>
import SettingsModalIndex from '@/features/branches/components/ReservationSettingsModal/SettingsModalIndex.vue';

const showModal = ref(false);
const selectedBranch = ref<Branch | null>(null);

const handleUpdate = (updatedBranch: Branch) => {
  // Update local state
  branches.value = branches.value.map(b => 
    b.id === updatedBranch.id ? updatedBranch : b
  );
  showModal.value = false;
};
</script>
```

### **DaySlotsEditor** ✨ **(CARD 9 - Day-by-Day Time Slots)**

**File**: `src/features/branches/components/ReservationSettingsModal/DaySlotsEditor.vue`  
**Purpose**: Advanced editor for managing time slots across multiple days with validation and apply-all functionality  
**Composable**: `useDaySlotsEditor` (manages slot operations and validation)

#### **Props**
```typescript
interface Props {
  modelValue: ReservationTimes;  // v-model for reservation times
}
```

#### **Emits**
```typescript
interface Emits {
  (e: "update:modelValue", value: ReservationTimes): void;
  (e: "update:valid", valid: boolean): void;
}
```

#### **Features**
- ✅ **Day-by-day editing** - All 7 days (Saturday-Friday) with fixed order
- ✅ **Slot management** - Add/edit/delete up to 3 slots per day
- ✅ **Apply to all days** - Copy Saturday slots to all other days with confirmation
- ✅ **Inline validation** - Real-time error display with i18n messages
- ✅ **Strict validation** - HH:mm format, start < end, no overlaps, no overnight
- ✅ **A11y compliant** - Fieldset groups, ARIA labels, keyboard navigation
- ✅ **RTL support** - Logical CSS properties, Arabic translations

#### **Usage**
```vue
<template>
  <DaySlotsEditor 
    v-model="reservationTimes"
    @update:valid="handleValidityChange"
  />
</template>

<script setup>
import DaySlotsEditor from '@/features/branches/components/ReservationSettingsModal/DaySlotsEditor.vue';

const reservationTimes = ref<ReservationTimes>({
  saturday: [["09:00", "17:00"]],
  sunday: [["10:00", "16:00"]],
  // ... other days
});

const isValid = ref(false);

const handleValidityChange = (valid: boolean) => {
  isValid.value = valid;
};
</script>
```

#### **Composable Integration**
The component uses `useDaySlotsEditor` composable which provides:
- `weekdays` - Fixed day order (Saturday-Friday)
- `dayErrors` - Per-day validation errors
- `addSlot(day)` - Add new slot to specific day
- `removeSlot(day, index)` - Remove slot by index
- `updateSlot(day, index, field, value)` - Update slot field
- `applyToAllDaysWithConfirm(sourceDay)` - Apply Saturday slots to all days

#### **Validation Rules**
- **Format**: Must be HH:mm (24-hour format)
- **Order**: Start time must be before end time
- **Overlaps**: No overlapping slots (touching edges allowed)
- **Overnight**: No slots spanning midnight (22:00-02:00)
- **Limit**: Maximum 3 slots per day
- **Required**: At least one slot per day

#### **Test IDs**
- `day-slots-editor` — Main wrapper
- `day-slots-day-{day}` — Day fieldset
- `day-slots-add-{day}` — Add slot button
- `day-slots-apply-all` — Apply to all days button
- `day-slots-error-{day}` — Error message container

#### **Rationale**
This component handles complex time slot management while staying tiny (~120 lines) by extracting all logic to the `useDaySlotsEditor` composable and pure utility functions. The validation is strict to prevent invalid configurations, and the apply-all feature makes initial setup efficient.

---

**File**: `src/features/branches/components/ReservationSettingsModal/TablesList.vue`  
**Purpose**: Read-only display of tables and sections with reservable count summary  
**Helpers**: `src/utils/tables.ts` (pure counting/formatting logic)

#### **Props**
```typescript
interface Props {
  sections: Section[];          // Array of sections with tables
  reservableOnly?: boolean;     // Default false; if true, show only reservable tables
}
```

#### **Emits**
```typescript
// None - this is a read-only component
```

#### **Features**
- ✅ **Display-only** - No edits, strictly presentational
- ✅ **Summary count** - Shows "Reservable tables: X" via pure helper
- ✅ **Formatted labels** - "Section Name – Table Name" with i18n fallbacks
- ✅ **Semantic structure** - `<ul role="list">` for accessibility
- ✅ **RTL support** - Logical CSS, Arabic translations
- ✅ **Pure helpers** - Logic extracted to `src/utils/tables.ts`

#### **Usage**
```vue
<template>
  <!-- Basic read-only display -->
  <TablesList :sections="branch.sections ?? []" />
  
  <!-- Show only reservable tables -->
  <TablesList 
    :sections="branch.sections ?? []"
    :reservableOnly="true"
  />
</template>

<script setup>
import TablesList from '@/features/branches/components/ReservationSettingsModal/TablesList.vue';

// In parent modal (SettingsModalIndex.vue)
const branch = ref<Branch | null>(null);

// TablesList is strictly read-only - no handlers needed
</script>
```

#### **Pure Helpers (src/utils/tables.ts)**
```typescript
// Count reservable tables across sections
reservableTablesCount(sections: Section[] | undefined): number

// Format table label with i18n fallbacks
formatTableLabel(
  sectionName: string | null | undefined, 
  tableName: string | null | undefined, 
  t: (key: string) => string
): string
```

#### **Test IDs**
- `settings-tables` — Wrapper
- `settings-tables-summary` — Summary count
- `settings-tables-list` — Semantic list
- `settings-tables-section-{id}` — Section item
- `settings-tables-table-{id}` — Table item

#### **Rationale**
The tables section is **display-only** because the settings modal PUT endpoint only updates `reservation_duration` and `reservation_times`. Table-level reservation toggles are out of scope for now. This component provides context to users while keeping the SFC tiny (~95 lines) by extracting logic to pure helpers.

---

## 🎯 **Feature Component Patterns**

### **1. Modal Pattern**
Most feature components follow a consistent modal pattern:
```vue
<template>
  <BaseModal v-model="isOpen" :title="title">
    <!-- Modal content -->
    <template #actions>
      <BaseButton variant="ghost" @click="close">Cancel</BaseButton>
      <BaseButton variant="primary" @click="save">Save</BaseButton>
    </template>
  </BaseModal>
</template>

<script setup>
const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
}>();

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value)
});
</script>
```

### **2. Data Display Pattern**
Components that display data follow this pattern:
```vue
<template>
  <div>
    <div v-if="loading">
      <PageLoading />
    </div>
    <div v-else-if="items.length === 0">
      <EmptyState 
        title="No items found"
        description="Add your first item to get started."
        action-text="Add Item"
        @action="$emit('add')"
      />
    </div>
    <div v-else>
      <!-- Display items -->
    </div>
  </div>
</template>
```

### **3. Form Pattern**
Form components follow this pattern:
```vue
<template>
  <form @submit.prevent="handleSubmit">
    <BaseInput 
      v-model="form.name"
      :error="errors.name"
      placeholder="Enter name"
    />
    
    <div class="flex justify-end gap-3 mt-6">
      <BaseButton variant="ghost" @click="cancel">
        Cancel
      </BaseButton>
      <BaseButton 
        type="submit" 
        :loading="busy"
        :disabled="!isValid"
      >
        Save
      </BaseButton>
    </div>
  </form>
</template>
```

---

## 🚀 **Best Practices**

### ✅ **DO**
- Keep components focused on a single responsibility
- Use proper TypeScript types for props and emits
- Handle loading and error states appropriately
- Follow the established modal and form patterns
- Use global UI components for consistency
- Include proper accessibility attributes

### ❌ **DON'T**
- Mix business logic with UI components
- Create components that are too specific to one use case
- Forget to handle edge cases (empty states, loading, errors)
- Skip TypeScript types for props and emits
- Use inline styles instead of Tailwind classes
- Forget to emit events for parent component communication

---

This completes the feature components reference. These components provide the specific functionality for branch management within the application.
