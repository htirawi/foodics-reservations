import type { Ref } from "vue";

export interface IAsyncActionState {
  busy: Ref<boolean>;
  error: Ref<string | null>;
  reset: () => void;
}

/**
 * Result of enabling/disabling branches.
 */
export interface IEnableBranchesResult {
  ok: boolean;
  enabled: string[];
  failed: string[];
}

// Backward-compatibility aliases
export type AsyncActionState = IAsyncActionState;
export type EnableBranchesResult = IEnableBranchesResult;
