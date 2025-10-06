/**
 * @file useToast.ts
 * @summary Module: src/composables/useToast.ts
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */
import { ref } from "vue";
export interface Toast {
    id: string;
    message: string;
    type: "success" | "error" | "warning" | "info";
    duration?: number;
}
export const useToast = () => {
    const toasts = ref<Toast[]>([]);
    const show = (message: string, type: Toast["type"] = "info", duration = 5000) => {
        const id = `${Date.now()}-${Math.random()}`;
        const toast: Toast = { id, message, type, duration };
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
