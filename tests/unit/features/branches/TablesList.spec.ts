/**
 * @file TablesList.spec.ts
 * @summary Module: tests/unit/features/branches/TablesList.spec.ts
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */
import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { createI18n } from "vue-i18n";
import TablesList from "@/features/branches/components/ReservationSettingsModal/TablesList.vue";
import type { Section } from "@/types/foodics";
const i18n = createI18n({
    legacy: false,
    locale: "en",
    messages: {
        en: {
            settings: {
                tables: {
                    label: "Tables",
                    noTables: "No tables",
                    noSections: "No sections",
                    seats: "seats",
                },
            },
        },
    },
});
describe("ReservationSettingsModal/TablesList", () => {
    it("renders sections and tables", () => {
        const sections: Section[] = [
            {
                id: "section-1",
                branch_id: "branch-1",
                name: "Main Dining",
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
                ],
            },
        ];
        const wrapper = mount(TablesList, {
            props: {
                sections,
            },
            global: {
                plugins: [i18n],
            },
        });
        expect(wrapper.find("[data-testid=\"settings-tables\"]").exists()).toBe(true);
        expect(wrapper.find("[data-testid=\"section-section-1\"]").exists()).toBe(true);
        expect(wrapper.find("[data-testid=\"table-table-1\"]").exists()).toBe(true);
        expect(wrapper.text()).toContain("Table 1");
        expect(wrapper.text()).toContain("4");
    });
    it("shows no sections message when sections is empty", () => {
        const wrapper = mount(TablesList, {
            props: {
                sections: [],
            },
            global: {
                plugins: [i18n],
            },
        });
        expect(wrapper.text()).toContain("No sections");
    });
    it("shows no sections message when sections is undefined", () => {
        const wrapper = mount(TablesList, {
            props: {
                sections: undefined,
            },
            global: {
                plugins: [i18n],
            },
        });
        expect(wrapper.text()).toContain("No sections");
    });
});
