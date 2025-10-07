/**
 * @file api.branches.spec.ts
 * @summary Module: tests/e2e/api.branches.spec.ts
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */
import { test, expect } from "@playwright/test";
import type { Branch } from "@/types/foodics";
const IS_ONLINE_MODE = process.env["PW_E2E_ONLINE"] === "true";
const API_BASE = process.env["PW_API_BASE_URL"] ?? "https://api.foodics.dev/v5";
const AUTH_TOKEN = process.env["PW_STAGING_TOKEN"] ?? process.env["VITE_FOODICS_TOKEN"];
test.skip(!IS_ONLINE_MODE, "Skipping API contract tests - PW_E2E_ONLINE not enabled (offline mode)");
test.describe("Branches API Contract @online", () => {
    test.describe("GET /branches", () => {
        test("should return array of branches with correct shape", async ({ request }) => {
            const response = await request.get(`${API_BASE}/branches`, {
                headers: {
                    Authorization: `Bearer ${AUTH_TOKEN}`,
                },
            });
            expect(response.ok()).toBeTruthy();
            expect(response.status()).toBe(200);
            const body = await response.json();
            expect(body).toHaveProperty("data");
            expect(Array.isArray(body.data)).toBeTruthy();
            if (body.data.length > 0) {
                const branch = body.data[0] as Branch;
                expect(typeof branch.id).toBe("string");
                expect(branch.id.length).toBeGreaterThan(0);
                expect(typeof branch.name).toBe("string");
                expect(typeof branch.reference).toBe("string");
                expect(typeof branch.accepts_reservations).toBe("boolean");
                expect(typeof branch.receives_online_orders).toBe("boolean");
                expect(typeof branch.type).toBe("number");
                expect(typeof branch.reservation_duration).toBe("number");
                expect(branch.reservation_duration).toBeGreaterThan(0);
                expect(typeof branch.opening_from).toBe("string");
                expect(typeof branch.opening_to).toBe("string");
                expect(typeof branch.created_at).toBe("string");
                expect(typeof branch.updated_at).toBe("string");
                expect(branch.reservation_times).toBeDefined();
                expect(typeof branch.reservation_times).toBe("object");
                const weekdays = ["saturday", "sunday", "monday", "tuesday", "wednesday", "thursday", "friday"];
                weekdays.forEach((day) => {
                    expect(branch.reservation_times[day as keyof typeof branch.reservation_times]).toBeDefined();
                    expect(Array.isArray(branch.reservation_times[day as keyof typeof branch.reservation_times])).toBeTruthy();
                });
                expect(branch.sections).toBeUndefined();
            }
        });
        test("should include sections when requested", async ({ request }) => {
            const response = await request.get(`${API_BASE}/branches?include=sections.tables`, {
                headers: {
                    Authorization: `Bearer ${AUTH_TOKEN}`,
                },
            });
            expect(response.ok()).toBeTruthy();
            const body = await response.json();
            if (body.data.length > 0) {
                const branch = body.data[0] as Branch;
                expect(branch.sections).toBeDefined();
                expect(Array.isArray(branch.sections)).toBeTruthy();
                if (branch.sections && branch.sections.length > 0) {
                    const section = branch.sections[0];
                    if (section) {
                        expect(typeof section.id).toBe("string");
                        expect(typeof section.branch_id).toBe("string");
                        expect(section.branch_id).toBe(branch.id);
                        expect(section.tables).toBeDefined();
                        expect(Array.isArray(section.tables)).toBeTruthy();
                        if (section.tables && section.tables.length > 0) {
                            const table = section.tables[0];
                            if (table) {
                                expect(typeof table.id).toBe("string");
                                expect(typeof table.section_id).toBe("string");
                                expect(typeof table.accepts_reservations).toBe("boolean");
                                expect(typeof table.seats).toBe("number");
                                expect(typeof table.status).toBe("number");
                            }
                        }
                    }
                }
            }
        });
        test("should require authentication", async ({ request }) => {
            const response = await request.get(`${API_BASE}/branches`, {
                headers: {
                    Authorization: "",
                },
            });
            expect([401, 403]).toContain(response.status());
        });
    });
    test.describe("PATCH /branches/:id", () => {
        test("should return 405 or 403 if PATCH is not allowed", async ({ request }) => {
            const listResponse = await request.get(`${API_BASE}/branches`, {
                headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
            });
            const listBody = await listResponse.json();
            if (listBody.data && listBody.data.length > 0) {
                const branchId = listBody.data[0].id;
                const response = await request.patch(`${API_BASE}/branches/${branchId}`, {
                    headers: {
                        Authorization: `Bearer ${AUTH_TOKEN}`,
                        "Content-Type": "application/json",
                    },
                    data: {
                        accepts_reservations: true,
                    },
                });
                expect([200, 201, 403, 405]).toContain(response.status());
            }
            else {
                test.skip();
            }
        });
        test("should require authentication for PATCH", async ({ request }) => {
            const response = await request.patch(`${API_BASE}/branches/some-id`, {
                headers: {
                    "Content-Type": "application/json",
                },
                data: {
                    accepts_reservations: true,
                },
            });
            expect([401, 403, 405]).toContain(response.status());
        });
    });
    test.describe("Response Structure", () => {
        test("should wrap all responses in { data: T }", async ({ request }) => {
            const response = await request.get(`${API_BASE}/branches`, {
                headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
            });
            expect(response.ok()).toBeTruthy();
            const body = await response.json();
            expect(body).toHaveProperty("data");
            expect(body.data).toBeDefined();
        });
    });
    test.describe("Error Responses", () => {
        test("should return proper error on invalid endpoint", async ({ request }) => {
            const response = await request.get(`${API_BASE}/invalid-endpoint-12345`, {
                headers: {
                    Authorization: `Bearer ${AUTH_TOKEN}`,
                },
            });
            expect(response.status()).toBeGreaterThanOrEqual(400);
            try {
                const body = await response.json();
                const hasErrorField = "message" in body || "error" in body;
                expect(hasErrorField).toBeTruthy();
            }
            catch {
                expect([404, 500]).toContain(response.status());
            }
        });
    });
});
