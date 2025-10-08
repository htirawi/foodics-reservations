import { ref, computed } from "vue";
import { useBranchesStore } from "@/features/branches/stores/branches.store";
import type { IBranch, ReservationTimes, ITable } from "@/types/foodics";
function extractReservableTables(sections: {
    tables?: ITable[];
}[]): ITable[] {
    const allTables: ITable[] = [];
    sections.forEach((s) => {
        const tables = s.tables;
        if (tables) {
            tables.forEach((t: ITable) => {
                if (t.accepts_reservations) {
                    allTables.push(t);
                }
            });
        }
    });
    return allTables;
}
export function useSettingsState(branchId: Readonly<{ branchId: string | null }>) {
    const branchesStore = useBranchesStore();
    const duration = ref<number>(30);
    const weekSlots = ref<ReservationTimes>({
        saturday: [],
        sunday: [],
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
    });
    const isOpen = computed(() => branchId.branchId !== null);
    const branch = computed<IBranch | null>(() => branchId.branchId ? branchesStore.branchById(branchId.branchId) : null);
    const availableTables = computed<ITable[]>(() => {
        if (!branch.value?.sections)
            return [];
        return extractReservableTables(branch.value.sections);
    });
    return {
        duration,
        weekSlots,
        isOpen,
        branch,
        availableTables,
    };
}
