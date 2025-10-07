/**
 * @file useConfirm.ts
 * @summary Module: src/composables/useConfirm.ts
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */
import { ref } from "vue";
import type { IConfirmOptions } from "@/types/confirm";
export const useConfirm = () => {
    const isOpen = ref(false);
    const options = ref<IConfirmOptions | null>(null);
    const resolveCallback = ref<((value: boolean) => void) | null>(null);
    const confirm = (confirmOptions: IConfirmOptions): Promise<boolean> => {
        options.value = {
            confirmText: "Confirm",
            cancelText: "Cancel",
            variant: "info",
            ...confirmOptions,
        };
        isOpen.value = true;
        return new Promise((resolve) => {
            resolveCallback.value = resolve;
        });
    };
    const handleConfirm = () => {
        resolveCallback.value?.(true);
        isOpen.value = false;
        options.value = null;
        resolveCallback.value = null;
    };
    const handleCancel = () => {
        resolveCallback.value?.(false);
        isOpen.value = false;
        options.value = null;
        resolveCallback.value = null;
    };
    return {
        isOpen,
        options,
        confirm,
        handleConfirm,
        handleCancel,
    };
};
