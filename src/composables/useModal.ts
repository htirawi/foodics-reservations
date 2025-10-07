/**
 * @file useModal.ts
 * @summary Module: src/composables/useModal.ts
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */
import { ref } from "vue";
import type { ModalOptions } from "@/types/modal";
export const useModal = () => {
    const isOpen = ref(false);
    const options = ref<ModalOptions>({});
    const open = (modalOptions?: ModalOptions) => {
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
