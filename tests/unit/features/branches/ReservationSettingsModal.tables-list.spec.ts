/**
 * @file ReservationSettingsModal.tables-list.spec.ts
 * @summary Unit tests for TablesList component
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */

import { describe, it, expect, afterEach } from "vitest";
import type { VueWrapper } from "@vue/test-utils";
import { mount } from "@vue/test-utils";
import { createI18n } from "vue-i18n";
import TablesList from "@/features/branches/components/ReservationSettingsModal/TablesList.vue";
import type { Section, Table } from "@/types/foodics";

const i18n = createI18n({
  legacy: false,
  locale: "en",
  messages: {
    en: {
      settings: {
        tables: {
          title: "Tables",
          helper: "Display-only: sections and tables for this branch.",
          summary: "Reservable tables: {count}",
          unnamedSection: "Unnamed Section",
          unnamedTable: "Unnamed Table",
          noSections: "No sections available",
        },
      },
    },
  },
});

const createTable = (id: string, name: string | null, acceptsReservations: boolean): Table => ({
  id,
  name,
  section_id: "section-1",
  accepts_reservations: acceptsReservations,
  seats: 4,
  status: 1,
  created_at: "2024-01-01",
  updated_at: "2024-01-01",
  deleted_at: null,
});

const createSection = (id: string, name: string | null, tables: Table[]): Section => ({
  id,
  branch_id: "branch-1",
  name,
  name_localized: null,
  created_at: "2024-01-01",
  updated_at: "2024-01-01",
  deleted_at: null,
  tables,
});

describe("TablesList", () => {
  let wrapper: VueWrapper;

  const createWrapper = (props = {}) => {
    return mount(TablesList, {
      props: {
        sections: [],
        ...props,
      },
      global: {
        plugins: [i18n],
      },
    });
  };

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  describe("Basic Rendering", () => {
    it("renders with correct test IDs and structure", () => {
      wrapper = createWrapper();
      
      expect(wrapper.find('[data-testid="settings-tables"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="settings-tables-summary"]').exists()).toBe(true);
      expect(wrapper.text()).toContain("Tables");
      expect(wrapper.text()).toContain("Display-only: sections and tables for this branch.");
    });

    it("has semantic list structure with role", () => {
      const sections = [createSection("s1", "Hall", [createTable("t1", "Table 1", true)])];
      wrapper = createWrapper({ sections });
      
      const list = wrapper.find('[data-testid="settings-tables-list"]');
      expect(list.element.tagName).toBe("UL");
      expect(list.attributes("role")).toBe("list");
    });
  });

  describe("Summary Count", () => {
    it("displays zero count when no reservable tables", () => {
      const sections = [createSection("s1", "Hall", [createTable("t1", "Table 1", false)])];
      wrapper = createWrapper({ sections });
      
      expect(wrapper.find('[data-testid="settings-tables-summary"]').text()).toBe("Reservable tables: 0");
    });

    it("displays correct count with mixed reservable and non-reservable tables", () => {
      const sections = [
        createSection("s1", "Hall", [
          createTable("t1", "Table 1", true),
          createTable("t2", "Table 2", false),
          createTable("t3", "Table 3", true),
        ]),
      ];
      wrapper = createWrapper({ sections });
      
      expect(wrapper.find('[data-testid="settings-tables-summary"]').text()).toBe("Reservable tables: 2");
    });
  });

  describe("Filtering Logic", () => {
    const mixedSections = [
      createSection("s1", "Hall", [
        createTable("t1", "Table 1", true),
        createTable("t2", "Table 2", false),
      ]),
    ];

    it("renders all tables when reservableOnly is false", () => {
      wrapper = createWrapper({ sections: mixedSections, reservableOnly: false });
      
      const tableItems = wrapper.findAll('[data-testid^="settings-tables-table-"]');
      expect(tableItems).toHaveLength(2);
    });

    it("renders only reservable tables when reservableOnly is true", () => {
      wrapper = createWrapper({ sections: mixedSections, reservableOnly: true });
      
      const tableItems = wrapper.findAll('[data-testid^="settings-tables-table-"]');
      expect(tableItems).toHaveLength(1);
    });
  });

  describe("Labels and Fallbacks", () => {
    it("formats label with section and table names", () => {
      const sections = [createSection("s1", "Main Hall", [createTable("t1", "Table 1", true)])];
      wrapper = createWrapper({ sections });
      
      expect(wrapper.text()).toContain("Main Hall – Table 1");
    });

    it("uses fallback for null section name", () => {
      const sections = [createSection("s1", null, [createTable("t1", "Table 1", true)])];
      wrapper = createWrapper({ sections });
      
      expect(wrapper.text()).toContain("Unnamed Section – Table 1");
    });

    it("uses fallback for null table name", () => {
      const sections = [createSection("s1", "Main Hall", [createTable("t1", null, true)])];
      wrapper = createWrapper({ sections });
      
      expect(wrapper.text()).toContain("Main Hall – Unnamed Table");
    });

    it("uses fallbacks for both null names", () => {
      const sections = [createSection("s1", null, [createTable("t1", null, true)])];
      wrapper = createWrapper({ sections });
      
      expect(wrapper.text()).toContain("Unnamed Section – Unnamed Table");
    });
  });

  describe("Empty States", () => {
    it("displays empty state when sections is empty", () => {
      wrapper = createWrapper({ sections: [] });
      
      expect(wrapper.text()).toContain("No sections available");
      expect(wrapper.find('[data-testid="settings-tables-list"]').exists()).toBe(false);
    });

    it("shows zero count and renders list when sections have no tables", () => {
      const sections = [createSection("s1", "Hall", [])];
      wrapper = createWrapper({ sections });
      
      expect(wrapper.find('[data-testid="settings-tables-summary"]').text()).toBe("Reservable tables: 0");
      expect(wrapper.find('[data-testid="settings-tables-list"]').exists()).toBe(true);
      const tableItems = wrapper.findAll('[data-testid^="settings-tables-table-"]');
      expect(tableItems).toHaveLength(0);
    });
  });

  describe("Test IDs", () => {
    it("renders stable test IDs for sections and tables", () => {
      const sections = [
        createSection("section-abc", "Main Hall", [createTable("table-xyz", "Table 1", true)]),
      ];
      wrapper = createWrapper({ sections });
      
      expect(wrapper.find('[data-testid="settings-tables-section-section-abc"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="settings-tables-table-table-xyz"]').exists()).toBe(true);
    });
  });

  describe("Multiple Sections", () => {
    it("renders multiple sections with their tables correctly", () => {
      const sections = [
        createSection("s1", "Main Hall", [createTable("t1", "Table 1", true)]),
        createSection("s2", "VIP Area", [createTable("t2", "Table 2", true)]),
      ];
      wrapper = createWrapper({ sections });
      
      const sectionItems = wrapper.findAll('[data-testid^="settings-tables-section-"]');
      expect(sectionItems).toHaveLength(2);
      
      expect(wrapper.text()).toContain("Main Hall – Table 1");
      expect(wrapper.text()).toContain("VIP Area – Table 2");
    });
  });
});
