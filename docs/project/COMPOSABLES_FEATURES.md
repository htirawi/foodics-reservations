# 🔧 Feature Composables Reference

This document covers all feature-specific composables in `src/features/branches/composables/`. These composables contain logic specific to the branches feature.

## 📋 **Feature Composables Overview**

| Composable | Purpose | Returns | Usage |
|------------|---------|---------|-------|
| `useBranchSelection` | Branch-specific selection logic | Selection state and actions | Branch multi-select |
| `useDaySlotsEditor` | Advanced slot editing logic | Slot management functions | Complex time slot editing |
| `useDurationField` | Duration input field logic | Field state and validation | Duration configuration |
| `useSettingsForm` | Settings form management | Form state and validation | Branch settings forms |
| `useSettingsValidation` | Settings validation logic | Validation functions | Form validation |

---

## 🎯 **useBranchSelection**

**File**: `src/features/branches/composables/useBranchSelection.ts`  
**Purpose**: Branch-specific selection logic with additional branch operations

### **Type Definition**
```typescript
interface UseBranchSelectionReturn {
  // Selection state
  selectedIds: Ref<string[]>;
  selectedItems: Ref<Branch[]>;
  selectedIdsSet: Ref<Set<string>>;
  isAllSelected: Ref<boolean>;
  hasSelection: Ref<boolean>;
  selectionCount: Ref<number>;
  
  // Selection actions
  isSelected: (id: string) => boolean;
  toggleOne: (id: string) => void;
  toggleAll: () => void;
  setSelected: (ids: string[]) => void;
  clearSelection: () => void;
  
  // Branch-specific actions
  selectEnabled: () => void;
  selectDisabled: () => void;
  selectByStatus: (status: string) => void;
}
```

### **Usage Examples**

#### **Basic Selection**
```vue
<template>
  <div>
    <BaseButton 
      :disabled="!hasSelection"
      @click="enableSelected"
    >
      Enable Selected ({{ selectionCount }})
    </BaseButton>
    
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
import { useBranchSelection } from '@/features/branches/composables/useBranchSelection';

const branches = ref<Branch[]>([]);

const {
  selectedIds,
  selectedItems,
  hasSelection,
  selectionCount,
  isSelected,
  toggleOne,
  clearSelection
} = useBranchSelection(branches);

const enableSelected = async () => {
  for (const branch of selectedItems.value) {
    await BranchesService.enableBranch(branch.id);
  }
  success('Branches enabled successfully');
  clearSelection();
};
</script>
```

#### **Advanced Selection**
```vue
<script setup>
const {
  selectEnabled,
  selectDisabled,
  selectByStatus,
  toggleAll
} = useBranchSelection(branches);

// Select only enabled branches
const selectEnabledBranches = () => {
  selectEnabled();
};

// Select only disabled branches
const selectDisabledBranches = () => {
  selectDisabled();
};

// Select branches by specific status
const selectBySpecificStatus = () => {
  selectByStatus('active');
};

// Toggle all branches
const toggleAllBranches = () => {
  toggleAll();
};
</script>
```

---

## 📅 **useDaySlotsEditor**

**File**: `src/features/branches/composables/useDaySlotsEditor.ts`  
**Purpose**: Advanced logic for editing time slots across multiple days with validation and confirmation dialogs

### **Type Definition**
```typescript
interface UseDaySlotsEditorReturn {
  weekdays: Weekday[];  // Fixed day order (Saturday-Friday)
  dayErrors: ComputedRef<Record<Weekday, string[]>>;  // Per-day validation errors
  addSlot: (day: Weekday) => void;  // Add new slot to day
  removeSlot: (day: Weekday, index: number) => void;  // Remove slot by index
  updateSlot: (day: Weekday, index: number, field: "from" | "to", value: string) => void;  // Update slot field
  applyToAllDaysWithConfirm: (sourceDay: Weekday) => Promise<void>;  // Apply slots with confirmation
  canAddSlot: (day: Weekday) => boolean;  // Check if can add more slots (max 3)
  getDaySlots: (day: Weekday) => SlotTuple[];  // Get normalized slots for day
  validateDaySlotsFor: (day: Weekday) => { ok: boolean; errors: string[] };  // Validate specific day
}
```

