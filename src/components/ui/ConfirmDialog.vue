<script setup lang="ts">
import { storeToRefs } from "pinia";

import BaseButton from "@/components/ui/BaseButton.vue";
import { TESTID_CONFIRM_MODAL, TESTID_CONFIRM_CANCEL, TESTID_CONFIRM_OK } from "@/constants/testids";
import { useUIStore } from "@/stores/ui.store";

const uiStore = useUIStore();
const { confirmDialog } = storeToRefs(uiStore);
const { resolveConfirm } = uiStore;

function handleConfirm() {
    resolveConfirm(true);
}

function handleCancel() {
    resolveConfirm(false);
}

function handleClose() {
    resolveConfirm(false);
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="confirmDialog.isOpen"
        class="fixed inset-0 z-[60] flex items-center justify-center p-4"
        @click.self="handleClose"
      >
        <div class="fixed inset-0 bg-black bg-opacity-50" @click="handleClose"></div>
        <div
          :data-testid="TESTID_CONFIRM_MODAL"
          class="relative bg-white rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto w-full max-w-md"
          role="dialog"
          aria-modal="true"
          @click.stop
        >
          <div class="flex items-center justify-between border-b border-neutral-200 p-6">
            <h2 class="text-xl font-semibold text-neutral-900">
              {{ confirmDialog.options?.title || $t('app.title') }}
            </h2>
            <button
              type="button"
              :aria-label="$t('app.close')"
              class="text-neutral-400 hover:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg p-1"
              @click="handleClose"
            >
              <svg
class="h-6 w-6"
fill="none"
viewBox="0 0 24 24"
stroke="currentColor">
                <path
stroke-linecap="round"
stroke-linejoin="round"
stroke-width="2"
d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="p-6">
            <div v-if="confirmDialog.options" class="space-y-4">
              <p class="text-sm text-gray-600">
                {{ confirmDialog.options.message }}
              </p>
            </div>
          </div>
          <div class="flex items-center justify-between border-t border-neutral-200 p-6">
            <div class="flex justify-end space-x-3 w-full">
              <BaseButton
                variant="ghost"
                :data-testid="TESTID_CONFIRM_CANCEL"
                @click="handleCancel"
              >
                {{ confirmDialog.options?.cancelText || $t('reservations.confirm.disableAll.cancel') }}
              </BaseButton>
              <BaseButton
                :variant="confirmDialog.options?.variant === 'danger' ? 'danger' : 'primary'"
                :data-testid="TESTID_CONFIRM_OK"
                @click="handleConfirm"
              >
                {{ confirmDialog.options?.confirmText || $t('reservations.confirm.disableAll.confirm') }}
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.3s ease;
}

.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.95);
}
</style>
