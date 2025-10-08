/**
 * @file http.ts
 * @summary Module: src/services/http.ts
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */
import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import type { IApiError } from "@/types/api";
import { useUIStore } from "@/stores/ui.store";
const httpClient = axios.create({
    baseURL: "/api",
    headers: {
        "Content-Type": "application/json",
    },
});
httpClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = import.meta.env.VITE_FOODICS_TOKEN;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error: AxiosError) => Promise.reject(error));
httpClient.interceptors.response.use((response) => response, (error: AxiosError<{
    message?: string;
    error?: string;
    code?: string;
}>) => {
    const code = error.response?.data?.code;
    const normalized: IApiError = {
        status: error.response?.status ?? 500,
        ...(code !== undefined ? { code } : {}),
        message: error.response?.data?.message ??
            error.response?.data?.error ??
            error.message ??
            "Network error occurred",
        details: error.response?.data,
    };
    
    // Show auth banner for 401 errors with auto-dismiss and retry
    if (normalized.status === 401) {
        const uiStore = useUIStore();
        uiStore.showAuthBanner({
            autoDismiss: true,
            onRetry: () => {
                // Hide banner and reload page to retry authentication
                uiStore.hideAuthBanner();
                window.location.reload();
            },
        });
    }
    
    return Promise.reject(normalized);
});
export { httpClient };
export type { IApiError as ApiError };
