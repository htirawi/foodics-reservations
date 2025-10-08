/**
 * @file branches.ts
 * @summary Mock branch data for testing
 * @description
 *   Provides realistic branch data for MSW mocks and unit tests.
 */

import type { IBranch, ISection, ITable, ReservationTimes } from '@/types/foodics'

/**
 * Sample reservation times (12:00 - 22:00)
 */
const defaultReservationTimes: ReservationTimes = {
  monday: [['12:00', '22:00']],
  tuesday: [['12:00', '22:00']],
  wednesday: [['12:00', '22:00']],
  thursday: [['12:00', '22:00']],
  friday: [['12:00', '23:00']],
  saturday: [['10:00', '23:00']],
  sunday: [['10:00', '22:00']],
}

/**
 * Sample tables
 */
const createTables = (count: number, sectionId: string): ITable[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `table-${sectionId}-${i + 1}`,
    name: `Table ${i + 1}`,
    section_id: sectionId,
    accepts_reservations: Math.random() > 0.3, // 70% accept reservations
    seats: Math.floor(Math.random() * 4) + 2, // 2-6 people
    status: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
  }))
}

/**
 * Sample sections
 */
const createSections = (branchId: string): ISection[] => {
  const sections: ISection[] = [
    {
      id: `section-${branchId}-1`,
      branch_id: branchId,
      name: 'Indoor',
      name_localized: 'Indoor',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
      tables: createTables(5, `section-${branchId}-1`),
    },
    {
      id: `section-${branchId}-2`,
      branch_id: branchId,
      name: 'Outdoor',
      name_localized: 'Outdoor',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
      tables: createTables(3, `section-${branchId}-2`),
    },
  ]
  return sections
}

/**
 * Basic branch data (without sections)
 */
export const basicBranches: IBranch[] = [
  {
    id: 'branch-1',
    name: 'Downtown Branch',
    name_localized: 'Downtown Branch',
    reference: 'DT-001',
    type: 1,
    accepts_reservations: true,
    reservation_duration: 120,
    reservation_times: defaultReservationTimes,
    receives_online_orders: true,
    opening_from: '09:00',
    opening_to: '23:00',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
    sections: [],
  },
  {
    id: 'branch-2',
    name: 'Mall Branch',
    name_localized: 'Mall Branch',
    reference: 'ML-002',
    type: 1,
    accepts_reservations: true,
    reservation_duration: 90,
    reservation_times: defaultReservationTimes,
    receives_online_orders: true,
    opening_from: '10:00',
    opening_to: '22:00',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
    sections: [],
  },
  {
    id: 'branch-3',
    name: 'Airport Branch',
    name_localized: 'Airport Branch',
    reference: 'AP-003',
    type: 1,
    accepts_reservations: false,
    reservation_duration: 60,
    reservation_times: defaultReservationTimes,
    receives_online_orders: true,
    opening_from: '06:00',
    opening_to: '23:00',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
    sections: [],
  },
  {
    id: 'branch-4',
    name: 'Beach Branch',
    name_localized: 'Beach Branch',
    reference: 'BC-004',
    type: 1,
    accepts_reservations: true,
    reservation_duration: 120,
    reservation_times: defaultReservationTimes,
    receives_online_orders: true,
    opening_from: '08:00',
    opening_to: '22:00',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
    sections: [],
  },
  {
    id: 'branch-5',
    name: 'City Center',
    name_localized: 'City Center',
    reference: 'CC-005',
    type: 1,
    accepts_reservations: false,
    reservation_duration: 90,
    reservation_times: defaultReservationTimes,
    receives_online_orders: true,
    opening_from: '09:00',
    opening_to: '21:00',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
    sections: [],
  },
]

/**
 * Branches with sections and tables
 */
export const branchesWithSections: IBranch[] = basicBranches.map((branch) => ({
  ...branch,
  sections: createSections(branch.id),
}))

/**
 * Export both versions
 */
export const mockBranches = {
  basic: basicBranches,
  withSections: branchesWithSections,
}

/**
 * Helper: Get single branch by ID
 */
export const getBranchById = (id: string): IBranch | undefined => {
  return branchesWithSections.find((b) => b.id === id)
}

/**
 * Helper: Get enabled branches
 */
export const getEnabledBranches = (): IBranch[] => {
  return branchesWithSections.filter((b) => b.accepts_reservations)
}

/**
 * Helper: Get disabled branches
 */
export const getDisabledBranches = (): IBranch[] => {
  return branchesWithSections.filter((b) => !b.accepts_reservations)
}
