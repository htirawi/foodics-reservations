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
        confirmText: "Confirm",
        cancelText: "Cancel",
        variant: "info",
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
    function notify(message: string, type: IToast["type"] = "info", duration = 5000): string {
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
export const useUIStore = defineStore("ui", () => {
    const modalActions = useModals();
    const toastActions = useToasts();
    const confirmActions = useConfirmDialog();
    return {
        ...modalActions,
        ...toastActions,
        ...confirmActions,
    };
});
