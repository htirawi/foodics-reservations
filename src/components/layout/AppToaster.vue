<template>
  <div
    v-if="toasts.length > 0"
    aria-live="polite"
    aria-atomic="true"
    role="status"
    data-testid="toaster"
    class="pointer-events-none fixed inset-x-0 bottom-0 flex items-end justify-center px-4 py-6 sm:items-start sm:justify-end sm:p-6"
  >
    <div class="flex w-full max-w-sm flex-col gap-2">
      <TransitionGroup
        name="toast"
        tag="div"
        class="flex flex-col gap-2"
      >
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :data-testid="`toast-${toast.type}`"
          class="pointer-events-auto w-full overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5"
          :class="toastClasses(toast.type)"
        >
          <div class="p-4">
            <div class="flex items-start">
              <div class="shrink-0">
                <component :is="iconComponent(toast.type)" class="h-5 w-5" aria-hidden="true" />
              </div>
              <div class="ms-3 w-0 flex-1 pt-0.5">
                <p class="text-sm font-medium">
                  {{ toast.message }}
                </p>
              </div>
              <div class="ms-4 flex shrink-0">
                <button
                  type="button"
                  :aria-label="$t('app.close', 'Close')"
                  class="inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2"
                  :class="closeButtonClasses(toast.type)"
                  @click="removeToast(toast.id)"
                >
                  <span class="sr-only">Close</span>
                  <svg
class="h-5 w-5"
viewBox="0 0 20 20"
fill="currentColor"
aria-hidden="true">
                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup lang="ts">/**
 * @file AppToaster.vue
 * @summary Module: src/components/layout/AppToaster.vue
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */
import { h } from "vue";
import { storeToRefs } from "pinia";
import { useUIStore } from "@/stores/ui.store";
import type { Toast } from "@/types/toast";
const uiStore = useUIStore();
const { toasts } = storeToRefs(uiStore);
const { removeToast } = uiStore;
function toastClasses(type: Toast["type"]): string {
    const baseClasses = "bg-white";
    const typeClasses = {
        success: "text-green-800",
        error: "text-red-800",
        warning: "text-yellow-800",
        info: "text-blue-800",
    };
    return `${baseClasses} ${typeClasses[type]}`;
}
function closeButtonClasses(type: Toast["type"]): string {
    const typeClasses = {
        success: "text-green-500 hover:text-green-600 focus:ring-green-500",
        error: "text-red-500 hover:text-red-600 focus:ring-red-500",
        warning: "text-yellow-500 hover:text-yellow-600 focus:ring-yellow-500",
        info: "text-blue-500 hover:text-blue-600 focus:ring-blue-500",
    };
    return typeClasses[type];
}
function iconComponent(type: Toast["type"]) {
    const icons = {
        success: () => h("svg", { class: "text-green-400", viewBox: "0 0 20 20", fill: "currentColor" }, [
            h("path", {
                fillRule: "evenodd",
                d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z",
                clipRule: "evenodd"
            })
        ]),
        error: () => h("svg", { class: "text-red-400", viewBox: "0 0 20 20", fill: "currentColor" }, [
            h("path", {
                fillRule: "evenodd",
                d: "M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z",
                clipRule: "evenodd"
            })
        ]),
        warning: () => h("svg", { class: "text-yellow-400", viewBox: "0 0 20 20", fill: "currentColor" }, [
            h("path", {
                fillRule: "evenodd",
                d: "M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z",
                clipRule: "evenodd"
            })
        ]),
        info: () => h("svg", { class: "text-blue-400", viewBox: "0 0 20 20", fill: "currentColor" }, [
            h("path", {
                fillRule: "evenodd",
                d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z",
                clipRule: "evenodd"
            })
        ]),
    };
    return icons[type];
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(1rem);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(1rem);
}
</style>
