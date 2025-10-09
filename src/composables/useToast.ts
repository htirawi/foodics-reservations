import { ref } from "vue";

import type { IToast } from "@/types/toast";

/**
 * Toast notification system with auto-dismiss functionality and variant support.
 * Provides convenience methods for common notification types (success, error, warning, info).
 *
 * @returns Object with toasts array and show/remove/success/error/warning/info methods
 *
 * @example
 * ```typescript
 * const toast = useToast();
 *
 * // Show success notification (auto-dismiss in 5s)
 * toast.success('Branch enabled successfully');
 *
 * // Show error with custom duration
 * toast.error('Failed to save settings', 8000);
 *
 * // Show persistent notification (duration: 0)
 * toast.warning('Please review changes', 0);
 *
 * // Manually remove a toast
 * const id = toast.info('Processing...');
 * toast.remove(id);
 * ```
 */
export const useToast = () => {
    const toasts = ref<IToast[]>([]);
    const show = (message: string, type: IToast["type"] = "info", duration = 5000) => {
        const id = `${Date.now()}-${Math.random()}`;
        const toast: IToast = { id, message, type, duration };
        toasts.value.push(toast);
        if (duration > 0) {
            setTimeout(() => {
                remove(id);
            }, duration);
        }
        return id;
    };
    const remove = (id: string) => {
        toasts.value = toasts.value.filter((toast) => toast.id !== id);
    };
    const success = (message: string, duration?: number) => show(message, "success", duration);
    const error = (message: string, duration?: number) => show(message, "error", duration);
    const warning = (message: string, duration?: number) => show(message, "warning", duration);
    const info = (message: string, duration?: number) => show(message, "info", duration);
    return {
        toasts,
        show,
        remove,
        success,
        error,
        warning,
        info,
    };
};
