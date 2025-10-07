/**
 * @file useSelection.ts
 * @summary Module: src/composables/useSelection.ts
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */
import { ref, computed, type Ref } from "vue";
import type { ISelectableItem, ISelectionState } from "@/types/selection";
function useSelectionState<T extends ISelectableItem>(items: Ref<T[] | undefined>) {
    const selectedIds = ref<string[]>([]);
    const selectedIdsSet = computed(() => new Set(selectedIds.value));
    const selectedItems = computed(() => (items.value ?? []).filter((item) => selectedIdsSet.value.has(item.id)));
    const isAllSelected = computed(() => (items.value?.length ?? 0) > 0 && selectedIds.value.length === (items.value?.length ?? 0));
    const hasSelection = computed(() => selectedIds.value.length > 0);
    const selectionCount = computed(() => selectedIds.value.length);
    return {
        selectedIds,
        selectedIdsSet,
        selectedItems,
        isAllSelected,
        hasSelection,
        selectionCount,
    };
}
function useSelectionActions(selectedIds: Ref<string[]>, items: Ref<ISelectableItem[] | undefined>, isAllSelected: Ref<boolean>, selectedIdsSet: Ref<Set<string>>) {
    function toggleOne(id: string): void {
        const index = selectedIds.value.indexOf(id);
        if (index > -1) {
            selectedIds.value.splice(index, 1);
        }
        else {
            selectedIds.value.push(id);
        }
    }
    function toggleAll(): void {
        if (isAllSelected.value) {
            selectedIds.value = [];
        }
        else {
            selectedIds.value = (items.value ?? []).map((item) => item.id);
        }
    }
    function setSelected(ids: string[]): void {
        selectedIds.value = [...ids];
    }
    function clearSelection(): void {
        selectedIds.value = [];
    }
    function isSelected(id: string): boolean {
        return selectedIdsSet.value.has(id);
    }
    return {
        toggleOne,
        toggleAll,
        setSelected,
        clearSelection,
        isSelected,
    };
}
export function useSelection<T extends ISelectableItem>(items: Ref<T[] | undefined>): ISelectionState<T> & {
    toggleOne: (id: string) => void;
    toggleAll: () => void;
    setSelected: (ids: string[]) => void;
    clearSelection: () => void;
    isSelected: (id: string) => boolean;
} {
    const state = useSelectionState(items);
    const actions = useSelectionActions(state.selectedIds, items, state.isAllSelected, state.selectedIdsSet);
    return {
        ...state,
        ...actions,
    };
}
