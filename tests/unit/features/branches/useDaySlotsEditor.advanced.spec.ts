/**
 * @file useDaySlotsEditor.advanced.spec.ts
 * @summary Advanced tests for useDaySlotsEditor (apply-all, validity)
 * @remarks Deterministic, fast, offline; no DOM
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref } from "vue";
import { useDaySlotsEditor } from "@/features/branches/composables/useDaySlotsEditor";
import type { ReservationTimes } from "@/types/foodics";
import type { ConfirmFn } from "@/types/confirm";

describe("useDaySlotsEditor - Advanced Features", () => {
  const mockEmit = vi.fn();
  const mockConfirm = vi.fn<Parameters<ConfirmFn>, ReturnType<ConfirmFn>>();
  const mockT = vi.fn((key: string) => key);

  beforeEach(() => {
    mockEmit.mockClear();
    mockConfirm.mockClear();
    mockT.mockClear();
  });

  const emptyTimes: ReservationTimes = {
    saturday: [],
    sunday: [],
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
  };

  describe("applyToAllDaysWithConfirm", () => {
    it("should apply without confirmation when confirm fn not provided", () => {
      const times: ReservationTimes = {
        ...emptyTimes,
        saturday: [["09:00", "12:00"], ["13:00", "17:00"]],
      };
      const { applyToAllDaysWithConfirm } = useDaySlotsEditor(ref(times), mockEmit);
      applyToAllDaysWithConfirm("saturday");

      expect(mockEmit).toHaveBeenCalledWith("update:modelValue", {
        saturday: [["09:00", "12:00"], ["13:00", "17:00"]],
        sunday: [["09:00", "12:00"], ["13:00", "17:00"]],
        monday: [["09:00", "12:00"], ["13:00", "17:00"]],
        tuesday: [["09:00", "12:00"], ["13:00", "17:00"]],
        wednesday: [["09:00", "12:00"], ["13:00", "17:00"]],
        thursday: [["09:00", "12:00"], ["13:00", "17:00"]],
        friday: [["09:00", "12:00"], ["13:00", "17:00"]],
      });
    });

    it("should call confirm fn when provided", async () => {
      const times: ReservationTimes = {
        ...emptyTimes,
        saturday: [["09:00", "12:00"]],
      };
      mockConfirm.mockResolvedValue(true);

      const { applyToAllDaysWithConfirm } = useDaySlotsEditor(
        ref(times),
        mockEmit,
        mockConfirm,
        mockT
      );
      await applyToAllDaysWithConfirm("saturday");

      expect(mockConfirm).toHaveBeenCalledWith({
        title: "settings.slots.applyAll",
        message: "settings.slots.confirmApplyAll",
      });
    });

    it("should apply when user confirms", async () => {
      const times: ReservationTimes = {
        ...emptyTimes,
        saturday: [["09:00", "12:00"]],
      };
      mockConfirm.mockResolvedValue(true);

      const { applyToAllDaysWithConfirm } = useDaySlotsEditor(
        ref(times),
        mockEmit,
        mockConfirm,
        mockT
      );
      await applyToAllDaysWithConfirm("saturday");

      expect(mockEmit).toHaveBeenCalledWith("update:modelValue", expect.objectContaining({
        saturday: [["09:00", "12:00"]],
        sunday: [["09:00", "12:00"]],
      }));
    });

    it("should NOT apply when user cancels", async () => {
      const times: ReservationTimes = {
        ...emptyTimes,
        saturday: [["09:00", "12:00"]],
        sunday: [["10:00", "11:00"]],
      };
      mockConfirm.mockResolvedValue(false);

      const { applyToAllDaysWithConfirm } = useDaySlotsEditor(
        ref(times),
        mockEmit,
        mockConfirm,
        mockT
      );
      await applyToAllDaysWithConfirm("saturday");

      expect(mockEmit).not.toHaveBeenCalledWith("update:modelValue", expect.anything());
    });
  });

  describe("validity emission", () => {
    it("should emit valid:true when all days valid", () => {
      const times: ReservationTimes = {
        ...emptyTimes,
        saturday: [["09:00", "12:00"]],
        sunday: [["10:00", "13:00"]],
      };
      useDaySlotsEditor(ref(times), mockEmit);
      expect(mockEmit).toHaveBeenCalledWith("update:valid", true);
    });

    it("should emit valid:false when any day has errors", () => {
      const times: ReservationTimes = {
        ...emptyTimes,
        saturday: [["09:00", "12:00"]],
        sunday: [["12:00", "09:00"]],
      };
      useDaySlotsEditor(ref(times), mockEmit);
      expect(mockEmit).toHaveBeenCalledWith("update:valid", false);
    });

    it("should emit valid:true for empty days", () => {
      useDaySlotsEditor(ref(emptyTimes), mockEmit);
      expect(mockEmit).toHaveBeenCalledWith("update:valid", true);
    });
  });

  describe("validateDay function", () => {
    it("should return ok:true for valid slots", () => {
      const times: ReservationTimes = {
        ...emptyTimes,
        saturday: [["09:00", "12:00"]],
      };
      const { validateDay } = useDaySlotsEditor(ref(times), mockEmit);
      const result = validateDay("saturday");

      expect(result.ok).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it("should return ok:false with error keys for invalid", () => {
      const times: ReservationTimes = {
        ...emptyTimes,
        saturday: [["12:00", "09:00"]],
      };
      const { validateDay } = useDaySlotsEditor(ref(times), mockEmit);
      const result = validateDay("saturday");

      expect(result.ok).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});
