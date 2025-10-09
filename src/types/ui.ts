import type { IConfirmOptions } from "@/types/confirm";
import type { IToast } from "@/types/toast";

export type ModalName = "addBranches" | "settings";

export interface IAuthBannerState {
  isVisible: boolean;
  message: string | null;
  onRetry: (() => void) | null;
  autoDismissTimer: ReturnType<typeof setTimeout> | null;
}

export interface IConfirmDialogState {
  isOpen: boolean;
  options: IConfirmOptions | null;
  resolve: ((value: boolean) => void) | null;
}

export interface IUIStoreState {
  modals: Record<ModalName, boolean>;
  toasts: IToast[];
  confirmDialog: IConfirmDialogState;
}

export type UIStoreState = IUIStoreState;
export type AuthBannerState = IAuthBannerState;
export type ConfirmDialogState = IConfirmDialogState;
