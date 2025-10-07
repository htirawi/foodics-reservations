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
}>) => {
    const normalized: IApiError = {
        status: error.response?.status ?? 500,
        message: error.response?.data?.message ??
            error.response?.data?.error ??
            error.message ??
            "Network error occurred",
        details: error.response?.data,
    };
    return Promise.reject(normalized);
});
export { httpClient };
export type { IApiError as ApiError };