### **Usage Examples**

#### **Basic Usage**
```vue
<template>
  <div>
    <div v-for="day in weekdays" :key="day">
      <h3>{{ $t(`days.${day}`) }}</h3>
      
      <div v-for="(slot, index) in modelValue[day]" :key="index">
        <BaseInput 
          :model-value="slot[0]"
          @update:model-value="(value) => updateSlot(day, index, 'from', value)"
          placeholder="Start time"
        />
        <BaseInput 
          :model-value="slot[1]"
          @update:model-value="(value) => updateSlot(day, index, 'to', value)"
          placeholder="End time"
        />
        <BaseButton @click="removeSlot(day, index)">
          Remove
        </BaseButton>
      </div>
      
      <BaseButton @click="addSlot(day)">
        Add Slot
      </BaseButton>
      
      <div v-if="dayErrors[day].length > 0" class="text-red-600">
        <div v-for="error in dayErrors[day]" :key="error">
          {{ error }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useDaySlotsEditor } from '@/features/branches/composables/useDaySlotsEditor';

const props = defineProps<{
  modelValue: ReservationTimes;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: ReservationTimes): void;
}>();

const {
  weekdays,
  dayErrors,
  addSlot,
  removeSlot,
  updateSlot,
  applyToAllDays
} = useDaySlotsEditor(props.modelValue, emit);
</script>
```

#### **Apply to All Days with Confirmation**
```vue
<template>
  <div v-for="day in weekdays" :key="day">
    <div class="flex items-center gap-2">
      <h3>{{ $t(`days.${day}`) }}</h3>
      <BaseButton 
        v-if="day === 'saturday'"
        size="sm" 
        variant="ghost"
        @click="applyToAllDaysWithConfirm('saturday')"
      >
        Apply to All Days
      </BaseButton>
    </div>
    
    <!-- Day slots content -->
  </div>
</template>

<script setup>
const { applyToAllDaysWithConfirm } = useDaySlotsEditor(modelValue, emit);

// This will show a confirmation dialog before copying Saturday slots to all other days
</script>
```

#### **Advanced Usage with Validation**
```vue
<template>
  <div v-for="day in weekdays" :key="day">
    <fieldset :aria-labelledby="`day-label-${day}`">
      <legend :id="`day-label-${day}`">{{ $t(`days.${day}`) }}</legend>
      
      <div v-for="(slot, index) in getDaySlots(day)" :key="index">
        <BaseInput 
          :model-value="slot[0]"
          @update:model-value="(value) => updateSlot(day, index, 'from', value)"
          placeholder="Start time"
        />
        <BaseInput 
          :model-value="slot[1]"
          @update:model-value="(value) => updateSlot(day, index, 'to', value)"
          placeholder="End time"
        />
        <BaseButton @click="removeSlot(day, index)">
          Remove
        </BaseButton>
      </div>
      
      <BaseButton 
        v-if="canAddSlot(day)"
        @click="addSlot(day)"
      >
        Add Slot
      </BaseButton>
      
      <div v-if="dayErrors[day].length > 0" role="alert" aria-live="polite">
        <div v-for="error in dayErrors[day]" :key="error">
          {{ $t(error) }}
        </div>
      </div>
    </fieldset>
  </div>
</template>

<script setup>
const {
  weekdays,
  dayErrors,
  addSlot,
  removeSlot,
  updateSlot,
  canAddSlot,
  getDaySlots,
  validateDaySlotsFor
} = useDaySlotsEditor(modelValue, emit);

// Check validation for a specific day
const mondayValidation = computed(() => validateDaySlotsFor('monday'));
</script>
```

---

## 🔧 **slotEditorActions**

**File**: `src/features/branches/composables/slotEditorActions.ts`  
**Purpose**: Pure CRUD operations for time slots (extracted from useDaySlotsEditor for reusability)

