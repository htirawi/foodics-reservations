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
    {{ $t('reservations.disableAll') }}
  </BaseButton>
</template>
