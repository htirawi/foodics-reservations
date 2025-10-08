export interface IToast {
  id: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
  duration?: number;
}

// Backward-compatibility alias
export type Toast = IToast;
