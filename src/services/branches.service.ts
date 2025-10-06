/**
 * @file branches.service.ts
 * @summary Module: src/services/branches.service.ts
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */
import { httpClient } from "@/services/http";
import type { Branch, UpdateBranchSettingsPayload } from "@/types/foodics";
import type { FoodicsResponse } from "@/types/api";
export const BranchesService = {
    async getBranches(includeSections = false): Promise<Branch[]> {
        const params = includeSections
            ? { "include[0]": "sections", "include[1]": "sections.tables" }
            : {};
        const { data } = await httpClient.get<FoodicsResponse<Branch[]>>("/branches", { params });
        return data.data;
    },
    async enableBranch(id: string): Promise<Branch> {
        const { data } = await httpClient.put<FoodicsResponse<Branch>>(`/branches/${id}`, { accepts_reservations: true });
        return data.data;
    },
    async disableBranch(id: string): Promise<Branch> {
        const { data } = await httpClient.put<FoodicsResponse<Branch>>(`/branches/${id}`, { accepts_reservations: false });
        return data.data;
    },
    async updateBranchSettings(id: string, payload: UpdateBranchSettingsPayload): Promise<Branch> {
        const { data } = await httpClient.put<FoodicsResponse<Branch>>(`/branches/${id}`, payload);
        return data.data;
    },
} as const;