### **Type Definition**
```typescript
interface SlotUpdateParams {
  day: Weekday;
  index: number;
  field: "from" | "to";
  value: string;
}

// Pure utility functions
const WEEKDAY_ORDER: Weekday[] = ["saturday", "sunday", "monday", "tuesday", "wednesday", "thursday", "friday"];

// CRUD operations
addSlotToDay(modelValue: ReservationTimes, day: Weekday): ReservationTimes
removeSlotFromDay(modelValue: ReservationTimes, day: Weekday, index: number): ReservationTimes
updateSlotField(modelValue: ReservationTimes, params: SlotUpdateParams): ReservationTimes
applyToAllDays(modelValue: ReservationTimes, sourceDay: Weekday): ReservationTimes
```

### **Usage Examples**

#### **Basic Slot Operations**
```typescript
import { addSlotToDay, removeSlotFromDay, updateSlotField } from '@/features/branches/composables/slotEditorActions';

// Add a new slot to Monday
const newTimes = addSlotToDay(reservationTimes.value, "monday");

// Remove the second slot from Tuesday
const updatedTimes = removeSlotFromDay(reservationTimes.value, "tuesday", 1);

// Update a slot field
const modifiedTimes = updateSlotField(reservationTimes.value, {
  day: "wednesday",
  index: 0,
  field: "from",
  value: "10:00"
});
```

#### **Apply to All Days**
```typescript
import { applyToAllDays } from '@/features/branches/composables/slotEditorActions';

// Copy Saturday slots to all other days
const allDaysTimes = applyToAllDays(reservationTimes.value, "saturday");
```

### **Benefits**
- ✅ **Pure functions** - No side effects, easy to test
- ✅ **Reusable** - Can be used in other composables/components
- ✅ **Type-safe** - Full TypeScript support
- ✅ **Immutable** - Returns new objects, doesn't mutate input
- ✅ **Focused** - Single responsibility for slot operations

---

## ⏱️ **useDurationField**

**File**: `src/features/branches/composables/useDurationField.ts`  
**Purpose**: Logic for duration input field with validation

### **Type Definition**
```typescript
interface UseDurationFieldOptions {
  modelValue: number | null;
  min?: number;
  max?: number;
}

interface UseDurationFieldReturn {
  rawValue: Ref<string>;
  isValid: ComputedRef<boolean>;
  error: ComputedRef<string | undefined>;
  handleInput: (event: Event) => Promise<void>;
}
```

### **Usage Examples**

#### **Basic Usage**
```vue
<template>
  <div>
    <BaseInput
      v-model="rawValue"
      @input="handleInput"
      placeholder="Duration in minutes"
      :class="{ 'border-red-500': !isValid }"
    />
    
    <div v-if="error" class="text-red-600 text-sm mt-1">
      {{ error }}
    </div>
    
    <div class="text-sm text-gray-600 mt-1">
      Duration: {{ modelValue ? `${modelValue} minutes` : 'Not set' }}
    </div>
  </div>
</template>

<script setup>
import { useDurationField } from '@/features/branches/composables/useDurationField';

const props = defineProps<{
  modelValue: number | null;
  min?: number;
  max?: number;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: number | null): void;
}>();

const {
  rawValue,
  isValid,
  error,
  handleInput
} = useDurationField({
  modelValue: props.modelValue,
  min: props.min,
  max: props.max
});

// Watch for changes and emit to parent
watch(() => props.modelValue, (newValue) => {
  // Update internal state when parent changes
}, { immediate: true });
</script>
```

#### **With Validation**
```vue
<template>
  <form @submit.prevent="handleSubmit">
    <DurationField 
      v-model="duration"
      :min="30"
      :max="480"
      ref="durationFieldRef"
    />
    
    <BaseButton 
      type="submit"
      :disabled="!durationFieldRef?.isValid"
    >
      Save Settings
    </BaseButton>
  </form>
</template>

<script setup>
import DurationField from '@/features/branches/components/ReservationSettingsModal/DurationField.vue';

const duration = ref<number | null>(120);
const durationFieldRef = ref<InstanceType<typeof DurationField>>();

const handleSubmit = () => {
  if (durationFieldRef.value?.isValid) {
    // Form is valid, proceed with save
    saveSettings({ duration: duration.value });
  }
};
</script>
```

