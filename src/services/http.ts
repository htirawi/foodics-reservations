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
import {
    API_BASE_URL,
    HTTP_CONTENT_TYPE_JSON,
    HTTP_AUTH_BEARER_PREFIX,
    HTTP_STATUS_UNAUTHORIZED,
    HTTP_STATUS_INTERNAL_SERVER_ERROR,
    ERROR_MSG_NETWORK_FALLBACK,
} from "@/constants";

const httpClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": HTTP_CONTENT_TYPE_JSON,
    },
});
httpClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = import.meta.env.VITE_FOODICS_TOKEN;
    if (token) {
        config.headers.Authorization = `${HTTP_AUTH_BEARER_PREFIX} ${token}`;
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
        status: error.response?.status ?? HTTP_STATUS_INTERNAL_SERVER_ERROR,
        ...(code !== undefined ? { code } : {}),
        message: error.response?.data?.message ??
            error.response?.data?.error ??
            error.message ??
            ERROR_MSG_NETWORK_FALLBACK,
        details: error.response?.data,
    };

    // Show auth banner for 401 errors with auto-dismiss and retry
    if (normalized.status === HTTP_STATUS_UNAUTHORIZED) {
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
