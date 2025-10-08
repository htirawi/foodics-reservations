import type { IBranch } from "@/types/foodics";

/**
 * Count the number of reservable tables in a branch
 */
export function countReservableTables(branch: IBranch): number {
  if (!branch.sections) return 0;

  return branch.sections.reduce((total, section) => {
    const sectionTables = section.tables ?? [];
    return total + sectionTables.filter((t) => t.accepts_reservations).length;
  }, 0);
}

/**
 * Find a branch by its ID
 */
export function findBranchById(
  branches: IBranch[],
  id: string
): IBranch | null {
  return branches.find((b) => b.id === id) ?? null;
}
