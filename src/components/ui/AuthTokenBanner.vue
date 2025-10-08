<template>
  <UiBanner
    v-if="authBanner.isVisible"
    variant="error"
    dismissible
    test-id="auth-token-banner"
    @close="handleClose"
  >
    <div class="flex items-start justify-between gap-4 w-full">
      <div class="flex flex-col gap-1 flex-1 min-w-0">
        <p class="font-semibold">
          {{ $t('errors.auth.title') }}
        </p>
        <p class="text-sm">
          {{ authBanner.message || $t('errors.auth.message') }}
        </p>
      </div>
      <BaseButton
        v-if="authBanner.onRetry"
        variant="ghost"
        size="sm"
        data-testid="auth-banner-retry"
        class="flex-shrink-0 text-red-700 hover:text-red-800 hover:bg-red-100 border-red-300"
        @click="handleRetry"
      >
        {{ $t('actions.retry') }}
      </BaseButton>
    </div>
  </UiBanner>
</template>

<script setup lang="ts">
/**
 * @file AuthTokenBanner.vue
 * @summary Global auth token error banner
 * @remarks
 *   - Shows when 401 errors occur (triggered by http interceptor)
 *   - Dismissible by user
 *   - Uses UI store for state management
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */

import { storeToRefs } from "pinia";
import { useUIStore } from "@/stores/ui.store";
import UiBanner from "@/components/ui/UiBanner.vue";
import BaseButton from "@/components/ui/BaseButton.vue";

const uiStore = useUIStore();
const { authBanner } = storeToRefs(uiStore);

function handleClose(): void {
  uiStore.hideAuthBanner();
}

function handleRetry(): void {
  authBanner.value.onRetry?.();
}
</script>
