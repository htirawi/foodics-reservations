/**
 * @file confirm.ts
 * @summary Types for confirmation dialogs
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */
export interface IConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
}

/**
 * Confirmation function type.
 */
export type ConfirmFn = (options: IConfirmOptions) => Promise<boolean>;

// Backward-compatibility alias
export type ConfirmOptions = IConfirmOptions;
