import { ref } from 'vue';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export const useConfirm = () => {
  const isOpen = ref(false);
  const options = ref<ConfirmOptions | null>(null);
  const resolveCallback = ref<((value: boolean) => void) | null>(null);

  const confirm = (confirmOptions: ConfirmOptions): Promise<boolean> => {
    options.value = {
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      variant: 'info',
      ...confirmOptions,
    };
    isOpen.value = true;

    return new Promise((resolve) => {
      resolveCallback.value = resolve;
    });
  };

  const handleConfirm = () => {
    resolveCallback.value?.(true);
    isOpen.value = false;
    options.value = null;
    resolveCallback.value = null;
  };

  const handleCancel = () => {
    resolveCallback.value?.(false);
    isOpen.value = false;
    options.value = null;
    resolveCallback.value = null;
  };

  return {
    isOpen,
    options,
    confirm,
    handleConfirm,
    handleCancel,
  };
};
