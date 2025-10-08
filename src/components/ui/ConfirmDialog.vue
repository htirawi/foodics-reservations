<template>
  <BaseModal
    :model-value="confirmDialog.isOpen"
    :title="confirmDialog.options?.title || $t('app.title')"
    :data-testid="TESTID_CONFIRM_MODAL"
    size="sm"
    @update:model-value="handleClose"
  >
    <div v-if="confirmDialog.options" class="space-y-4">
      <p class="text-sm text-gray-600">
        {{ confirmDialog.options.message }}
      </p>
    </div>

    <template #actions>
      <div class="flex justify-end space-x-3">
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
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useUIStore } from "@/stores/ui.store";
import BaseModal from "@/components/ui/BaseModal.vue";
import BaseButton from "@/components/ui/BaseButton.vue";
import { TESTID_CONFIRM_MODAL, TESTID_CONFIRM_CANCEL, TESTID_CONFIRM_OK } from "@/constants/testids";

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
