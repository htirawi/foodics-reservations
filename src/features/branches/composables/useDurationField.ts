/**
 * @file useDurationField.ts
 * @summary Module: src/features/branches/composables/useDurationField.ts
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */
import { computed, ref, watch, nextTick, type Ref, type ComputedRef } from "vue";

import { MIN_DURATION_MINUTES, MAX_DURATION_MINUTES } from "@/constants/reservations";
import { sanitizeDuration, isValidDuration, type DurationOptions } from "@/features/branches/utils/reservation.validation";
import type { IUseDurationFieldOptions, IUseDurationFieldReturn, IDurationError } from "@/types/duration";

function validateRawDuration(rawValue: string, min: number, max: number): IDurationError | null {
    const rawNum = parseInt(rawValue, 10);
    if (rawValue && !Number.isNaN(rawNum)) {
        if (rawNum < min) return { code: "MIN", min };
        if (rawNum > max) return { code: "MAX", max };
        if (!Number.isInteger(rawNum)) return { code: "INTEGER" };
    }
    return null;
}

function createDurationState(props: IUseDurationFieldOptions) {
    const options = computed<DurationOptions>(() => ({
        min: props.min ?? MIN_DURATION_MINUTES,
        max: props.max ?? MAX_DURATION_MINUTES,
    }));

    const rawValue = ref<string>("");

    watch(() => props.modelValue, (newValue) => {
        if (newValue !== null && newValue !== undefined) {
            rawValue.value = String(newValue);
        }
    }, { immediate: true });

    return { options, rawValue };
}

/**
 * Remove fractional part from input (e.g., "123.45" -> "123")
 */
function removeFractionalPart(value: string): string {
    if (!value.includes('.')) return value;
    return value.split('.')[0] || '';
}

/**
 * Remove all non-digit characters except minus sign
 */
function removeNonDigitsAndMinus(value: string): string {
    return value.replace(/[^\d-]/g, '');
}

/**
 * Normalize minus sign to only appear at the start (e.g., "12-34" -> "1234", "-12-34" -> "-1234")
 */
function normalizeMinusSign(value: string): string {
    if (!value.includes('-')) return value;

    const hasLeadingMinus = value.startsWith('-');
    const digitsOnly = value.replace(/-/g, '');
    return hasLeadingMinus ? '-' + digitsOnly : digitsOnly;
}

/**
 * Apply input sanitization pipeline
 */
function sanitizeInput(value: string): string {
    return normalizeMinusSign(removeNonDigitsAndMinus(removeFractionalPart(value)));
}

function createDurationValidation(props: IUseDurationFieldOptions, rawValue: Ref<string>, options: ComputedRef<DurationOptions>) {
    const isValid = computed<boolean>(() => {
        if (rawValue.value !== "") {
            const rawNum = parseInt(rawValue.value, 10);
            if (!Number.isNaN(rawNum)) {
                return rawNum >= (props.min ?? MIN_DURATION_MINUTES) && Number.isInteger(rawNum);
            }
            return false;
        }
        return isValidDuration(props.modelValue, options.value);
    });

    const error = computed<IDurationError | undefined>(() => {
        const min = props.min ?? MIN_DURATION_MINUTES;
        const max = props.max ?? MAX_DURATION_MINUTES;

        const rawError = validateRawDuration(rawValue.value, min, max);
        if (rawError) return rawError;

        if (!isValid.value && (props.modelValue === null || props.modelValue === undefined)) {
            return { code: "REQUIRED" };
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
        const filteredValue = sanitizeInput(target.value);

        if (filteredValue !== target.value) {
            target.value = filteredValue;
        }

        rawValue.value = filteredValue;
        const sanitized = sanitizeDuration(filteredValue, options.value);

        if (sanitized !== null && sanitized !== parseInt(filteredValue, 10)) {
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
