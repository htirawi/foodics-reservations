<template>
  <div class="min-h-screen bg-neutral-50">
    <!-- Skip Link for Accessibility -->
    <a
      data-testid="skip-to-main"
      href="#main"
      class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      style="left: 1rem; right: auto;"
      @click="handleSkipToMain"
    >
      {{ $t('app.skipToMain') }}
    </a>
    
    <AppHeader />
    <main
      id="main"
      role="main"
      tabindex="-1"
      class="focus:outline-none"
    >
      <BranchesListView />
    </main>
    <Toaster />
    <ConfirmDialog />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import AppHeader from '@/layouts/AppHeader.vue';
import Toaster from '@/layouts/Toaster.vue';
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue';
import BranchesListView from '@/features/branches/views/BranchesListView.vue';
import { useLocale } from '@/composables/useLocale';
import { useUIStore } from '@/stores/ui.store';

const { restoreLocale } = useLocale();
const uiStore = useUIStore();

// Handle skip link navigation
const handleSkipToMain = (event: Event) => {
  event.preventDefault();
  const mainElement = document.getElementById('main');
  if (mainElement) {
    // Use focus with preventScroll for better cross-browser compatibility
    mainElement.focus({ preventScroll: true });
    // Scroll after focus is set
    setTimeout(() => {
      mainElement.scrollIntoView({ behavior: 'smooth' });
    }, 0);
  }
};

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