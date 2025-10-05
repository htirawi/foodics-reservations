<template>
  <div class="min-h-screen bg-neutral-50">
    <AppHeader />
    <main
      id="main"
      role="main"
      tabindex="-1"
    >
      <BranchesListView />
    </main>
    <Toaster />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import AppHeader from '@/layouts/AppHeader.vue';
import Toaster from '@/layouts/Toaster.vue';
import BranchesListView from '@/features/branches/views/BranchesListView.vue';
import { useLocale } from '@/composables/useLocale';
import { useUIStore } from '@/stores/ui.store';

const { restoreLocale } = useLocale();
const uiStore = useUIStore();

// Restore locale from localStorage on mount
onMounted(() => {
  restoreLocale();
  
  // Expose UI store to window for E2E testing
  if (typeof window !== 'undefined') {
    interface WindowWithStore extends Window {
      __uiStore?: typeof uiStore;
    }
    (window as unknown as WindowWithStore).__uiStore = uiStore;
  }
});
</script>