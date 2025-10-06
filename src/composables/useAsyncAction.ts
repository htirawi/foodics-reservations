/**
 * Generic async action wrapper with loading, error, and reset states
 * Reusable pattern for handling async operations in components
 */

import { ref, type Ref } from 'vue';

export interface AsyncActionState {
  busy: Ref<boolean>;
  error: Ref<string | null>;
  reset: () => void;
}

export function useAsyncAction(): AsyncActionState & {
  run: <T>(fn: () => Promise<T>) => Promise<T>;
} {
  const busy = ref(false);
  const error = ref<string | null>(null);

  function reset(): void {
    busy.value = false;
    error.value = null;
  }

  async function run<T>(fn: () => Promise<T>): Promise<T> {
    busy.value = true;
    error.value = null;
    
    try {
      const result = await fn();
      return result;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred';
      throw err;
    } finally {
      busy.value = false;
    }
  }

  return {
    busy,
    error,
    reset,
    run,
  };
}
