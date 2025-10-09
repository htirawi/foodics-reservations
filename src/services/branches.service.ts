import type { AxiosResponse } from "axios";

import {
    API_ENDPOINT_BRANCHES,
    API_PARAM_INCLUDE_0,
    API_PARAM_INCLUDE_1,
    API_INCLUDE_SECTIONS,
    API_INCLUDE_SECTIONS_TABLES,
} from "@/constants/api";
import { httpClient } from "@/services/http";
import type { IFoodicsResponse, IFoodicsPaginatedResponse } from "@/types/api";
import type { IBranch, IUpdateBranchSettingsPayload } from "@/types/foodics";

/**
 * Helper: Fetch remaining pages in parallel
 */
async function fetchRemainingPagesInParallel(
    totalPages: number,
    params: Record<string, unknown>
): Promise<IBranch[]> {
    const remainingPagePromises = Array.from(
        { length: totalPages - 1 },
        (_, i) => {
            const page = i + 2; // Pages 2, 3, 4, ...
            return httpClient.get<IFoodicsPaginatedResponse<IBranch[]>>(
                API_ENDPOINT_BRANCHES,
                { params: { ...params, page } }
            );
        }
    );

    const responses = await Promise.all(remainingPagePromises);
    return responses.flatMap(response => response.data.data);
}

/**
 * Helper: Fetch remaining pages sequentially by following links.next
 */
async function fetchRemainingPagesSequentially(
    firstPageData: IBranch[],
    nextUrl: string,
    params: Record<string, unknown>
): Promise<IBranch[]> {
    let allBranches: IBranch[] = [...firstPageData];
    let currentNextUrl: string | null = nextUrl;

    while (currentNextUrl) {
        // Extract path and query from full URL
        let urlToUse = currentNextUrl.startsWith('http')
            ? new URL(currentNextUrl).pathname + new URL(currentNextUrl).search
            : currentNextUrl;

        // Strip /v5 from the pathname if present (API returns /v5/branches, we need /branches)
        urlToUse = urlToUse.replace(/^\/v5\//, '/');

        const response: AxiosResponse<IFoodicsPaginatedResponse<IBranch[]>> =
            await httpClient.get<IFoodicsPaginatedResponse<IBranch[]>>(urlToUse, { params });

        allBranches = allBranches.concat(response.data.data);
        currentNextUrl = response.data.links.next;
    }

    return allBranches;
}

/**
 * Helper: Calculate total pages from pagination metadata
 */
function calculateTotalPages(meta: IFoodicsPaginatedResponse<IBranch[]>['meta']): number | undefined {
    if (meta.last_page) {
        return meta.last_page;
    }
    
    if (meta.to && meta.per_page) {
        return Math.ceil(meta.to / meta.per_page);
    }
    
    return undefined;
}

export const BranchesService = {
    async getBranches(includeSections = false): Promise<IBranch[]> {
        const params = includeSections
            ? { [API_PARAM_INCLUDE_0]: API_INCLUDE_SECTIONS, [API_PARAM_INCLUDE_1]: API_INCLUDE_SECTIONS_TABLES }
            : {};
        const { data } = await httpClient.get<IFoodicsResponse<IBranch[]>>(API_ENDPOINT_BRANCHES, { params });
        return data.data;
    },

    /**
     * Fetch all branches across all pages by following pagination links.
     * Use this for operations requiring complete data (e.g., Add Branches modal).
     *
     * ⚠️ WHY MULTIPLE API CALLS?
     * The Foodics API enforces a hard limit of 50 items per page (cannot be customized).
     * With 186+ branches, we need multiple calls to fetch all data:
     *   - 186 branches ÷ 50 per page = ~4 API calls required
     *
     * OPTIMIZATION STRATEGY:
     * 1. Fetch page 1 to determine total pages (from meta.to or meta.last_page)
     * 2. If total pages known: Fetch remaining pages IN PARALLEL (2x faster!)
     * 3. If total pages unknown: Follow links.next SEQUENTIALLY (fallback)
     *
     * Performance:
     * - Parallel: ~400ms (page 1 + parallel pages 2-4)
     * - Sequential: ~800ms (page 1 → page 2 → page 3 → page 4)
     */
    async getAllBranches(includeSections = false): Promise<IBranch[]> {
        const params = includeSections
            ? { [API_PARAM_INCLUDE_0]: API_INCLUDE_SECTIONS, [API_PARAM_INCLUDE_1]: API_INCLUDE_SECTIONS_TABLES }
            : {};

        // Fetch first page (API enforces 50 items per page)
        const firstResponse: AxiosResponse<IFoodicsPaginatedResponse<IBranch[]>> =
            await httpClient.get<IFoodicsPaginatedResponse<IBranch[]>>(API_ENDPOINT_BRANCHES, { params });

        const { data: firstPageData, meta, links } = firstResponse.data;

        // If no next page, return first page data
        const nextPageUrl = links?.next;
        if (!nextPageUrl) {
            return firstPageData;
        }

        // Calculate total pages from metadata
        const totalPages = calculateTotalPages(meta);

        // Use parallel fetching if we know total pages (faster)
        const canUseParallelFetch = totalPages !== undefined && totalPages > 1;
        if (canUseParallelFetch) {
            const remainingData = await fetchRemainingPagesInParallel(totalPages, params);
            return [...firstPageData, ...remainingData];
        }

        // Fallback: Sequential pagination
        return fetchRemainingPagesSequentially(firstPageData, nextPageUrl, params);
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
