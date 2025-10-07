<template>
  <div class="w-full">
    <label
      v-if="label"
      :for="inputId"
      class="block text-sm font-medium text-neutral-700 mb-2"
    >
      {{ label }}
      <span v-if="required" class="text-danger-500">*</span>
    </label>
    <input
      :id="inputId"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :data-testid="dataTestid"
      :class="inputClasses"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    >
    <p v-if="error" class="mt-1 text-sm text-danger-600">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">/**
 * @file BaseInput.vue
 * @summary Module: src/components/ui/BaseInput.vue
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */
import { computed } from "vue";
const props = withDefaults(defineProps<{
    modelValue?: string | number;
    type?: string | undefined;
    label?: string | undefined;
    placeholder?: string | undefined;
    disabled?: boolean | undefined;
    required?: boolean | undefined;
    error?: string | undefined;
    dataTestid?: string | undefined;
}>(), {
    modelValue: "",
    type: "text",
    label: "",
    placeholder: "",
    disabled: false,
    required: false,
    error: "",
    dataTestid: "",
});
defineEmits<{
    (e: "update:modelValue", value: string): void;
}>();
const inputId = computed(() => `input-${Math.random().toString(36).slice(2, 9)}`);
const inputClasses = computed(() => {
    const base = "block w-full rounded-lg border px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-neutral-100 disabled:cursor-not-allowed";
    const errorClass = props.error ? "border-danger-300" : "border-neutral-300";
    return `${base} ${errorClass}`;
});
</script>
