<script setup lang="ts">
import { computed } from "vue";

import { ID_PREFIX_INPUT, RADIX_BASE36, ID_RANDOM_SLICE_START, ID_RANDOM_SLICE_END } from "@/constants/html";

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

const inputId = computed(() => `${ID_PREFIX_INPUT}${Math.random().toString(RADIX_BASE36).slice(ID_RANDOM_SLICE_START, ID_RANDOM_SLICE_END)}`);

const inputClasses = computed(() => {
    const base = "block w-full rounded-lg border px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-neutral-100 disabled:cursor-not-allowed";
    const errorClass = props.error ? "border-danger-300" : "border-neutral-300";
    return `${base} ${errorClass}`;
});
</script>

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
