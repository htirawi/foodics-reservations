<script setup lang="ts">
import BaseButton from "@/components/ui/BaseButton.vue";
import { useDisableAll } from "@/features/branches/composables/useDisableAll";

interface Props {
    disabled?: boolean;
}

withDefaults(defineProps<Props>(), {
    disabled: false,
});

const { busy, disableAll } = useDisableAll();
</script>

<template>
  <BaseButton
    data-testid="disable-all-btn"
    variant="danger"
    :disabled="disabled || busy"
    @click="disableAll"
  >
    <span v-if="busy" class="inline-flex items-center gap-2">
      <svg
class="h-4 w-4 animate-spin"
xmlns="http://www.w3.org/2000/svg"
fill="none"
viewBox="0 0 24 24">
        <circle
class="opacity-25"
cx="12"
cy="12"
r="10"
stroke="currentColor"
stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      {{ $t('actions.saving') }}
    </span>
    <span v-else>{{ $t('reservations.disableAll') }}</span>
  </BaseButton>
</template>
