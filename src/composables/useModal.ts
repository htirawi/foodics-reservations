import { ref } from "vue";
import type { IModalOptions } from "@/types/modal";

/**
 * Manages modal dialog state with open/close controls and optional configuration.
 * Provides a reactive interface for controlling modal visibility and options.
 *
 * @returns Object containing isOpen state, options state, and open/close functions
 *
 * @example
 * ```typescript
 * const modal = useModal();
 *
 * // Open with options
 * modal.open({ title: 'Confirm Action', size: 'lg' });
 *
 * // Close modal
 * modal.close();
 *
 * // Check if open
 * if (modal.isOpen.value) {
 *   // Modal is visible
 * }
 * ```
 */
export const useModal = () => {
    const isOpen = ref(false);
    const options = ref<IModalOptions>({});
    const open = (modalOptions?: IModalOptions) => {
        options.value = modalOptions ?? {};
        isOpen.value = true;
    };
    const close = () => {
        isOpen.value = false;
        options.value = {};
    };
    return {
        isOpen,
        options,
        open,
        close,
    };
};
