/**
 * @file useSelection.spec.ts
 * @summary Module: tests/unit/composables/useSelection.spec.ts
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { ref } from "vue";
import { useSelection } from "@/composables/useSelection";
interface TestItem {
    id: string;
    name: string;
}
describe("useSelection", () => {
    let items: ReturnType<typeof ref<TestItem[]>>;
    beforeEach(() => {
        items = ref<TestItem[]>([
            { id: "1", name: "Item 1" },
            { id: "2", name: "Item 2" },
            { id: "3", name: "Item 3" },
        ]);
    });
    it("should initialize with empty selection", () => {
        const selection = useSelection(items);
        expect(selection.selectedIds.value).toEqual([]);
        expect(selection.selectedItems.value).toEqual([]);
        expect(selection.isAllSelected.value).toBe(false);
        expect(selection.hasSelection.value).toBe(false);
        expect(selection.selectionCount.value).toBe(0);
    });
    it("should toggle single item selection", () => {
        const selection = useSelection(items);
        selection.toggleOne("1");
        expect(selection.selectedIds.value).toEqual(["1"]);
        expect(selection.selectedItems.value).toEqual([{ id: "1", name: "Item 1" }]);
        expect(selection.hasSelection.value).toBe(true);
        expect(selection.selectionCount.value).toBe(1);
        expect(selection.isSelected("1")).toBe(true);
        expect(selection.isSelected("2")).toBe(false);
    });
    it("should toggle multiple items", () => {
        const selection = useSelection(items);
        selection.toggleOne("1");
        selection.toggleOne("2");
        expect(selection.selectedIds.value).toEqual(["1", "2"]);
        expect(selection.selectionCount.value).toBe(2);
    });
    it("should deselect item when toggling again", () => {
        const selection = useSelection(items);
        selection.toggleOne("1");
        selection.toggleOne("1");
        expect(selection.selectedIds.value).toEqual([]);
        expect(selection.hasSelection.value).toBe(false);
    });
    it("should toggle all items", () => {
        const selection = useSelection(items);
        selection.toggleAll();
        expect(selection.selectedIds.value).toEqual(["1", "2", "3"]);
        expect(selection.isAllSelected.value).toBe(true);
        expect(selection.selectionCount.value).toBe(3);
    });
    it("should deselect all when all are selected", () => {
        const selection = useSelection(items);
        selection.toggleAll();
        selection.toggleAll();
        expect(selection.selectedIds.value).toEqual([]);
        expect(selection.isAllSelected.value).toBe(false);
    });
    it("should set selected items", () => {
        const selection = useSelection(items);
        selection.setSelected(["1", "3"]);
        expect(selection.selectedIds.value).toEqual(["1", "3"]);
        expect(selection.selectedItems.value).toEqual([
            { id: "1", name: "Item 1" },
            { id: "3", name: "Item 3" },
        ]);
    });
    it("should clear selection", () => {
        const selection = useSelection(items);
        selection.toggleOne("1");
        selection.toggleOne("2");
        selection.clearSelection();
        expect(selection.selectedIds.value).toEqual([]);
        expect(selection.hasSelection.value).toBe(false);
    });
    it("should update computed values when items change", () => {
        const selection = useSelection(items);
        selection.toggleAll();
        expect(selection.isAllSelected.value).toBe(true);
        items.value?.push({ id: "4", name: "Item 4" });
        expect(selection.isAllSelected.value).toBe(false);
        expect(selection.selectionCount.value).toBe(3);
    });
    it("should handle empty items array", () => {
        const emptyItems = ref<TestItem[]>([]);
        const selection = useSelection(emptyItems);
        selection.toggleAll();
        expect(selection.selectedIds.value).toEqual([]);
        expect(selection.isAllSelected.value).toBe(false);
    });
});
