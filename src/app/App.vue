<template>
  <div class="min-h-screen bg-neutral-50">
    
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
    <AppToaster />
    <ConfirmDialog />
  </div>
</template>

<script setup lang="ts">/**
 * @file App.vue
 * @summary Module: src/app/App.vue
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */
import { onMounted } from "vue";
import AppHeader from "@/components/layout/AppHeader.vue";
import AppToaster from "@/components/layout/AppToaster.vue";
import ConfirmDialog from "@/components/ui/ConfirmDialog.vue";
import BranchesListView from "@/features/branches/views/BranchesListView.vue";
import { useLocale } from "@/composables/useLocale";
import { useUIStore } from "@/stores/ui.store";
const { restoreLocale } = useLocale();
const uiStore = useUIStore();
const handleSkipToMain = (event: Event) => {
    event.preventDefault();
    const mainElement = document.getElementById("main");
    if (mainElement) {
        mainElement.focus({ preventScroll: true });
        setTimeout(() => {
            mainElement.scrollIntoView({ behavior: "smooth" });
        }, 0);
    }
};
onMounted(() => {
    restoreLocale();
    // Expose UI store to window for debugging purposes in development
    if (typeof window !== "undefined" && import.meta.env.DEV) {
        (window as Window & { __uiStore?: typeof uiStore }).__uiStore = uiStore;
    }
});
</script>