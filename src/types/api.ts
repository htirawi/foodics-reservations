/**
 * @file api.ts
 * @summary Module: src/types/api.ts
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */
export interface ApiError {
    status: number;
    message: string;
    details?: unknown;
}
export interface FoodicsResponse<T> {
    data: T;
}
