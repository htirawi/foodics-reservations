/**
 * @file useDurationField.ts
 * @summary Module: src/features/branches/composables/useDurationField.ts
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */
import { computed, ref, watch, nextTick, type Ref, type ComputedRef } from "vue";
import { sanitizeDuration, isValidDuration, type DurationOptions } from "@/features/branches/utils/reservation.validation";

import type { IUseDurationFieldOptions, IUseDurationFieldReturn } from "@/types/duration";

function validateRawDuration(rawValue: string, min: number, max: number): string | null {
    const rawNum = parseInt(rawValue, 10);
    if (rawValue && !Number.isNaN(rawNum)) {
        if (rawNum < min) return "Duration must be at least " + min + " minutes";
        if (rawNum > max) return "Duration must be at most " + max + " minutes";
        if (!Number.isInteger(rawNum)) return "Duration must be a whole number";
    }
    return null;
}

function createDurationState(props: IUseDurationFieldOptions) {
    const options = computed<DurationOptions>(() => ({
        min: props.min ?? 1,
        max: props.max ?? 480,
    }));

    const rawValue = ref<string>("");

    watch(() => props.modelValue, (newValue) => {
        if (newValue !== null && newValue !== undefined) {
            rawValue.value = String(newValue);
        }
    }, { immediate: true });

    return { options, rawValue };
}

function createDurationValidation(props: IUseDurationFieldOptions, rawValue: Ref<string>, options: ComputedRef<DurationOptions>) {
    const isValid = computed<boolean>(() => {
        if (rawValue.value !== "") {
            const rawNum = parseInt(rawValue.value, 10);
            if (!Number.isNaN(rawNum)) {
                return rawNum >= (props.min ?? 1) && Number.isInteger(rawNum);
            }
            return false;
        }
        return isValidDuration(props.modelValue, options.value);
    });

    const error = computed<string | undefined>(() => {
        const min = props.min ?? 1;
        const max = props.max ?? 480;
        
        const rawError = validateRawDuration(rawValue.value, min, max);
        if (rawError) return rawError;
        
        if (!isValid.value && (props.modelValue === null || props.modelValue === undefined)) {
            return "Duration is required";
        }
        
        return undefined;
    });

    return { isValid, error };
}

/**
 * Composable for handling duration field input logic
 */
export function useDurationField(
    props: IUseDurationFieldOptions,
    emit: (event: "update:modelValue", value: number | null) => void
): IUseDurationFieldReturn {
    const { options, rawValue } = createDurationState(props);
    const { isValid, error } = createDurationValidation(props, rawValue, options);

    async function handleInput(event: Event): Promise<void> {
        const target = event.target as HTMLInputElement;
        rawValue.value = target.value;
        const sanitized = sanitizeDuration(target.value, options.value);
        
        if (sanitized !== null && sanitized !== parseInt(target.value, 10)) {
            rawValue.value = String(sanitized);
            await nextTick();
        }
        
        emit("update:modelValue", sanitized);
    }

    return {
        rawValue,
        isValid,
        error,
        handleInput,
    };
}
