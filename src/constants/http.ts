/**
 * @file http.ts
 * @summary HTTP headers, status codes, and authentication constants
 * @remarks
 *   - Centralized HTTP protocol constants for API communication
 *   - Use for axios interceptors, error handling, and request configuration
 * @example
 *   import { HTTP_STATUS_UNAUTHORIZED, HTTP_AUTH_BEARER_PREFIX } from '@/constants/http';
 *   if (error.status === HTTP_STATUS_UNAUTHORIZED) { ... }
 */

// HTTP Headers
export const HTTP_HEADER_CONTENT_TYPE = 'Content-Type';
export const HTTP_HEADER_AUTHORIZATION = 'Authorization';

// Content Types
export const HTTP_CONTENT_TYPE_JSON = 'application/json';

// Authentication
export const HTTP_AUTH_BEARER_PREFIX = 'Bearer';

// HTTP Status Codes
export const HTTP_STATUS_BAD_REQUEST = 400;
export const HTTP_STATUS_UNAUTHORIZED = 401;
export const HTTP_STATUS_INTERNAL_SERVER_ERROR = 500;

// Status code ranges (for error categorization)
export const HTTP_STATUS_CLIENT_ERROR_MIN = 400;
export const HTTP_STATUS_CLIENT_ERROR_MAX = 499;
export const HTTP_STATUS_SERVER_ERROR_MIN = 500;
export const HTTP_STATUS_SERVER_ERROR_MAX = 599;
