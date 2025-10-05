<template>
  <div class="min-h-screen bg-neutral-50">
    <AppHeader />
    <main
      id="main"
      role="main"
      tabindex="-1"
      class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8"
    >
      <slot />
    </main>
    <Toaster />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import AppHeader from '@/layouts/AppHeader.vue';
import Toaster from '@/layouts/Toaster.vue';
import { useLocale } from '@/composables/useLocale';
import { useUIStore } from '@/stores/ui.store';

const { setLocale } = useLocale();
const uiStore = useUIStore();

// Initialize locale on mount
onMounted(() => {
  setLocale('en');
  
  // Expose UI store to window for E2E testing
  if (typeof window !== 'undefined') {
    interface WindowWithStore extends Window {
      __uiStore?: typeof uiStore;
    }
    (window as unknown as WindowWithStore).__uiStore = uiStore;
  }
});
</script>