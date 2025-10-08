import type { Ref } from "vue";
import type { IBranch } from "@/types/foodics";
import type { IApiError } from "@/types/api";

/**
 * Process Promise.allSettled results into succeeded and failed IDs
 */
export function processBatchResults(
    results: PromiseSettledResult<string>[],
    ids: string[]
): { succeeded: string[]; failed: string[] } {
    const succeeded = results
        .filter((r) => r.status === "fulfilled")
        .map((r) => (r as PromiseFulfilledResult<string>).value);

    const failed = results
        .map((result, index) => ({ result, id: ids[index] }))
        .filter(({ result }) => result.status === "rejected")
        .map(({ id }) => id)
        .filter((id): id is string => id !== undefined);

    return { succeeded, failed };
}

/**
 * Apply optimistic update to branches collection
 */
export function applyOptimisticUpdate(
    branches: IBranch[],
    ids: string[],
    value: boolean
): IBranch[] {
    return branches.map((b) =>
        ids.includes(b.id) ? { ...b, accepts_reservations: value } : b
    );
}

/**
 * Rollback to snapshot with partial success applied
 */
export function rollbackWithPartialSuccess(
    snapshot: IBranch[],
    succeededIds: string[],
    value: boolean
): IBranch[] {
    return snapshot.map((b) =>
        succeededIds.includes(b.id) ? { ...b, accepts_reservations: value } : b
    );
}

/**
 * Handle complete failure scenario by extracting error and throwing
 */
export function handleCompleteFailure(
    results: PromiseSettledResult<string>[],
    errorRef: Ref<string | null>,
    fallbackMessage: string
): never {
    const firstError = results.find((r) => r.status === "rejected") as PromiseRejectedResult;
    const apiError = firstError?.reason as IApiError;
    errorRef.value = apiError?.message ?? fallbackMessage;
    throw apiError;
}
