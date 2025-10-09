import { type Ref, watch, nextTick } from "vue";

export function useFocusManagement(isOpen: Ref<boolean>, selector: string) {
    watch(isOpen, async (open) => {
        if (open) {
            await nextTick();
            const element = document.querySelector(selector) as HTMLElement;
            if (element) {
                element.focus();
            }
        }
    });
}
