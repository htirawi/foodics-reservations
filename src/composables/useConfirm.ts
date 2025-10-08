import { ref } from "vue";
import type { IConfirmOptions } from "@/types/confirm";

/**
 * Confirmation dialog system with promise-based user response handling.
 * Displays a modal dialog and resolves with user's choice (confirm/cancel).
 *
 * @returns Object containing dialog state and confirm/handleConfirm/handleCancel functions
 *
 * @example
 * ```typescript
 * const { confirm } = useConfirm();
 *
 * const userConfirmed = await confirm({
 *   title: 'Delete Branch',
 *   message: 'Are you sure? This action cannot be undone.',
 *   confirmText: 'Delete',
 *   cancelText: 'Cancel',
 *   variant: 'danger'
 * });
 *
 * if (userConfirmed) {
 *   await deleteBranch(branchId);
 * }
 * ```
 */
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
