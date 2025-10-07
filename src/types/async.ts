/**
 * @file async.ts
 * @summary Types for async action handling
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */
import type { Ref } from "vue";

export interface AsyncActionState {
  busy: Ref<boolean>;
  error: Ref<string | null>;
  reset: () => void;
}

/**
 * Result of enabling/disabling branches.
 */
export interface EnableBranchesResult {
  ok: boolean;
  enabled: string[];
  failed: string[];
}
