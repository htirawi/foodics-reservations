<script setup lang="ts">/**
 * @file DaySlotsEditor.vue
 * @summary Module: src/features/branches/components/ReservationSettingsModal/DaySlotsEditor.vue
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */
import { useI18n } from "vue-i18n";
import BaseButton from "@/components/ui/BaseButton.vue";
import TimePill from "@/components/ui/TimePill.vue";
import type { ReservationTimes } from "@/types/foodics";
import { useDaySlotsEditor } from "@/features/branches/composables/useDaySlotsEditor";

const props = defineProps<{
  modelValue: ReservationTimes;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: ReservationTimes];
  "update:valid": [valid: boolean];
}>();

const { t } = useI18n();

const { weekdays, dayErrors, addSlot, removeSlot, updateSlot, applyToAllDays } = 
  useDaySlotsEditor(props.modelValue, emit);
</script>

<template>
  <div data-testid="settings-day-slots" class="space-y-4">
    <h3 class="text-sm font-medium text-neutral-900">
      {{ t('settings.slots.title') }}
    </h3>
    <div
      v-for="day in weekdays"
      :key="day"
      class="rounded-lg border border-neutral-200 bg-neutral-50 p-4"
      :data-testid="`settings-slot-day-${day}`"
    >
      <div class="mb-3 flex items-center justify-between">
        <h4 class="text-sm font-medium text-neutral-900">
          {{ t(`settings.days.${day}`) }}
        </h4>
        <BaseButton
          variant="ghost"
          size="sm"
          :data-testid="`apply-all-${day}`"
          @click="applyToAllDays(day)"
        >
          {{ t('settings.timeSlots.applyToAll') }}
        </BaseButton>
      </div>

      <div v-if="modelValue[day].length > 0" class="space-y-2">
        <TimePill
          v-for="(slot, idx) in modelValue[day]"
          :key="idx"
          :from="slot[0]"
          :to="slot[1]"
          :editable="true"
          :removable="true"
          :data-testid="`settings-slot-row-${day}-${idx}`"
          @update:from="(val) => updateSlot(day, idx, 'from', val)"
          @update:to="(val) => updateSlot(day, idx, 'to', val)"
          @remove="removeSlot(day, idx)"
        />
      </div>

      <BaseButton
        variant="ghost"
        size="sm"
        class="mt-2"
        :data-testid="`add-slot-${day}`"
        @click="addSlot(day)"
      >
        + {{ t('settings.timeSlots.add') }}
      </BaseButton>

      <p
        v-if="dayErrors[day] && dayErrors[day].length > 0"
        class="mt-2 text-sm text-red-600"
        :data-testid="`error-${day}`"
      >
        {{ dayErrors[day][0] }}
      </p>
    </div>
  </div>
</template>

