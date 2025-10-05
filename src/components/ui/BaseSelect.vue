<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="w-full">
    <label
      v-if="label"
      :for="selectId"
      class="block text-sm font-medium text-neutral-700 mb-2"
    >
      {{ label }}
      <span v-if="required" class="text-danger-500">*</span>
    </label>
    <select
      :id="selectId"
      :value="modelValue"
      :disabled="disabled"
      :required="required"
      :data-testid="dataTestid"
      class="block w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-neutral-100 disabled:cursor-not-allowed"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
      <slot />
    </select>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

withDefaults(
  defineProps<{
    modelValue?: string | number;
    label?: string;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    dataTestid?: string;
  }>(),
  {
    disabled: false,
    required: false,
  }
);

defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const selectId = computed(() => `select-${Math.random().toString(36).slice(2, 9)}`);
</script>
