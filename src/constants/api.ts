/**
 * @file api.ts
 * @summary API endpoints, query parameters, and include values
 * @remarks
 *   - Use these constants for all API service calls
 *   - Ensures consistent endpoint naming across the application
 * @example
 *   import { API_BASE_URL, API_ENDPOINT_BRANCHES } from '@/constants/api';
 *   httpClient.get(`${API_ENDPOINT_BRANCHES}`);
 */

// Base URL
export const API_BASE_URL = '/api';

// Endpoints
export const API_ENDPOINT_BRANCHES = '/branches';

// Query parameter keys
export const API_PARAM_INCLUDE_0 = 'include[0]';
export const API_PARAM_INCLUDE_1 = 'include[1]';

// Include values (for nested resource loading)
export const API_INCLUDE_SECTIONS = 'sections';
export const API_INCLUDE_SECTIONS_TABLES = 'sections.tables';
