import type { Ref } from "vue";

export interface ISelectableItem {
  id: string;
}

export interface ISelectionState<T extends ISelectableItem> {
  selectedIds: Ref<string[]>;
  selectedItems: Ref<T[]>;
  selectedIdsSet: Ref<Set<string>>;
  isAllSelected: Ref<boolean>;
  hasSelection: Ref<boolean>;
  selectionCount: Ref<number>;
  isSelected: (id: string) => boolean;
  toggleOne: (id: string) => void;
  toggleAll: () => void;
  setSelected: (ids: string[]) => void;
  clearSelection: () => void;
}

// Backward-compatibility aliases
export type SelectableItem = ISelectableItem;
export type SelectionState<T extends ISelectableItem> = ISelectionState<T>;
