/**
 * @file ui.ts
 * @summary Types for UI store functionality
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */
import type { Toast } from "./toast";
import type { ConfirmOptions } from "./confirm";

export type ModalName = "addBranches" | "settings";

interface ConfirmDialogState {
  isOpen: boolean;
  options: ConfirmOptions | null;
}

export interface UIStoreState {
  modals: Record<ModalName, boolean>;
  toasts: Toast[];
  confirmDialog: ConfirmDialogState;
}
