/**
 * @file ui.store.ts
 * @summary Module: src/stores/ui.store.ts
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */
import { defineStore } from "pinia";
import { ref } from "vue";
import type { IToast } from "@/types/toast";
import type { IConfirmOptions } from "@/types/confirm";
import type { ModalName } from "@/types/ui";
import {
    CONFIRM_DIALOG_DEFAULT_CONFIRM_TEXT,
    CONFIRM_DIALOG_DEFAULT_CANCEL_TEXT,
    CONFIRM_DIALOG_DEFAULT_VARIANT,
    TOAST_DEFAULT_DURATION_MS,
    TOAST_TYPE_INFO,
    AUTH_BANNER_AUTO_DISMISS_MS,
    STORE_NAME_UI,
} from "@/constants";

interface AuthBannerState {
  isVisible: boolean;
  message: string | null;
  onRetry: (() => void) | null;
  autoDismissTimer: ReturnType<typeof setTimeout> | null;
}

interface ConfirmDialogState {
  isOpen: boolean;
  options: IConfirmOptions | null;
  resolve: ((value: boolean) => void) | null;
}
function createToast(message: string, type: IToast["type"], duration: number): IToast {
    const id = `${Date.now()}-${Math.random()}`;
    return { id, message, type, duration };
}
function buildConfirmOptions(options: IConfirmOptions): IConfirmOptions {
    return {
        confirmText: CONFIRM_DIALOG_DEFAULT_CONFIRM_TEXT,
        cancelText: CONFIRM_DIALOG_DEFAULT_CANCEL_TEXT,
        variant: CONFIRM_DIALOG_DEFAULT_VARIANT,
        ...options,
    };
}
function useModals() {
    const openModals = ref<Set<ModalName>>(new Set());
    function openModal(name: ModalName): void {
        openModals.value.add(name);
    }
    function closeModal(name: ModalName): void {
        openModals.value.delete(name);
    }
    function isModalOpen(name: ModalName): boolean {
        return openModals.value.has(name);
    }
    return { openModals, openModal, closeModal, isModalOpen };
}
function useToasts() {
    const toasts = ref<IToast[]>([]);
    function notify(message: string, type: IToast["type"] = TOAST_TYPE_INFO, duration = TOAST_DEFAULT_DURATION_MS): string {
        const toast = createToast(message, type, duration);
        toasts.value.push(toast);
        if (duration > 0) {
            setTimeout(() => {
                removeToast(toast.id);
            }, duration);
        }
        return toast.id;
    }
    function removeToast(id: string): void {
        toasts.value = toasts.value.filter((t) => t.id !== id);
    }
    return { toasts, notify, removeToast };
}
function useConfirmDialog() {
    const confirmDialog = ref<ConfirmDialogState>({
        isOpen: false,
        options: null,
        resolve: null,
    });
    function confirm(options: IConfirmOptions): Promise<boolean> {
        return new Promise((resolve) => {
            confirmDialog.value = {
                isOpen: true,
                options: buildConfirmOptions(options),
                resolve,
            };
        });
    }
    function resolveConfirm(confirmed: boolean): void {
        confirmDialog.value.resolve?.(confirmed);
        confirmDialog.value = {
            isOpen: false,
            options: null,
            resolve: null,
        };
    }
    return { confirmDialog, confirm, resolveConfirm };
}
function useAuthBanner() {
    const authBanner = ref<AuthBannerState>({
        isVisible: false,
        message: null,
        onRetry: null,
        autoDismissTimer: null,
    });
    function showAuthBanner(options?: { message?: string; onRetry?: () => void; autoDismiss?: boolean }): void {
        // Clear existing timer if any
        if (authBanner.value.autoDismissTimer) {
            clearTimeout(authBanner.value.autoDismissTimer);
        }
        
        authBanner.value = {
            isVisible: true,
            message: options?.message ?? null,
            onRetry: options?.onRetry ?? null,
            autoDismissTimer: null,
        };
        
        // Set auto-dismiss timer if requested
        if (options?.autoDismiss) {
            authBanner.value.autoDismissTimer = setTimeout(() => {
                hideAuthBanner();
            }, AUTH_BANNER_AUTO_DISMISS_MS);
        }
    }
    function hideAuthBanner(): void {
        // Clear timer if active
        if (authBanner.value.autoDismissTimer) {
            clearTimeout(authBanner.value.autoDismissTimer);
        }
        
        authBanner.value = {
            isVisible: false,
            message: null,
            onRetry: null,
            autoDismissTimer: null,
        };
    }
    return { authBanner, showAuthBanner, hideAuthBanner };
}
export const useUIStore = defineStore(STORE_NAME_UI, () => {
    const modalActions = useModals();
    const toastActions = useToasts();
    const confirmActions = useConfirmDialog();
    const authBannerActions = useAuthBanner();
    return {
        ...modalActions,
        ...toastActions,
        ...confirmActions,
        ...authBannerActions,
    };
});
