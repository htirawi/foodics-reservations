import { ref } from 'vue';

export interface ModalOptions {
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const useModal = () => {
  const isOpen = ref(false);
  const options = ref<ModalOptions>({});

  const open = (modalOptions?: ModalOptions) => {
    options.value = modalOptions ?? {};
    isOpen.value = true;
  };

  const close = () => {
    isOpen.value = false;
    options.value = {};
  };

  return {
    isOpen,
    options,
    open,
    close,
  };
};
