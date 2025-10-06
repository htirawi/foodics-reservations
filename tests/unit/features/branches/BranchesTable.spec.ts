/**
 * Unit tests for BranchesTable.vue
 * Tests presentational table rendering and user interactions
 */

import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import BranchesTable from '@/features/branches/components/BranchesTable.vue';
import type { Branch } from '@/types/foodics';
import { createI18n } from 'vue-i18n';

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      reservations: {
        table: {
          branch: 'Branch',
          reference: 'Reference',
          tablesCount: 'Number of Tables',
          duration: 'Reservation Duration',
        },
        duration: {
          minutes: '{count} Minutes',
        },
      },
    },
  },
});

const mockBranches: Branch[] = [
  {
    id: '1',
    name: 'Branch 1',
    name_localized: null,
    reference: 'B01',
    type: 1,
    accepts_reservations: true,
    reservation_duration: 30,
    reservation_times: {
      saturday: [],
      sunday: [],
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
    },
    receives_online_orders: false,
    opening_from: '09:00',
    opening_to: '22:00',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    deleted_at: null,
  },
  {
    id: '2',
    name: 'Branch 2',
    name_localized: null,
    reference: 'B02',
    type: 1,
    accepts_reservations: true,
    reservation_duration: 60,
    reservation_times: {
      saturday: [],
      sunday: [],
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
    },
    receives_online_orders: false,
    opening_from: '09:00',
    opening_to: '22:00',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    deleted_at: null,
  },
];

const mockReservableCount = vi.fn((branch: Branch) => {
  if (branch.id === '1') return 5;
  if (branch.id === '2') return 8;
  return 0;
});

describe('BranchesTable', () => {
  it('renders table with correct headers', () => {
    const wrapper = mount(BranchesTable, {
      global: { plugins: [i18n] },
      props: {
        branches: [],
        reservableCount: mockReservableCount,
      },
    });

    const headers = wrapper.findAll('th');
    expect(headers).toHaveLength(4);
    expect(headers[0]?.text()).toBe('Branch');
    expect(headers[1]?.text()).toBe('Reference');
    expect(headers[2]?.text()).toBe('Number of Tables');
    expect(headers[3]?.text()).toBe('Reservation Duration');
  });

  it('renders correct number of rows for branches', () => {
    const wrapper = mount(BranchesTable, {
      global: { plugins: [i18n] },
      props: {
        branches: mockBranches,
        reservableCount: mockReservableCount,
      },
    });

    const rows = wrapper.findAll('tbody tr');
    expect(rows).toHaveLength(2);
  });

  it('displays branch data correctly in each row', () => {
    const wrapper = mount(BranchesTable, {
      global: { plugins: [i18n] },
      props: {
        branches: mockBranches,
        reservableCount: mockReservableCount,
      },
    });

    const firstRow = wrapper.findAll('tbody tr')[0];
    const cells = firstRow?.findAll('td');
    
    expect(cells?.[0]?.text()).toBe('Branch 1');
    expect(cells?.[1]?.text()).toBe('B01');
    expect(cells?.[2]?.text()).toBe('5');
    expect(cells?.[3]?.text()).toBe('30 Minutes');
  });

  it('calls reservableCount function for each branch', () => {
    mockReservableCount.mockClear();
    
    mount(BranchesTable, {
      global: { plugins: [i18n] },
      props: {
        branches: mockBranches,
        reservableCount: mockReservableCount,
      },
    });

    expect(mockReservableCount).toHaveBeenCalledTimes(2);
    expect(mockReservableCount).toHaveBeenCalledWith(mockBranches[0]);
    expect(mockReservableCount).toHaveBeenCalledWith(mockBranches[1]);
  });

  it('emits open-settings event when row is clicked', async () => {
    const wrapper = mount(BranchesTable, {
      global: { plugins: [i18n] },
      props: {
        branches: mockBranches,
        reservableCount: mockReservableCount,
      },
    });

    const firstRow = wrapper.findAll('tbody tr')[0];
    await firstRow?.trigger('click');

    expect(wrapper.emitted('open-settings')).toBeTruthy();
    expect(wrapper.emitted('open-settings')?.[0]).toEqual(['1']);
  });

  it('emits open-settings event when Enter key is pressed on row', async () => {
    const wrapper = mount(BranchesTable, {
      global: { plugins: [i18n] },
      props: {
        branches: mockBranches,
        reservableCount: mockReservableCount,
      },
    });

    const firstRow = wrapper.findAll('tbody tr')[0];
    await firstRow?.trigger('keydown.enter');

    expect(wrapper.emitted('open-settings')).toBeTruthy();
    expect(wrapper.emitted('open-settings')?.[0]).toEqual(['1']);
  });

  it('emits open-settings event when Space key is pressed on row', async () => {
    const wrapper = mount(BranchesTable, {
      global: { plugins: [i18n] },
      props: {
        branches: mockBranches,
        reservableCount: mockReservableCount,
      },
    });

    const firstRow = wrapper.findAll('tbody tr')[0];
    await firstRow?.trigger('keydown.space');

    expect(wrapper.emitted('open-settings')).toBeTruthy();
    expect(wrapper.emitted('open-settings')?.[0]).toEqual(['1']);
  });

  it('has correct accessibility attributes for table', () => {
    const wrapper = mount(BranchesTable, {
      global: { plugins: [i18n] },
      props: {
        branches: mockBranches,
        reservableCount: mockReservableCount,
      },
    });

    const headers = wrapper.findAll('th');
    headers.forEach((header) => {
      expect(header.attributes('scope')).toBe('col');
    });
  });

  it('has correct accessibility attributes for interactive rows', () => {
    const wrapper = mount(BranchesTable, {
      global: { plugins: [i18n] },
      props: {
        branches: mockBranches,
        reservableCount: mockReservableCount,
      },
    });

    const rows = wrapper.findAll('tbody tr');
    rows.forEach((row) => {
      expect(row.attributes('role')).toBe('button');
      expect(row.attributes('tabindex')).toBe('0');
    });
  });

  it('includes test ids for e2e testing', () => {
    const wrapper = mount(BranchesTable, {
      global: { plugins: [i18n] },
      props: {
        branches: mockBranches,
        reservableCount: mockReservableCount,
      },
    });

    expect(wrapper.find('[data-test-id="branches-table"]').exists()).toBe(true);
    expect(wrapper.find('[data-test-id="branch-row-1"]').exists()).toBe(true);
    expect(wrapper.find('[data-test-id="branch-row-2"]').exists()).toBe(true);
  });

  it('renders empty tbody when no branches', () => {
    const wrapper = mount(BranchesTable, {
      global: { plugins: [i18n] },
      props: {
        branches: [],
        reservableCount: mockReservableCount,
      },
    });

    const rows = wrapper.findAll('tbody tr');
    expect(rows).toHaveLength(0);
  });
});

