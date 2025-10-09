import { type Ref, ref, computed, watch } from "vue";

import { useI18n } from "vue-i18n";

import { useUIStore } from "@/stores/ui.store";
import type { ReservationTimes } from "@/types/foodics";

export function useUnsavedChanges(
    duration: Ref<number>,
    weekSlots: Ref<ReservationTimes>,
    isOpen: Ref<boolean>
) {
    const { t } = useI18n();
    const uiStore = useUIStore();

    const initialDuration = ref<number>(0);
    const initialWeekSlots = ref<ReservationTimes>({
        saturday: [], sunday: [], monday: [], tuesday: [],
        wednesday: [], thursday: [], friday: [],
    });

    const hasUnsavedChanges = computed(() => {
        if (duration.value !== initialDuration.value) return true;
        return JSON.stringify(weekSlots.value) !== JSON.stringify(initialWeekSlots.value);
    });

    function captureInitialState(): void {
        initialDuration.value = duration.value;
        initialWeekSlots.value = JSON.parse(JSON.stringify(weekSlots.value));
    }

    async function confirmClose(): Promise<boolean> {
        if (!hasUnsavedChanges.value) return true;

        const confirmed = await uiStore.confirm({
            title: t("settings.confirm.unsavedChanges.title"),
            message: t("settings.confirm.unsavedChanges.message"),
            confirmText: t("settings.confirm.unsavedChanges.confirm"),
            cancelText: t("settings.confirm.unsavedChanges.cancel"),
            variant: "danger",
        });

        return confirmed;
    }

    watch(isOpen, (open) => {
        if (open) {
            captureInitialState();
        }
    });

    return {
        hasUnsavedChanges,
        captureInitialState,
        confirmClose,
    };
}
