/**
 * @file tables.ts
 * @summary Pure table-related helpers for counting and formatting
 * @remarks
 *   - Pure functions; no side effects.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */

import type { ISection, ITable } from "@/types/foodics";

/**
 * Count the number of tables across all sections that accept reservations.
 * 
 * @param sections - Array of sections (may be undefined or have undefined tables)
 * @returns Total count of tables where accepts_reservations === true
 */
export function reservableTablesCount(sections: ISection[] | undefined): number {
  if (!sections) {
    return 0;
  }

  return sections.reduce((total, section) => {
    if (!section.tables) {
      return total;
    }
    
    const reservableInSection = section.tables.filter(
      (table: ITable) => table.accepts_reservations === true
    ).length;
    
    return total + reservableInSection;
  }, 0);
}

/**
 * Format a table label as "Section Name – Table Name" with i18n fallbacks.
 * 
 * @param sectionName - Section name (may be null or undefined)
 * @param tableName - Table name (may be null or undefined)
 * @param t - i18n translation function
 * @returns Formatted label string
 */
export function formatTableLabel(
  sectionName: string | null | undefined,
  tableName: string | null | undefined,
  t: (key: string) => string
): string {
  const sectionLabel = sectionName ?? t("settings.tables.unnamedSection");
  const tableLabel = tableName ?? t("settings.tables.unnamedTable");
  
  return `${sectionLabel} – ${tableLabel}`;
}