---

## ⚙️ **useSettingsForm**

**File**: `src/features/branches/composables/useSettingsForm.ts`  
**Purpose**: Form state management for branch settings

### **Type Definition**
```typescript
interface UseSettingsFormReturn {
  formData: Ref<BranchSettings>;
  errors: Ref<ValidationErrors>;
  isValid: ComputedRef<boolean>;
  isDirty: ComputedRef<boolean>;
  updateField: (field: keyof BranchSettings, value: any) => void;
  validateForm: () => boolean;
  resetForm: () => void;
  submitForm: () => Promise<void>;
}
```

### **Usage Examples**

#### **Basic Form**
```vue
<template>
  <form @submit.prevent="submitForm">
    <div>
      <label>Branch Name</label>
      <BaseInput 
        :model-value="formData.name"
        @update:model-value="(value) => updateField('name', value)"
        :class="{ 'border-red-500': errors.name }"
      />
      <div v-if="errors.name" class="text-red-600 text-sm">
        {{ errors.name }}
      </div>
    </div>
    
    <div>
      <label>Description</label>
      <BaseInput 
        :model-value="formData.description"
        @update:model-value="(value) => updateField('description', value)"
      />
    </div>
    
    <div class="flex justify-end gap-3 mt-6">
      <BaseButton 
        type="button" 
        variant="ghost" 
        @click="resetForm"
        :disabled="!isDirty"
      >
        Reset
      </BaseButton>
      <BaseButton 
        type="submit"
        :disabled="!isValid"
        :loading="busy"
      >
        Save Settings
      </BaseButton>
    </div>
  </form>
</template>

<script setup>
import { useSettingsForm } from '@/features/branches/composables/useSettingsForm';
import { useAsyncAction } from '@/composables/useAsyncAction';

const props = defineProps<{
  branch: Branch;
}>();

const { busy, run } = useAsyncAction();

const {
  formData,
  errors,
  isValid,
  isDirty,
  updateField,
  validateForm,
  resetForm,
  submitForm
} = useSettingsForm(props.branch);

const handleSubmit = async () => {
  await run(async () => {
    await submitForm();
    success('Settings saved successfully');
  });
};
</script>
```

#### **Complex Form with Nested Data**
```vue
<template>
  <form @submit.prevent="handleSubmit">
    <!-- Basic fields -->
    <BaseInput 
      :model-value="formData.name"
      @update:model-value="(value) => updateField('name', value)"
    />
    
    <!-- Duration field -->
    <DurationField 
      :model-value="formData.reservation_duration"
      @update:model-value="(value) => updateField('reservation_duration', value)"
    />
    
    <!-- Time slots -->
    <DaySlotsEditor 
      :model-value="formData.reservation_times"
      @update:model-value="(value) => updateField('reservation_times', value)"
    />
    
    <!-- Submit button -->
    <BaseButton 
      type="submit"
      :disabled="!isValid"
      :loading="busy"
    >
      Save All Settings
    </BaseButton>
  </form>
</template>

<script setup>
const { updateField, submitForm, isValid } = useSettingsForm(branch);

const handleSubmit = async () => {
  if (validateForm()) {
    await submitForm();
  }
};
</script>
```

---

## ✅ **useSettingsValidation**

**File**: `src/features/branches/composables/useSettingsValidation.ts`  
**Purpose**: Validation logic for branch settings forms

### **Type Definition**
```typescript
interface UseSettingsValidationReturn {
  validateDuration: (duration: number | null) => string | undefined;
  validateSlots: (slots: Record<Weekday, SlotTuple[]>) => ValidationErrors;
  validateForm: (settings: BranchSettings) => ValidationErrors;
  hasErrors: (errors: ValidationErrors) => boolean;
}
```

### **Usage Examples**

#### **Duration Validation**
```vue
<script setup>
import { useSettingsValidation } from '@/features/branches/composables/useSettingsValidation';

const { validateDuration } = useSettingsValidation();

const duration = ref<number | null>(null);
const durationError = computed(() => validateDuration(duration.value));

// Use in template
</script>

<template>
  <BaseInput 
    v-model="duration"
    :class="{ 'border-red-500': durationError }"
    placeholder="Duration in minutes"
  />
  <div v-if="durationError" class="text-red-600 text-sm">
    {{ durationError }}
  </div>
</template>
```

