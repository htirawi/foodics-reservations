<script setup lang="ts">
import { useI18n } from "vue-i18n";

import TimePill from "@/components/ui/TimePill.vue";
import { MAX_SLOTS_PER_DAY, WEEKDAY_SATURDAY } from "@/constants/reservations";
import type { Weekday, SlotTuple } from "@/types/foodics";

const props = defineProps<{
    day: Weekday;
    slots?: SlotTuple[];
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
        class="inline-flex items-center gap-2 rounded-lg border-2 px-4 py-2 text-sm font-semibold shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
        :class="[
          (slots?.length ?? 0) === 0
            ? 'border-neutral-300 bg-neutral-100 text-neutral-400 cursor-not-allowed'
            : 'border-violet-500 bg-gradient-to-r from-violet-50 to-purple-50 text-violet-700 hover:border-violet-600 hover:from-violet-100 hover:to-purple-100 hover:shadow-md'
        ]"
        :disabled="(slots?.length ?? 0) === 0"
        :data-testid="`apply-all-${day}`"
        @click="handleApplyToAll"
      >
        <svg
class="h-4 w-4"
fill="none"
viewBox="0 0 24 24"
stroke="currentColor"
stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
        </svg>
        {{ t('settings.timeSlots.applyToAll') }}
      </button>
    </div>

    <div class="rounded-lg bg-neutral-50 p-4">
      <div class="flex items-center justify-between gap-4">
        <div class="flex flex-wrap gap-2 flex-1">
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
          <p
            v-if="!slots || slots.length === 0"
            class="text-sm text-neutral-500 italic py-2"
          >
            {{ t('settings.timeSlots.emptyState') }}
          </p>
        </div>
        <button
          type="button"
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border-2 border-neutral-300 bg-white text-neutral-400 hover:border-neutral-400 hover:text-neutral-600 disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="(slots?.length ?? 0) >= MAX_SLOTS_PER_DAY"
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

    <div
      v-if="error"
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      class="mt-2 text-sm text-red-600"
      :data-testid="`error-${day}`"
    >
      {{ error }}
    </div>
  </div>
</template>
