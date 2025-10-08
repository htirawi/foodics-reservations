import { useI18n } from "vue-i18n";
import { useUIStore } from "@/stores/ui.store";
import { useErrorMapper } from "@/composables/useErrorMapper";
import type { IApiError } from "@/types/api";

export function useApiErrorHandler() {
  const { t } = useI18n();
  const uiStore = useUIStore();
  const { mapError } = useErrorMapper();

  /**
   * Handles an API error by showing appropriate toast notification
   * and optionally clearing store errors for server errors
   */
  function handleError(error: IApiError, options?: { clearStoreError?: () => void }): void {
    const mapped = mapError(error);

    uiStore.notify(t(mapped.i18nKey), "error");

    if (mapped.kind === "server" && options?.clearStoreError) {
      options.clearStoreError();
    }
  }

  return {
    handleError,
  };
}
