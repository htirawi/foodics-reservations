<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import BaseButton from '@/components/ui/BaseButton.vue';
import TimePill from '@/components/ui/TimePill.vue';
import type { ReservationTimes, Weekday, SlotTuple } from '@/types/foodics';
import { validateDaySlots } from '@/features/branches/utils/reservation.validation';

const props = defineProps<{
  modelValue: ReservationTimes;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: ReservationTimes];
  'update:valid': [valid: boolean];
}>();

const { t } = useI18n();

const weekdays: Weekday[] = [
  'saturday',
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
];

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
    const slots = props.modelValue[day];
    if (slots) {
      errors[day] = validateDaySlots(slots);
    }
  });

  return errors;
});

function addSlot(day: Weekday): void {
  const newSlots = [...props.modelValue[day]];
  newSlots.push(['09:00', '17:00']);
  const updated = { ...props.modelValue, [day]: newSlots };
  emit('update:modelValue', updated);
  emitValidity(updated);
}

function removeSlot(day: Weekday, index: number): void {
  const newSlots = props.modelValue[day].filter((_, i) => i !== index);
  const updated = { ...props.modelValue, [day]: newSlots };
  emit('update:modelValue', updated);
  emitValidity(updated);
}

function updateSlot(day: Weekday, index: number, field: 'from' | 'to', value: string): void {
  const newSlots = [...props.modelValue[day]];
  const slot = newSlots[index];
  if (!slot) return;

  const updatedSlot: SlotTuple = field === 'from' ? [value, slot[1]] : [slot[0], value];
  newSlots[index] = updatedSlot;

  const updated = { ...props.modelValue, [day]: newSlots };
  emit('update:modelValue', updated);
  emitValidity(updated);
}

function applyToAllDays(day: Weekday): void {
  const template = props.modelValue[day];
  const updated: ReservationTimes = { ...props.modelValue };
  weekdays.forEach((d) => {
    updated[d] = [...template];
  });
  emit('update:modelValue', updated);
  emitValidity(updated);
}

function emitValidity(times: ReservationTimes): void {
  const allValid = weekdays.every((day) => {
    const slots = times[day];
    return slots ? validateDaySlots(slots).length === 0 : true;
  });
  emit('update:valid', allValid);
}
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

