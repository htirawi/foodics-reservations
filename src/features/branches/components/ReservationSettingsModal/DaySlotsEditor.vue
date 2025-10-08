<script setup lang="ts">/**
 * @file DaySlotsEditor.vue
 * @summary Day-by-day time slots editor for reservation settings
 * @remarks
 *   - Tiny UI glue; logic in composables/utils.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */
// Vue core
import { toRef, computed } from "vue";
import { useI18n } from "vue-i18n";

// Type imports
import type { ReservationTimes, Weekday } from "@/types/foodics";

// Components
import BaseButton from "@/components/ui/BaseButton.vue";
import TimePill from "@/components/ui/TimePill.vue";

// Composables
import { useDaySlotsEditor } from "@/features/branches/composables/useDaySlotsEditor";
import { getDayValidationErrors } from "@/features/branches/composables/slotValidation";

// Stores
import { useUIStore } from "@/stores/ui.store";

const props = defineProps<{
  modelValue: ReservationTimes;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: ReservationTimes];
  "update:valid": [valid: boolean];
}>();

const { t } = useI18n();
const uiStore = useUIStore();
const confirm = uiStore.confirm;

const {
  weekdays,
  canAdd,
  addSlot,
  removeSlot,
  updateSlot,
  applyToAllDaysWithConfirm,
} = useDaySlotsEditor(toRef(props, 'modelValue'), emit, confirm, t);

// Compute errors directly from props to ensure reactivity
const dayErrors = computed<Record<Weekday, string[]>>(() => {
  const errors: Record<Weekday, string[]> = {
    saturday: [],
    sunday: [],
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
  };

  weekdays.forEach((day) => {
    errors[day] = getDayValidationErrors(props.modelValue[day] ?? []);
  });

  return errors;
});
</script>

<template>
  <div data-testid="settings-day-slots" class="space-y-6">
    <h3 class="text-base font-semibold text-neutral-900">
      {{ t('settings.slots.title') }}
    </h3>

    <div
      v-for="day in weekdays"
      :key="day"
      class="space-y-3"
    >
      <fieldset
        :data-testid="`settings-slot-day-${day}`"
        class="rounded-lg border border-neutral-200 bg-neutral-50 p-4"
        :aria-labelledby="`day-heading-${day}`"
      >
        <legend class="sr-only">
          {{ t(`settings.days.${day}`) }}
        </legend>

        <div class="mb-3 flex items-center justify-between">
          <h4
            :id="`day-heading-${day}`"
            class="text-sm font-medium text-neutral-900"
          >
            {{ t(`settings.days.${day}`) }}
          </h4>

          <BaseButton
            v-if="day === 'saturday'"
            variant="ghost"
            size="sm"
            data-testid="slots-apply-all"
            @click="() => applyToAllDaysWithConfirm(day)"
          >
            {{ t('settings.slots.applyAll') }}
          </BaseButton>
        </div>

        <div
          v-if="modelValue[day] && modelValue[day].length > 0"
          :data-testid="`settings-day-${day}-list`"
          class="space-y-2"
          role="list"
          :aria-labelledby="`day-${day}-label`"
        >
          <TimePill
            v-for="(slot, idx) in modelValue[day]"
            :key="idx"
            :from="slot[0]"
            :to="slot[1]"
            :editable="true"
            :removable="true"
            :data-testid="`settings-day-${day}-row-${idx}`"
            role="listitem"
            @update:from="(val) => updateSlot(day, idx, 'from', val)"
            @update:to="(val) => updateSlot(day, idx, 'to', val)"
            @remove="removeSlot(day, idx)"
          />
        </div>

        <BaseButton
          variant="ghost"
          size="sm"
          class="mt-3"
          :disabled="!canAdd(day)"
          :data-testid="`settings-day-${day}-add`"
          @click="addSlot(day)"
        >
          + {{ t('settings.slots.add') }}
        </BaseButton>

        <div
          v-if="dayErrors[day] && dayErrors[day].length > 0"
          role="alert"
          aria-live="polite"
          :data-testid="`error-${day}`"
          class="mt-3 space-y-1"
        >
          <p
            v-for="(error, idx) in dayErrors[day]"
            :key="idx"
            class="text-sm text-red-600"
          >
            {{ t(error) }}
          </p>
        </div>
      </fieldset>
    </div>
  </div>
</template>