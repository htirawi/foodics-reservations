/**
 * UI Store
 * Manages application-wide UI state: modals, toasts, and confirmation dialogs
 */

import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Toast } from '@/composables/useToast';
import type { ConfirmOptions } from '@/composables/useConfirm';

export type ModalName = 'addBranches' | 'settings';

interface ConfirmDialogState {
  isOpen: boolean;
  options: ConfirmOptions | null;
  resolve: ((value: boolean) => void) | null;
}

/**
 * Create a new toast with unique ID
 */
function createToast(message: string, type: Toast['type'], duration: number): Toast {
  const id = `${Date.now()}-${Math.random()}`;
  return { id, message, type, duration };
}

/**
 * Build confirm options with defaults
 */
function buildConfirmOptions(options: ConfirmOptions): ConfirmOptions {
  return {
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    variant: 'info',
    ...options,
  };
}

/**
 * Setup modal state and actions
 */
function useModals() {
  const openModals = ref<Set<ModalName>>(new Set());

  function openModal(name: ModalName): void {
    openModals.value.add(name);
  }

  function closeModal(name: ModalName): void {
    openModals.value.delete(name);
  }

  function isModalOpen(name: ModalName): boolean {
    return openModals.value.has(name);
  }

  return { openModals, openModal, closeModal, isModalOpen };
}

/**
 * Setup toast state and actions
 */
function useToasts() {
  const toasts = ref<Toast[]>([]);

  function notify(message: string, type: Toast['type'] = 'info', duration = 5000): string {
    const toast = createToast(message, type, duration);
    toasts.value.push(toast);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(toast.id);
      }, duration);
    }

    return toast.id;
  }

  function removeToast(id: string): void {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }

  return { toasts, notify, removeToast };
}

/**
 * Setup confirm dialog state and actions
 */
function useConfirmDialog() {
  const confirmDialog = ref<ConfirmDialogState>({
    isOpen: false,
    options: null,
    resolve: null,
  });

  function confirm(options: ConfirmOptions): Promise<boolean> {
    return new Promise((resolve) => {
      confirmDialog.value = {
        isOpen: true,
        options: buildConfirmOptions(options),
        resolve,
      };
    });
  }

  function resolveConfirm(confirmed: boolean): void {
    confirmDialog.value.resolve?.(confirmed);
    confirmDialog.value = {
      isOpen: false,
      options: null,
      resolve: null,
    };
  }

  return { confirmDialog, confirm, resolveConfirm };
}

export const useUIStore = defineStore('ui', () => {
  const modalActions = useModals();
  const toastActions = useToasts();
  const confirmActions = useConfirmDialog();

  return {
    ...modalActions,
    ...toastActions,
    ...confirmActions,
  };
});