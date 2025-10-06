<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import BaseInput from '@/components/ui/BaseInput.vue';
import { isValidDuration } from '@/features/branches/utils/reservation.validation';

const props = defineProps<{
  modelValue: number;
  minDuration?: number;
  maxDuration?: number;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: number];
  'update:valid': [valid: boolean];
}>();

const { t } = useI18n();

const error = computed<string | undefined>(() => {
  if (!props.modelValue) {
    return t('settings.validation.durationRequired');
  }
  if (!isValidDuration(props.modelValue)) {
    return t('settings.validation.durationMin');
  }
  return undefined;
});

function handleUpdate(value: string | number): void {
  const numericValue = typeof value === 'string' ? parseInt(value, 10) : value;
  const finalValue = Number.isNaN(numericValue) ? 0 : numericValue;
  emit('update:modelValue', finalValue);
  emit('update:valid', isValidDuration(finalValue));
}
</script>

<template>
  <div data-testid="settings-duration">
    <BaseInput
      :model-value="modelValue"
      type="number"
      :label="t('settings.duration.label')"
      :placeholder="t('settings.duration.placeholder')"
      :error="error"
      :required="true"
      data-testid="duration-input"
      @update:model-value="handleUpdate"
    />
  </div>
</template>

