/**
 * @file utils.tables.spec.ts
 * @summary Unit tests for table utility functions
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */

import { describe, it, expect, vi } from "vitest";
import { reservableTablesCount, formatTableLabel } from "@/utils/tables";
import type { Section } from "@/types/foodics";

describe("reservableTablesCount", () => {
  it("returns 0 when sections is undefined", () => {
    expect(reservableTablesCount(undefined)).toBe(0);
  });

  it("returns 0 when sections is empty array", () => {
    expect(reservableTablesCount([])).toBe(0);
  });

  it("returns 0 when sections have no tables", () => {
    const sections: Section[] = [
      {
        id: "section-1",
        branch_id: "branch-1",
        name: "Main Hall",
        name_localized: null,
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
        deleted_at: null,
      },
    ];
    
    expect(reservableTablesCount(sections)).toBe(0);
  });

  it("returns 0 when sections have empty tables array", () => {
    const sections: Section[] = [
      {
        id: "section-1",
        branch_id: "branch-1",
        name: "Main Hall",
        name_localized: null,
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
        deleted_at: null,
        tables: [],
      },
    ];
    
    expect(reservableTablesCount(sections)).toBe(0);
  });

  it("counts only tables with accepts_reservations === true", () => {
    const sections: Section[] = [
      {
        id: "section-1",
        branch_id: "branch-1",
        name: "Main Hall",
        name_localized: null,
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
        deleted_at: null,
        tables: [
          {
            id: "table-1",
            name: "Table 1",
            section_id: "section-1",
            accepts_reservations: true,
            seats: 4,
            status: 1,
            created_at: "2024-01-01",
            updated_at: "2024-01-01",
            deleted_at: null,
          },
          {
            id: "table-2",
            name: "Table 2",
            section_id: "section-1",
            accepts_reservations: false,
            seats: 2,
            status: 1,
            created_at: "2024-01-01",
            updated_at: "2024-01-01",
            deleted_at: null,
          },
          {
            id: "table-3",
            name: "Table 3",
            section_id: "section-1",
            accepts_reservations: true,
            seats: 6,
            status: 1,
            created_at: "2024-01-01",
            updated_at: "2024-01-01",
            deleted_at: null,
          },
        ],
      },
    ];
    
    expect(reservableTablesCount(sections)).toBe(2);
  });

  it("counts reservable tables across multiple sections", () => {
    const sections: Section[] = [
      {
        id: "section-1",
        branch_id: "branch-1",
        name: "Main Hall",
        name_localized: null,
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
        deleted_at: null,
        tables: [
          {
            id: "table-1",
            name: "Table 1",
            section_id: "section-1",
            accepts_reservations: true,
            seats: 4,
            status: 1,
            created_at: "2024-01-01",
            updated_at: "2024-01-01",
            deleted_at: null,
          },
          {
            id: "table-2",
            name: "Table 2",
            section_id: "section-1",
            accepts_reservations: false,
            seats: 2,
            status: 1,
            created_at: "2024-01-01",
            updated_at: "2024-01-01",
            deleted_at: null,
          },
        ],
      },
      {
        id: "section-2",
        branch_id: "branch-1",
        name: "VIP Area",
        name_localized: null,
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
        deleted_at: null,
        tables: [
          {
            id: "table-3",
            name: "Table 3",
            section_id: "section-2",
            accepts_reservations: true,
            seats: 6,
            status: 1,
            created_at: "2024-01-01",
            updated_at: "2024-01-01",
            deleted_at: null,
          },
          {
            id: "table-4",
            name: "Table 4",
            section_id: "section-2",
            accepts_reservations: true,
            seats: 8,
            status: 1,
            created_at: "2024-01-01",
            updated_at: "2024-01-01",
            deleted_at: null,
          },
        ],
      },
    ];
    
    expect(reservableTablesCount(sections)).toBe(3);
  });

  it("returns correct count when all tables accept reservations", () => {
    const sections: Section[] = [
      {
        id: "section-1",
        branch_id: "branch-1",
        name: "Main Hall",
        name_localized: null,
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
        deleted_at: null,
        tables: [
          {
            id: "table-1",
            name: "Table 1",
            section_id: "section-1",
            accepts_reservations: true,
            seats: 4,
            status: 1,
            created_at: "2024-01-01",
            updated_at: "2024-01-01",
            deleted_at: null,
          },
          {
            id: "table-2",
            name: "Table 2",
            section_id: "section-1",
            accepts_reservations: true,
            seats: 2,
            status: 1,
            created_at: "2024-01-01",
            updated_at: "2024-01-01",
            deleted_at: null,
          },
        ],
      },
    ];
    
    expect(reservableTablesCount(sections)).toBe(2);
  });
});

describe("formatTableLabel", () => {
  const mockT = vi.fn((key: string) => {
    const translations: Record<string, string> = {
      "settings.tables.unnamedSection": "Unnamed Section",
      "settings.tables.unnamedTable": "Unnamed Table",
    };
    return translations[key] ?? key;
  });

  it("formats label with both section and table names", () => {
    const result = formatTableLabel("Main Hall", "Table 1", mockT);
    expect(result).toBe("Main Hall – Table 1");
  });

  it("uses fallback for null section name", () => {
    const result = formatTableLabel(null, "Table 1", mockT);
    expect(result).toBe("Unnamed Section – Table 1");
    expect(mockT).toHaveBeenCalledWith("settings.tables.unnamedSection");
  });

  it("uses fallback for undefined section name", () => {
    const result = formatTableLabel(undefined, "Table 1", mockT);
    expect(result).toBe("Unnamed Section – Table 1");
    expect(mockT).toHaveBeenCalledWith("settings.tables.unnamedSection");
  });

  it("uses fallback for null table name", () => {
    const result = formatTableLabel("Main Hall", null, mockT);
    expect(result).toBe("Main Hall – Unnamed Table");
    expect(mockT).toHaveBeenCalledWith("settings.tables.unnamedTable");
  });

  it("uses fallback for undefined table name", () => {
    const result = formatTableLabel("Main Hall", undefined, mockT);
    expect(result).toBe("Main Hall – Unnamed Table");
    expect(mockT).toHaveBeenCalledWith("settings.tables.unnamedTable");
  });

  it("uses fallbacks for both null names", () => {
    const result = formatTableLabel(null, null, mockT);
    expect(result).toBe("Unnamed Section – Unnamed Table");
    expect(mockT).toHaveBeenCalledWith("settings.tables.unnamedSection");
    expect(mockT).toHaveBeenCalledWith("settings.tables.unnamedTable");
  });

  it("uses fallbacks for both undefined names", () => {
    const result = formatTableLabel(undefined, undefined, mockT);
    expect(result).toBe("Unnamed Section – Unnamed Table");
    expect(mockT).toHaveBeenCalledWith("settings.tables.unnamedSection");
    expect(mockT).toHaveBeenCalledWith("settings.tables.unnamedTable");
  });
});

