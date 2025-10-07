/**
 * @file branches.service.ts
 * @summary Module: src/services/branches.service.ts
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */
import { httpClient } from "@/services/http";
import type { IBranch, IUpdateBranchSettingsPayload } from "@/types/foodics";
import type { IFoodicsResponse } from "@/types/api";
export const BranchesService = {
    async getBranches(includeSections = false): Promise<IBranch[]> {
        const params = includeSections
            ? { "include[0]": "sections", "include[1]": "sections.tables" }
            : {};
        const { data } = await httpClient.get<IFoodicsResponse<IBranch[]>>("/branches", { params });
        return data.data;
    },
    async enableBranch(id: string): Promise<IBranch> {
        const { data } = await httpClient.put<IFoodicsResponse<IBranch>>(`/branches/${id}`, { accepts_reservations: true });
        return data.data;
    },
    async disableBranch(id: string): Promise<IBranch> {
        const { data } = await httpClient.put<IFoodicsResponse<IBranch>>(`/branches/${id}`, { accepts_reservations: false });
        return data.data;
    },
    async updateBranchSettings(id: string, payload: IUpdateBranchSettingsPayload): Promise<IBranch> {
        const { data } = await httpClient.put<IFoodicsResponse<IBranch>>(`/branches/${id}`, payload);
        return data.data;
    },
} as const;
