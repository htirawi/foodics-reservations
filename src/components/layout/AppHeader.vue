<template>
  <header
    role="banner"
    class="bg-white shadow-sm"
  >
    <div class="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between gap-4">
        <h1
          :data-testid="TESTID_HEADER_TITLE"
          class="text-2xl font-bold text-neutral-900"
        >
          {{ $t('app.title') }}
        </h1>
        <LocaleSwitcher />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">/**
 * @file AppHeader.vue
 * @summary Module: src/components/layout/AppHeader.vue
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */
import LocaleSwitcher from "@/components/ui/LocaleSwitcher.vue";
import { TESTID_HEADER_TITLE } from "@/constants/testids";
</script>
