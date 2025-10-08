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
import {
    API_ENDPOINT_BRANCHES,
    API_PARAM_INCLUDE_0,
    API_PARAM_INCLUDE_1,
    API_INCLUDE_SECTIONS,
    API_INCLUDE_SECTIONS_TABLES,
} from "@/constants/api";

export const BranchesService = {
    async getBranches(includeSections = false): Promise<IBranch[]> {
        const params = includeSections
            ? { [API_PARAM_INCLUDE_0]: API_INCLUDE_SECTIONS, [API_PARAM_INCLUDE_1]: API_INCLUDE_SECTIONS_TABLES }
            : {};
        const { data } = await httpClient.get<IFoodicsResponse<IBranch[]>>(API_ENDPOINT_BRANCHES, { params });
        return data.data;
    },
    async enableBranch(id: string): Promise<IBranch> {
        const { data } = await httpClient.put<IFoodicsResponse<IBranch>>(`${API_ENDPOINT_BRANCHES}/${id}`, { accepts_reservations: true });
        return data.data;
    },
    async disableBranch(id: string): Promise<IBranch> {
        const { data } = await httpClient.put<IFoodicsResponse<IBranch>>(`${API_ENDPOINT_BRANCHES}/${id}`, { accepts_reservations: false });
        return data.data;
    },
    async updateBranchSettings(id: string, payload: IUpdateBranchSettingsPayload): Promise<IBranch> {
        const { data } = await httpClient.put<IFoodicsResponse<IBranch>>(`${API_ENDPOINT_BRANCHES}/${id}`, payload);
        return data.data;
    },
};
