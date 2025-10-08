<script setup lang="ts">
import { TESTID_LOCALE_SWITCHER } from "@/constants/testids";

import { useLocale } from "@/composables/useLocale";

const { currentLocale, toggleLocale } = useLocale();
</script>

<template>
  <button
    type="button"
    :aria-label="$t('app.switchToArabic')"
    :data-testid="TESTID_LOCALE_SWITCHER"
    class="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
    @click="toggleLocale"
  >
    {{ currentLocale === 'en' ? $t('app.switchToArabic') : $t('app.switchToEnglish') }}
  </button>
</template>
