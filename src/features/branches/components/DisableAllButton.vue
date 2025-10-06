<template>
  <BaseButton
    data-test-id="disable-all"
    variant="danger"
    :disabled="disabled || busy"
    @click="disableAll"
  >
    {{ $t('reservations.disableAll') }}
  </BaseButton>
</template>

<script setup lang="ts">/**
 * @file DisableAllButton.vue
 * @summary Module: src/features/branches/components/DisableAllButton.vue
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */
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

