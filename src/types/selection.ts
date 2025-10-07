/**
 * @file selection.ts
 * @summary Types for selection functionality
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */
import type { Ref } from "vue";

export interface SelectableItem {
  id: string;
}

export interface SelectionState<T extends SelectableItem> {
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
