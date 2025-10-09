<script setup lang="ts">
import { computed, useId, watch } from "vue";

import { useI18n } from "vue-i18n";

import { MIN_DURATION_MINUTES, MAX_DURATION_MINUTES } from "@/constants/reservations";
import { useDurationField } from "@/features/branches/composables/useDurationField";

const props = withDefaults(defineProps<{
    modelValue: number | null;
    min?: number;
    max?: number;
}>(), {
    min: MIN_DURATION_MINUTES,
    max: MAX_DURATION_MINUTES,
});
const emit = defineEmits<{
    "update:modelValue": [
        value: number | null
    ];
    "valid:duration": [
        valid: boolean
    ];
}>();
const { t } = useI18n();
const inputId = useId();
const errorId = useId();

const { rawValue, isValid, error: composableError, handleInput } = useDurationField(props, emit);

const error = computed(() => {
    const composableErr = composableError.value;
    if (!composableErr) return undefined;

    const errorMap = {
        MIN: () => t("settings.duration.errors.min", { min: composableErr.min ?? props.min }),
        MAX: () => t("settings.duration.errors.max", { max: composableErr.max ?? props.max }),
        INTEGER: () => t("settings.duration.errors.integer"),
        REQUIRED: () => t("settings.duration.errors.required"),
    };

    return errorMap[composableErr.code]();
});

watch(isValid, (valid) => {
    emit("valid:duration", valid);
}, { immediate: true });
</script>

<template>
  <div data-testid="settings-duration">
    <label :for="inputId" class="mb-2 block text-sm font-medium text-neutral-700">
      {{ t('settings.duration.label') }}
      <span class="text-error-600">*</span>
    </label>
    
    <input
      :id="inputId"
      v-model="rawValue"
      type="text"
      inputmode="numeric"
      pattern="[0-9]*"
      :placeholder="t('settings.duration.placeholder')"
      :aria-invalid="!isValid"
      :aria-describedby="error ? errorId : undefined"
      class="block w-full rounded-xl border px-4 py-3 text-neutral-900 transition-colors focus:outline-none focus:ring-2"
      :class="[
        error
          ? 'border-error-300 focus:border-error-500 focus:ring-error-500/20'
          : 'border-neutral-300 focus:border-primary-500 focus:ring-primary-500/20'
      ]"
      data-testid="settings-duration-input"
      @input="handleInput"
    />

    <div
      v-if="error"
      :id="errorId"
      role="alert"
      aria-live="polite"
      class="mt-2 text-sm text-error-600"
      data-testid="settings-duration-error"
    >
      {{ error }}
    </div>
  </div>
</template>

