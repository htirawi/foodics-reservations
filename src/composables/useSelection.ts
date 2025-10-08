import { ref, computed, type Ref } from "vue";
import type { ISelectableItem, ISelectionState } from "@/types/selection";

/**
 * Manages selection state for lists with multi-select support.
 * Provides reactive state tracking including selected IDs, items, and computed flags.
 *
 * @param items - Reactive reference to array of selectable items
 * @returns Object containing selection state (selectedIds, selectedItems, isAllSelected, etc.)
 */
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
function useSelectionActions({
    selectedIds,
    items,
    isAllSelected,
    selectedIdsSet
}: {
    selectedIds: Ref<string[]>;
    items: Ref<ISelectableItem[] | undefined>;
    isAllSelected: Ref<boolean>;
    selectedIdsSet: Ref<Set<string>>;
}) {
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

/**
 * Complete selection management system for multi-select lists.
 * Combines state tracking with actions for toggling individual items, selecting all, and clearing.
 *
 * @param items - Reactive reference to array of selectable items
 * @returns Object with selection state and action methods (toggleOne, toggleAll, clearSelection, etc.)
 *
 * @example
 * ```typescript
 * const branches = ref<IBranch[]>([...]);
 * const {
 *   selectedIds,
 *   selectedItems,
 *   isAllSelected,
 *   toggleOne,
 *   toggleAll,
 *   clearSelection
 * } = useSelection(branches);
 *
 * // Toggle individual item
 * toggleOne('branch-123');
 *
 * // Select/deselect all
 * toggleAll();
 *
 * // Clear selection
 * clearSelection();
 *
 * // Access selected items
 * console.log(selectedItems.value); // Array of selected branch objects
 * ```
 */
export function useSelection<T extends ISelectableItem>(items: Ref<T[] | undefined>): ISelectionState<T> & {
    toggleOne: (id: string) => void;
    toggleAll: () => void;
    setSelected: (ids: string[]) => void;
    clearSelection: () => void;
    isSelected: (id: string) => boolean;
} {
    const state = useSelectionState(items);
    const actions = useSelectionActions({
        selectedIds: state.selectedIds,
        items,
        isAllSelected: state.isAllSelected,
        selectedIdsSet: state.selectedIdsSet
    });
    return {
        ...state,
        ...actions,
    };
}
