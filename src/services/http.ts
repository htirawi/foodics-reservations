/**
 * Centralized Axios HTTP client
 * Handles authentication, error normalization, and base configuration
 */

import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { ApiError } from '@/types/api';

/**
 * Configured Axios instance with interceptors
 */
const httpClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor: inject bearer token from env
 */
httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = import.meta.env.VITE_FOODICS_TOKEN;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

/**
 * Response interceptor: normalize all errors into ApiError shape
 */
httpClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; error?: string }>) => {
    const normalized: ApiError = {
      status: error.response?.status ?? 500,
      message:
        error.response?.data?.message ??
        error.response?.data?.error ??
        error.message ??
        'Network error occurred',
      details: error.response?.data,
    };

    return Promise.reject(normalized);
  }
);

export { httpClient };
export type { ApiError };
