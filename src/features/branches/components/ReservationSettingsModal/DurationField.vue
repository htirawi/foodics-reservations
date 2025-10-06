<script setup lang="ts">/**
 * @file DurationField.vue
 * @summary Module: src/features/branches/components/ReservationSettingsModal/DurationField.vue
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */
import { computed, useId, watch, ref, nextTick } from "vue";
import { useI18n } from "vue-i18n";
import { sanitizeDuration, isValidDuration, type DurationOptions } from "@/features/branches/utils/reservation.validation";
const props = withDefaults(defineProps<{
    modelValue: number | null;
    min?: number;
    max?: number;
}>(), {
    min: 1,
    max: 480,
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
const options = computed<DurationOptions>(() => ({
    min: props.min,
    max: props.max,
}));
const rawValue = ref<string>("");
watch(() => props.modelValue, (newValue) => {
    if (newValue !== null && newValue !== undefined) {
        rawValue.value = String(newValue);
    }
}, { immediate: true });
const isValid = computed<boolean>(() => {
    if (rawValue.value !== "") {
        const rawNum = parseInt(rawValue.value, 10);
        if (!Number.isNaN(rawNum)) {
            return rawNum >= props.min && Number.isInteger(rawNum);
        }
        return false;
    }
    return isValidDuration(props.modelValue, options.value);
});
function validateRawInput(rawValue: string, min: number, max: number): string | undefined {
    const rawNum = parseInt(rawValue, 10);
    if (rawValue && !Number.isNaN(rawNum)) {
        if (rawNum < min)
            return t("settings.duration.errors.min", { min });
        if (rawNum > max)
            return t("settings.duration.errors.max", { max });
        if (!Number.isInteger(rawNum))
            return t("settings.duration.errors.integer");
    }
    return undefined;
}
const error = computed<string | undefined>(() => {
    const rawError = validateRawInput(rawValue.value, props.min, props.max);
    if (rawError)
        return rawError;
    if (isValid.value)
        return undefined;
    if (props.modelValue === null || props.modelValue === undefined) {
        return t("settings.duration.errors.required");
    }
    return undefined;
});
watch(isValid, (valid) => {
    emit("valid:duration", valid);
}, { immediate: true });
function handleInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    rawValue.value = target.value;
    const sanitized = sanitizeDuration(target.value, options.value);
    if (sanitized !== null && sanitized !== parseInt(target.value, 10)) {
        rawValue.value = String(sanitized);
        nextTick();
    }
    emit("update:modelValue", sanitized);
}
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
      type="number"
      :min="min"
      :max="max"
      step="1"
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

