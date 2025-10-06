/**
 * Generic selection state management for arrays of items with IDs
 * Handles single/multiple selection, select all, and selection state
 */

import { ref, computed, type Ref } from 'vue';

export interface SelectableItem {
  id: string;
}

export interface SelectionState<T extends SelectableItem> {
  selectedIds: Ref<string[]>;
  selectedIdsSet: Ref<Set<string>>;
  selectedItems: Ref<T[]>;
  isAllSelected: Ref<boolean>;
  hasSelection: Ref<boolean>;
  selectionCount: Ref<number>;
}

function useSelectionState<T extends SelectableItem>(items: Ref<T[] | undefined>) {
  const selectedIds = ref<string[]>([]);

  const selectedIdsSet = computed(() => new Set(selectedIds.value));
  
  const selectedItems = computed(() =>
    (items.value ?? []).filter((item) => selectedIdsSet.value.has(item.id))
  );

  const isAllSelected = computed(() =>
    (items.value?.length ?? 0) > 0 && selectedIds.value.length === (items.value?.length ?? 0)
  );

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

function useSelectionActions(
  selectedIds: Ref<string[]>,
  items: Ref<SelectableItem[] | undefined>,
  isAllSelected: Ref<boolean>,
  selectedIdsSet: Ref<Set<string>>
) {
  function toggleOne(id: string): void {
    const index = selectedIds.value.indexOf(id);
    if (index > -1) {
      selectedIds.value.splice(index, 1);
    } else {
      selectedIds.value.push(id);
    }
  }

  function toggleAll(): void {
    if (isAllSelected.value) {
      selectedIds.value = [];
    } else {
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

export function useSelection<T extends SelectableItem>(
  items: Ref<T[] | undefined>
): SelectionState<T> & {
  toggleOne: (id: string) => void;
  toggleAll: () => void;
  setSelected: (ids: string[]) => void;
  clearSelection: () => void;
  isSelected: (id: string) => boolean;
} {
  const state = useSelectionState(items);
  const actions = useSelectionActions(
    state.selectedIds,
    items,
    state.isAllSelected,
    state.selectedIdsSet
  );

  return {
    ...state,
    ...actions,
  };
}
