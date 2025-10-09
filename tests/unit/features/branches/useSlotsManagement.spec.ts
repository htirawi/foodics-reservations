/**
 * @file useSlotsManagement.spec.ts
 * @summary Unit tests for useSlotsManagement composable
 */
import { ref, defineComponent, h } from "vue";

import { mount } from "@vue/test-utils";

import { createPinia, setActivePinia } from "pinia";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { createI18n } from "vue-i18n";

import { useSlotsManagement } from "@/features/branches/composables/useSlotsManagement";
import { useUIStore } from "@/stores/ui.store";
import type { ReservationTimes } from "@/types/foodics";

const i18n = createI18n({
  legacy: false,
  locale: "en",
  messages: {
    en: {
      settings: {
        slots: {
          applyAll: "Apply to All Days",
          confirmApplyAll: "Apply these slots to all days?",
        },
      },
    },
  },
});

// Helper to call composable within setup context
function withSetup<T>(composable: () => T): T {
  let result!: T;
  const TestComponent = defineComponent({
    setup() {
      result = composable();
      return () => h("div");
    },
  });

  mount(TestComponent, {
    global: {
      plugins: [createPinia(), i18n],
    },
  });

  return result;
}

describe("useSlotsManagement", () => {
  let pinia: ReturnType<typeof createPinia>;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
  });

  describe("addSlot", () => {
    it("should add a new slot with default times", () => {
      const weekSlots = ref<ReservationTimes>({
        saturday: [],
        sunday: [],
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
      });

      const { addSlot } = withSetup(() => useSlotsManagement(weekSlots));
      addSlot("monday");

      expect(weekSlots.value.monday).toHaveLength(1);
      expect(weekSlots.value.monday[0]).toEqual(["09:00", "17:00"]);
    });

    it("should add multiple slots", () => {
      const weekSlots = ref<ReservationTimes>({
        saturday: [],
        sunday: [],
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
      });

      const { addSlot } = withSetup(() => useSlotsManagement(weekSlots));
      addSlot("tuesday");
      addSlot("tuesday");
      addSlot("tuesday");

      expect(weekSlots.value.tuesday).toHaveLength(3);
    });
  });

  describe("removeSlot", () => {
    it("should remove slot at specified index", () => {
      const weekSlots = ref<ReservationTimes>({
        saturday: [],
        sunday: [],
        monday: [
          ["09:00", "12:00"],
          ["14:00", "17:00"],
        ],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
      });

      const { removeSlot } = withSetup(() => useSlotsManagement(weekSlots));
      removeSlot("monday", 0);

      expect(weekSlots.value.monday).toHaveLength(1);
      expect(weekSlots.value.monday[0]).toEqual(["14:00", "17:00"]);
    });

    it("should not remove if index is out of bounds", () => {
      const weekSlots = ref<ReservationTimes>({
        saturday: [],
        sunday: [],
        monday: [["09:00", "12:00"]],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
      });

      const { removeSlot } = withSetup(() => useSlotsManagement(weekSlots));
      removeSlot("monday", 5);

      expect(weekSlots.value.monday).toHaveLength(1);
    });

    it("should not remove if index is negative", () => {
      const weekSlots = ref<ReservationTimes>({
        saturday: [],
        sunday: [],
        monday: [["09:00", "12:00"]],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
      });

      const { removeSlot } = withSetup(() => useSlotsManagement(weekSlots));
      removeSlot("monday", -1);

      expect(weekSlots.value.monday).toHaveLength(1);
    });
  });

  describe("updateSlot", () => {
    it("should update from time", () => {
      const weekSlots = ref<ReservationTimes>({
        saturday: [],
        sunday: [],
        monday: [["09:00", "12:00"]],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
      });

      const { updateSlot } = withSetup(() => useSlotsManagement(weekSlots));
      updateSlot("monday", 0, "from", "10:00");

      expect(weekSlots.value.monday[0]).toEqual(["10:00", "12:00"]);
    });

    it("should update to time", () => {
      const weekSlots = ref<ReservationTimes>({
        saturday: [],
        sunday: [],
        monday: [["09:00", "12:00"]],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
      });

      const { updateSlot } = withSetup(() => useSlotsManagement(weekSlots));
      updateSlot("monday", 0, "to", "13:00");

      expect(weekSlots.value.monday[0]).toEqual(["09:00", "13:00"]);
    });

    it("should not crash when slot does not exist", () => {
      const weekSlots = ref<ReservationTimes>({
        saturday: [],
        sunday: [],
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
      });

      const { updateSlot } = withSetup(() => useSlotsManagement(weekSlots));

      expect(() => {
        updateSlot("monday", 0, "from", "10:00");
      }).not.toThrow();
    });
  });

  describe("applyToAllDays", () => {
    it("should apply slots to all days when confirmed", async () => {
      const weekSlots = ref<ReservationTimes>({
        saturday: [],
        sunday: [],
        monday: [
          ["09:00", "12:00"],
          ["14:00", "17:00"],
        ],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
      });

      const { applyToAllDays } = withSetup(() => {
        const uiStore = useUIStore();
        vi.spyOn(uiStore, "confirm").mockResolvedValue(true);
        return useSlotsManagement(weekSlots);
      });

      await applyToAllDays("monday");

      expect(weekSlots.value.saturday).toEqual([
        ["09:00", "12:00"],
        ["14:00", "17:00"],
      ]);
      expect(weekSlots.value.sunday).toEqual([
        ["09:00", "12:00"],
        ["14:00", "17:00"],
      ]);
      expect(weekSlots.value.tuesday).toEqual([
        ["09:00", "12:00"],
        ["14:00", "17:00"],
      ]);
    });

    it("should not apply slots to all days when cancelled", async () => {
      const weekSlots = ref<ReservationTimes>({
        saturday: [],
        sunday: [],
        monday: [["09:00", "12:00"]],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
      });

      const { applyToAllDays } = withSetup(() => {
        const uiStore = useUIStore();
        vi.spyOn(uiStore, "confirm").mockResolvedValue(false);
        return useSlotsManagement(weekSlots);
      });

      await applyToAllDays("monday");

      expect(weekSlots.value.saturday).toEqual([]);
      expect(weekSlots.value.tuesday).toEqual([]);
    });

    it("should copy slots array structure to all days", async () => {
      const weekSlots = ref<ReservationTimes>({
        saturday: [],
        sunday: [],
        monday: [
          ["09:00", "12:00"],
          ["14:00", "17:00"],
        ],
        tuesday: [["10:00", "11:00"]],
        wednesday: [],
        thursday: [],
        friday: [],
      });

      const { applyToAllDays } = withSetup(() => {
        const uiStore = useUIStore();
        vi.spyOn(uiStore, "confirm").mockResolvedValue(true);
        return useSlotsManagement(weekSlots);
      });

      await applyToAllDays("monday");

      // All days should have the same slot structure
      expect(weekSlots.value.saturday).toHaveLength(2);
      expect(weekSlots.value.tuesday).toHaveLength(2);
      expect(weekSlots.value.tuesday[0]).toEqual(["09:00", "12:00"]);
    });
  });
});
