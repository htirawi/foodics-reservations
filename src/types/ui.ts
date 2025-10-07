/**
 * @file ui.ts
 * @summary Types for UI store functionality
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */
import type { IToast } from "./toast";
import type { IConfirmOptions } from "./confirm";

export type ModalName = "addBranches" | "settings";

interface IConfirmDialogState {
  isOpen: boolean;
  options: IConfirmOptions | null;
}

export interface IUIStoreState {
  modals: Record<ModalName, boolean>;
  toasts: IToast[];
  confirmDialog: IConfirmDialogState;
}

// Backward-compatibility alias
export type UIStoreState = IUIStoreState;
