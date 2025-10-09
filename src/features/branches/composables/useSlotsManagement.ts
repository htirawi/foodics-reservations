import { type Ref } from "vue";

import { useI18n } from "vue-i18n";

import { WEEKDAYS, DEFAULT_SLOT_START, DEFAULT_SLOT_END, MAX_SLOTS_PER_DAY } from "@/constants/reservations";
import { useUIStore } from "@/stores/ui.store";
import type { Weekday, SlotTuple, ReservationTimes } from "@/types/foodics";

const weekdays = WEEKDAYS;
export function useSlotsManagement(weekSlots: Ref<ReservationTimes>) {
    const uiStore = useUIStore();
    const { t } = useI18n();

    function addSlot(day: Weekday): void {
        if (weekSlots.value[day].length >= MAX_SLOTS_PER_DAY) {
            return;
        }
        weekSlots.value[day].push([DEFAULT_SLOT_START, DEFAULT_SLOT_END]);
    }
    function removeSlot(day: Weekday, index: number): void {
        const slots = weekSlots.value[day];
        if (index >= 0 && index < slots.length) {
            slots.splice(index, 1);
            weekSlots.value = { ...weekSlots.value };
        }
    }
    function updateSlot(day: Weekday, index: number, field: "from" | "to", value: string): void {
        const slot = weekSlots.value[day][index];
        if (!slot)
            return;
        slot[field === "from" ? 0 : 1] = value;
    }
    async function applyToAllDays(day: Weekday): Promise<void> {
        const confirmed = await uiStore.confirm({
            title: t("settings.slots.applyAll"),
            message: t("settings.slots.confirmApplyAll"),
        });

        if (!confirmed) return;

        const originalSlots = weekSlots.value[day];
        const slotsToApply = weekSlots.value[day]
            .slice(0, MAX_SLOTS_PER_DAY)
            .map(([f, t]: SlotTuple) => [f, t] as SlotTuple);

        if (originalSlots.length > MAX_SLOTS_PER_DAY) {
            uiStore.notify(
                t('settings.slots.clippedToMax', { max: MAX_SLOTS_PER_DAY }),
                'info'
            );
        }

        weekdays.forEach((d: Weekday) => {
            weekSlots.value[d] = [...slotsToApply];
        });
    }
    return {
        addSlot,
        removeSlot,
        updateSlot,
        applyToAllDays,
    };
}