#### **Slots Validation**
```vue
<script setup>
const { validateSlots } = useSettingsValidation();

const reservationTimes = ref<Record<Weekday, SlotTuple[]>>({});
const slotErrors = computed(() => validateSlots(reservationTimes.value));

// Check for specific day errors
const getDayErrors = (day: Weekday) => {
  return slotErrors.value.slots?.[day] || [];
};

// Check if form has any errors
const hasAnyErrors = computed(() => {
  return Object.values(slotErrors.value.slots || {}).some(errors => errors.length > 0);
});
</script>

<template>
  <div v-for="day in weekdays" :key="day">
    <h3>{{ $t(`days.${day}`) }}</h3>
    
    <!-- Day slots editor -->
    
    <div v-if="getDayErrors(day).length > 0" class="text-red-600">
      <div v-for="error in getDayErrors(day)" :key="error">
        {{ error }}
      </div>
    </div>
  </div>
  
  <BaseButton 
    :disabled="hasAnyErrors"
    @click="saveSettings"
  >
    Save Settings
  </BaseButton>
</template>
```

#### **Complete Form Validation**
```vue
<script setup>
const { validateForm } = useSettingsValidation();

const settings = ref<BranchSettings>({
  name: '',
  description: '',
  reservation_duration: null,
  reservation_times: {}
});

const formErrors = computed(() => validateForm(settings.value));
const isFormValid = computed(() => !hasErrors(formErrors.value));

const handleSubmit = async () => {
  if (isFormValid.value) {
    await saveSettings(settings.value);
  } else {
    // Show validation errors
    console.error('Form validation failed:', formErrors.value);
  }
};
</script>
```

---

## 🎯 **Feature Composable Patterns**

### **1. State Management Pattern**
```typescript
export function useFeatureState<T>(initialValue: T) {
  const state = ref<T>(initialValue);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const updateState = (newValue: T) => {
    state.value = newValue;
  };

  const resetState = () => {
    state.value = initialValue;
    error.value = null;
  };

  return {
    state,
    loading,
    error,
    updateState,
    resetState
  };
}
```

### **2. Form Pattern**
```typescript
export function useFeatureForm<T>(initialData: T) {
  const formData = ref<T>({ ...initialData });
  const errors = ref<Record<string, string>>({});
  const isDirty = ref(false);

  const updateField = (field: keyof T, value: any) => {
    formData.value[field] = value;
    isDirty.value = true;
    // Clear field error when user starts typing
    if (errors.value[field as string]) {
      delete errors.value[field as string];
    }
  };

  const validateField = (field: keyof T) => {
    // Validation logic
  };

  const resetForm = () => {
    formData.value = { ...initialData };
    errors.value = {};
    isDirty.value = false;
  };

  return {
    formData,
    errors,
    isDirty,
    updateField,
    validateField,
    resetForm
  };
}
```

### **3. API Integration Pattern**
```typescript
export function useFeatureApi() {
  const { busy, run } = useAsyncAction();
  const { success, error } = useToast();

  const performAction = async <T>(apiCall: () => Promise<T>): Promise<T | null> => {
    try {
      const result = await run(apiCall);
      success('Operation completed successfully');
      return result;
    } catch (err) {
      error('Operation failed');
      return null;
    }
  };

  return {
    busy,
    performAction
  };
}
```

---

## 🚀 **Best Practices**

### ✅ **DO**
- Keep composables focused on specific feature logic
- Use TypeScript for all composable interfaces
- Handle loading and error states appropriately
- Provide clear, descriptive function names
- Use computed properties for derived state
- Test composables thoroughly

### ❌ **DON'T**
- Put DOM manipulation in composables
- Create composables that are too generic
- Forget to handle edge cases
- Skip error handling in async operations
- Make composables too tightly coupled to specific components
- Ignore TypeScript types

---

This completes the feature composables reference. These composables provide the specific logic needed for branch management functionality within the application.
