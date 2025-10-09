/**
 * File: src/utils/branches.ts
 * Purpose: Centralized branch filtering utilities based on Foodics API spec
 * Notes: Filters respect accepts_reservations flag and deleted_at (soft-delete)
 */

import type { IBranch } from "@/types/foodics";

/**
 * Check if branch is enabled and not soft-deleted (actionable in list view).
 */
export function isEnabledBranch(branch: IBranch): boolean {
  return branch.accepts_reservations === true && branch.deleted_at === null;
}

/**
 * Check if branch is disabled and not soft-deleted (candidate for Add Branches).
 */
export function isDisabledBranch(branch: IBranch): boolean {
  return branch.accepts_reservations === false && branch.deleted_at === null;
}

/**
 * Check if branch is actionable (not soft-deleted, regardless of reservation status).
 */
export function isActionableBranch(branch: IBranch): boolean {
  return branch.deleted_at === null;
}

