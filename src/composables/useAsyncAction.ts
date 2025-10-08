import { ref } from "vue";
import type { IAsyncActionState } from "@/types/async";

/**
 * Manages asynchronous action state with loading indicators and error tracking.
 * Provides a standardized pattern for handling async operations with proper cleanup.
 *
 * @returns Object containing busy state, error state, reset function, and run executor
 *
 * @example
 * ```typescript
 * const { busy, error, run } = useAsyncAction();
 *
 * await run(async () => {
 *   const data = await fetchBranches();
 *   processBranches(data);
 * });
 *
 * if (error.value) {
 *   console.error('Operation failed:', error.value);
 * }
 * ```
 */
export function useAsyncAction(): IAsyncActionState & {
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
        }
        catch (err) {
            error.value = err instanceof Error ? err.message : "An error occurred";
            throw err;
        }
        finally {
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
