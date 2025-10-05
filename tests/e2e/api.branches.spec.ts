/**
 * E2E API contract tests for branches endpoints
 * Validates response shapes and minimal required fields
 * 
 * Note: These tests hit the real Foodics API directly (not through Vite proxy)
 * Requires VITE_FOODICS_TOKEN and VITE_API_BASE_URL in .env.local
 * 
 * To skip these tests locally: npm run test:e2e -- --grep-invert "API Contract"
 */

import { test, expect } from '@playwright/test';
import type { Branch } from '@/types/foodics';

// API configuration from environment
const API_BASE = process.env.VITE_API_BASE_URL ?? 'https://api.foodics.dev/v5';
const AUTH_TOKEN = process.env.VITE_FOODICS_TOKEN;

// Skip all API contract tests if no token is configured
test.skip(!AUTH_TOKEN, 'Skipping API contract tests - VITE_FOODICS_TOKEN not set');

test.describe('Branches API Contract', () => {
  test.describe('GET /branches', () => {
    test('should return array of branches with correct shape', async ({ request }) => {
      const response = await request.get(`${API_BASE}/branches`, {
        headers: {
          Authorization: `Bearer ${AUTH_TOKEN}`,
        },
      });

      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);

      const body = await response.json();
      expect(body).toHaveProperty('data');
      expect(Array.isArray(body.data)).toBeTruthy();

      // If branches exist, validate structure
      if (body.data.length > 0) {
        const branch = body.data[0] as Branch;

        // Required string fields
        expect(typeof branch.id).toBe('string');
        expect(branch.id.length).toBeGreaterThan(0);
        expect(typeof branch.name).toBe('string');
        expect(typeof branch.reference).toBe('string');

        // Boolean fields
        expect(typeof branch.accepts_reservations).toBe('boolean');
        expect(typeof branch.receives_online_orders).toBe('boolean');

        // Number fields
        expect(typeof branch.type).toBe('number');
        expect(typeof branch.reservation_duration).toBe('number');
        expect(branch.reservation_duration).toBeGreaterThan(0);

        // Time fields
        expect(typeof branch.opening_from).toBe('string');
        expect(typeof branch.opening_to).toBe('string');

        // Timestamps
        expect(typeof branch.created_at).toBe('string');
        expect(typeof branch.updated_at).toBe('string');

        // Reservation times structure
        expect(branch.reservation_times).toBeDefined();
        expect(typeof branch.reservation_times).toBe('object');

        const weekdays = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
        weekdays.forEach((day) => {
          expect(branch.reservation_times[day as keyof typeof branch.reservation_times]).toBeDefined();
          expect(Array.isArray(branch.reservation_times[day as keyof typeof branch.reservation_times])).toBeTruthy();
        });

        // Sections are NOT included by default
        expect(branch.sections).toBeUndefined();
      }
    });

    test('should include sections when requested', async ({ request }) => {
      const response = await request.get(`${API_BASE}/branches?include=sections.tables`, {
        headers: {
          Authorization: `Bearer ${AUTH_TOKEN}`,
        },
      });

      expect(response.ok()).toBeTruthy();
      const body = await response.json();

      if (body.data.length > 0) {
        const branch = body.data[0] as Branch;
        
        // Sections should be included now
        expect(branch.sections).toBeDefined();
        expect(Array.isArray(branch.sections)).toBeTruthy();

        if (branch.sections && branch.sections.length > 0) {
          const section = branch.sections[0];
          if (section) {
            expect(typeof section.id).toBe('string');
            expect(typeof section.branch_id).toBe('string');
            expect(section.branch_id).toBe(branch.id);
            
            // Tables should be included
            expect(section.tables).toBeDefined();
            expect(Array.isArray(section.tables)).toBeTruthy();

            if (section.tables && section.tables.length > 0) {
              const table = section.tables[0];
              if (table) {
                expect(typeof table.id).toBe('string');
                expect(typeof table.section_id).toBe('string');
                expect(typeof table.accepts_reservations).toBe('boolean');
                expect(typeof table.seats).toBe('number');
                expect(typeof table.status).toBe('number');
              }
            }
          }
        }
      }
    });

    test('should require authentication', async ({ request }) => {
      const response = await request.get(`${API_BASE}/branches`, {
        headers: {
          Authorization: '', // No token
        },
      });

      // Should be unauthorized or forbidden
      expect([401, 403]).toContain(response.status());
    });
  });

  test.describe('PATCH /branches/:id', () => {
    test('should return 405 or 403 if PATCH is not allowed', async ({ request }) => {
      // Get a real branch ID first
      const listResponse = await request.get(`${API_BASE}/branches`, {
        headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
      });

      const listBody = await listResponse.json();
      
      if (listBody.data && listBody.data.length > 0) {
        const branchId = listBody.data[0].id;

        const response = await request.patch(`${API_BASE}/branches/${branchId}`, {
          headers: {
            Authorization: `Bearer ${AUTH_TOKEN}`,
            'Content-Type': 'application/json',
          },
          data: {
            accepts_reservations: true,
          },
        });

        // Foodics API may not allow PATCH operations depending on token permissions
        // 405 = Method Not Allowed, 403 = Forbidden
        expect([200, 201, 403, 405]).toContain(response.status());
      } else {
        test.skip();
      }
    });

    test('should require authentication for PATCH', async ({ request }) => {
      const response = await request.patch(`${API_BASE}/branches/some-id`, {
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          accepts_reservations: true,
        },
      });

      // Without auth, should be 401 or 403
      expect([401, 403, 405]).toContain(response.status());
    });
  });

  test.describe('Response Structure', () => {
    test('should wrap all responses in { data: T }', async ({ request }) => {
      const response = await request.get(`${API_BASE}/branches`, {
        headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
      });

      expect(response.ok()).toBeTruthy();
      const body = await response.json();

      // Foodics API wraps everything in { data: ... }
      expect(body).toHaveProperty('data');
      expect(body.data).toBeDefined();
    });
  });

  test.describe('Error Responses', () => {
    test('should return proper error on invalid endpoint', async ({ request }) => {
      const response = await request.get(`${API_BASE}/invalid-endpoint-12345`, {
        headers: {
          Authorization: `Bearer ${AUTH_TOKEN}`,
        },
      });

      expect(response.status()).toBeGreaterThanOrEqual(400);
      
      // Try to parse as JSON (error response)
      try {
        const body = await response.json();
        // Should have message or error field
        const hasErrorField = 'message' in body || 'error' in body;
        expect(hasErrorField).toBeTruthy();
      } catch (e) {
        // Some 404s might return HTML, that's also fine
        expect([404, 500]).toContain(response.status());
      }
    });
  });
});
