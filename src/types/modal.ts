/**
 * @file modal.ts
 * @summary Types for modal functionality
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */
export interface IModalOptions {
  title?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

// Backward-compatibility alias
export type ModalOptions = IModalOptions;
