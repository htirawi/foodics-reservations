import { type Ref } from "vue";

import { WEEKDAYS } from "@/constants/reservations";
import { useBranchesStore } from "@/features/branches/stores/branches.store";
import type { IBranch, Weekday, ReservationTimes } from "@/types/foodics";

const weekdays = WEEKDAYS;
export function useSettingsActions(
    { branch, duration, weekSlots }: {
        branch: Ref<IBranch | null>;
        duration: Ref<number>;
        weekSlots: Ref<ReservationTimes>;
    },
    { checkDuration, checkSlots }: {
        checkDuration: () => boolean;
        checkSlots: (day: Weekday) => boolean;
    },
    onClose: () => void
) {
    const branchesStore = useBranchesStore();
    async function handleSave(): Promise<void> {
        if (!branch.value)
            return;
        const isDurationValid = checkDuration();
        const areSlotsValid = weekdays.every((day: Weekday) => checkSlots(day));
        if (!isDurationValid || !areSlotsValid)
            return;
        await branchesStore.updateSettings(branch.value.id, {
            reservation_duration: duration.value,
            reservation_times: weekSlots.value,
        });
        onClose();
    }
    async function handleDisable(): Promise<void> {
        if (!branch.value)
            return;
        await branchesStore.enableBranches([]);
        onClose();
    }
    return {
        handleSave,
        handleDisable,
    };
}
