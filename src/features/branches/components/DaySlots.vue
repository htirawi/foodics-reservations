<script setup lang="ts">/**
 * @file DaySlots.vue
 * @summary Module: src/features/branches/components/DaySlots.vue
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */
// Vue core
import { useI18n } from "vue-i18n";

// Type imports
import type { Weekday, SlotTuple } from "@/types/foodics";

// Components
import BaseButton from "@/components/ui/BaseButton.vue";
import TimePill from "@/components/ui/TimePill.vue";
defineProps<{
    day: Weekday;
    slots: SlotTuple[];
    error?: string | undefined;
}>();
const emit = defineEmits<{
    "update:slot": [
        index: number,
        field: "from" | "to",
        value: string
    ];
    "add": [
    ];
    "remove": [
        index: number
    ];
    "apply-to-all": [
    ];
}>();
const { t } = useI18n();
function handleUpdateSlot(index: number, field: "from" | "to", value: string): void {
    emit("update:slot", index, field, value);
}
function handleAdd(): void {
    emit("add");
}
function handleRemove(index: number): void {
    emit("remove", index);
}
function handleApplyToAll(): void {
    emit("apply-to-all");
}
</script>

<template>
  <div
    class="rounded-lg border border-neutral-200 bg-neutral-50 p-4"
    :data-testid="`day-${day}`"
  >
    <div class="mb-3 flex items-center justify-between">
      <h3 class="text-sm font-medium text-neutral-900">
        {{ t(`settings.days.${day}`) }}
      </h3>
      <BaseButton
        variant="ghost"
        size="sm"
        :data-testid="`apply-all-${day}`"
        @click="handleApplyToAll"
      >
        {{ t('settings.timeSlots.applyToAll') }}
      </BaseButton>
    </div>

    <div v-if="slots.length > 0" class="space-y-2">
      <TimePill
        v-for="(slot, idx) in slots"
        :key="idx"
        :from="slot[0]"
        :to="slot[1]"
        :editable="true"
        :removable="true"
        :data-testid="`settings-slot-row-${day}-${idx}`"
        @update:from="(val) => handleUpdateSlot(idx, 'from', val)"
        @update:to="(val) => handleUpdateSlot(idx, 'to', val)"
        @remove="handleRemove(idx)"
      />
    </div>

    <BaseButton
      variant="ghost"
      size="sm"
      class="mt-2"
      :data-testid="`add-slot-${day}`"
      @click="handleAdd"
    >
      + {{ t('settings.timeSlots.add') }}
    </BaseButton>

    <p
      v-if="error"
      class="mt-2 text-sm text-red-600"
      :data-testid="`error-${day}`"
    >
      {{ error }}
    </p>
  </div>
</template>
