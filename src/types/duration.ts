/**
 * @file duration.ts
 * @summary Types for duration field functionality
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */
import type { Ref, ComputedRef } from "vue";

export interface IUseDurationFieldOptions {
  modelValue: number | null;
  min?: number;
  max?: number;
}

export interface IUseDurationFieldReturn {
  rawValue: Ref<string>;
  isValid: ComputedRef<boolean>;
  error: ComputedRef<string | undefined>;
  handleInput: (event: Event) => Promise<void>;
}

/**
 * Options for duration validation.
 */
export interface IDurationOptions {
  min?: number;
  max?: number;
}

// Backward-compatibility aliases
export type UseDurationFieldOptions = IUseDurationFieldOptions;
export type UseDurationFieldReturn = IUseDurationFieldReturn;
export type DurationOptions = IDurationOptions;
