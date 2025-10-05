/**
 * Unit tests for HTTP client
 * Tests interceptors, auth token injection, and error normalization
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import { httpClient } from '@/services/http';
import type { ApiError } from '@/types/api';

describe('HTTP Client', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(httpClient);
    // Reset env mock before each test
    vi.stubEnv('VITE_FOODICS_TOKEN', 'test-token-123');
  });

  afterEach(() => {
    mock.restore();
    vi.unstubAllEnvs();
  });

  describe('Request Interceptor', () => {
    it('should inject Authorization header when token is present', async () => {
      mock.onGet('/test').reply((config) => {
        expect(config.headers?.Authorization).toBe('Bearer test-token-123');
        return [200, { data: 'success' }];
      });

      await httpClient.get('/test');
    });

    it('should proceed without Authorization header when token is missing', async () => {
      vi.stubEnv('VITE_FOODICS_TOKEN', '');

      mock.onGet('/test').reply((config) => {
        expect(config.headers?.Authorization).toBeUndefined();
        return [200, { data: 'success' }];
      });

      await httpClient.get('/test');
    });
  });

  describe('Response Interceptor - Success', () => {
    it('should return response data unchanged on success', async () => {
      const mockData = { id: '1', name: 'Test Branch' };
      mock.onGet('/branches').reply(200, { data: mockData });

      const response = await httpClient.get('/branches');
      expect(response.data).toEqual({ data: mockData });
    });
  });

  describe('Response Interceptor - Error Normalization', () => {
    it('should normalize API error with message field', async () => {
      mock.onGet('/branches').reply(404, { message: 'Branch not found' });

      await expect(httpClient.get('/branches')).rejects.toMatchObject({
        status: 404,
        message: 'Branch not found',
        details: { message: 'Branch not found' },
      } as ApiError);
    });

    it('should normalize API error with error field', async () => {
      mock.onGet('/branches').reply(400, { error: 'Invalid request' });

      await expect(httpClient.get('/branches')).rejects.toMatchObject({
        status: 400,
        message: 'Invalid request',
        details: { error: 'Invalid request' },
      } as ApiError);
    });

    it('should use axios error message as fallback', async () => {
      mock.onGet('/branches').reply(500, {});

      try {
        await httpClient.get('/branches');
      } catch (error) {
        const apiError = error as ApiError;
        expect(apiError.status).toBe(500);
        expect(apiError.message).toBeDefined();
        expect(typeof apiError.message).toBe('string');
      }
    });

    it('should handle network errors with status 500', async () => {
      mock.onGet('/branches').networkError();

      try {
        await httpClient.get('/branches');
      } catch (error) {
        const apiError = error as ApiError;
        expect(apiError.status).toBe(500);
        expect(apiError.message).toBeDefined();
      }
    });

    it('should handle timeout errors', async () => {
      mock.onGet('/branches').timeout();

      try {
        await httpClient.get('/branches');
      } catch (error) {
        const apiError = error as ApiError;
        expect(apiError.status).toBe(500);
        expect(apiError.message).toContain('timeout');
      }
    });

    it('should preserve error details for debugging', async () => {
      const errorPayload = {
        message: 'Validation failed',
        errors: { name: ['Name is required'] },
      };
      mock.onPost('/branches').reply(422, errorPayload);

      await expect(httpClient.post('/branches', {})).rejects.toMatchObject({
        status: 422,
        message: 'Validation failed',
        details: errorPayload,
      } as ApiError);
    });

    it('should handle errors without response data', async () => {
      mock.onGet('/branches').reply(503);

      try {
        await httpClient.get('/branches');
      } catch (error) {
        const apiError = error as ApiError;
        expect(apiError.status).toBe(503);
        expect(apiError.message).toBeDefined();
        expect(typeof apiError.message).toBe('string');
      }
    });
  });

  describe('Base Configuration', () => {
    it('should use /api as base URL', () => {
      expect(httpClient.defaults.baseURL).toBe('/api');
    });

    it('should set Content-Type to application/json', () => {
      expect(httpClient.defaults.headers['Content-Type']).toBe('application/json');
    });
  });
});
