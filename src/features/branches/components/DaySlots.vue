<script setup lang="ts">
import { useI18n } from "vue-i18n";

import TimePill from "@/components/ui/TimePill.vue";
import { MAX_SLOTS_PER_DAY, WEEKDAY_SATURDAY } from "@/constants/reservations";
import type { Weekday, SlotTuple } from "@/types/foodics";

const props = defineProps<{
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
    class="rounded-lg border border-neutral-200 bg-white p-4"
    :data-testid="`day-${day}`"
  >
    <div class="mb-4 flex items-center justify-between">
      <h3 class="text-base font-normal text-neutral-700">
        {{ t(`settings.days.${day}`) }}
      </h3>
      <button
        v-if="props.day === WEEKDAY_SATURDAY"
        type="button"
        class="text-sm font-medium text-violet-600 hover:text-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
        :data-testid="`apply-all-${day}`"
        @click="handleApplyToAll"
      >
        {{ t('settings.timeSlots.applyToAll') }}
      </button>
    </div>

    <div class="rounded-lg bg-neutral-50 p-4">
      <div class="flex items-center justify-between gap-4">
        <div class="flex flex-wrap gap-2">
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
        <button
          type="button"
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border-2 border-neutral-300 bg-white text-neutral-400 hover:border-neutral-400 hover:text-neutral-600 disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="slots.length >= MAX_SLOTS_PER_DAY"
          :data-testid="`add-slot-${day}`"
          :aria-label="t('settings.timeSlots.add')"
          @click="handleAdd"
        >
          <svg
class="h-4 w-4"
fill="none"
viewBox="0 0 24 24"
stroke="currentColor"
stroke-width="2.5">
            <path
stroke-linecap="round"
stroke-linejoin="round"
d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </div>

    <p
      v-if="error"
      class="mt-2 text-sm text-red-600"
      :data-testid="`error-${day}`"
    >
      {{ error }}
    </p>
  </div>
</template>
