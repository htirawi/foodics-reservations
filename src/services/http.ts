import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

import {
    API_BASE_URL,
    HTTP_CONTENT_TYPE_JSON,
    HTTP_AUTH_BEARER_PREFIX,
    HTTP_STATUS_UNAUTHORIZED,
    HTTP_STATUS_INTERNAL_SERVER_ERROR,
    ERROR_MSG_NETWORK_FALLBACK,
} from "@/constants";
import { useUIStore } from "@/stores/ui.store";
import type { IApiError } from "@/types/api";

function normalizeApiError(error: AxiosError<{
    message?: string;
    error?: string;
    code?: string;
}>): IApiError {
    const code = error.response?.data?.code;
    return {
        status: error.response?.status ?? HTTP_STATUS_INTERNAL_SERVER_ERROR,
        ...(code !== undefined ? { code } : {}),
        message: error.response?.data?.message ??
            error.response?.data?.error ??
            error.message ??
            ERROR_MSG_NETWORK_FALLBACK,
        details: error.response?.data,
    };
}

function handleUnauthorizedError(): void {
    const uiStore = useUIStore();
    uiStore.showAuthBanner({
        autoDismiss: true,
        onRetry: () => {
            uiStore.hideAuthBanner();
            window.location.reload();
        },
    });
}

const httpClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": HTTP_CONTENT_TYPE_JSON,
    },
});

httpClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = import.meta.env.VITE_FOODICS_TOKEN;
        if (token) {
            config.headers.Authorization = `${HTTP_AUTH_BEARER_PREFIX} ${token}`;
        }
        return config;
    },
    (error: AxiosError) => Promise.reject(error)
);

httpClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError<{ message?: string; error?: string; code?: string }>) => {
        const normalized = normalizeApiError(error);

        if (normalized.status === HTTP_STATUS_UNAUTHORIZED) {
            handleUnauthorizedError();
        }

        return Promise.reject(normalized);
    }
);
export { httpClient };
export type { IApiError as ApiError };
