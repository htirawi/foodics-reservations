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
