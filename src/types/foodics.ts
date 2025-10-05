/**
 * Foodics domain types
 * All API entities and data structures for the Foodics reservations system
 */

/**
 * Days of the week as used by Foodics API
 * lowercase format required by backend
 */
export type Weekday =
  | 'saturday'
  | 'sunday'
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday';

/**
 * Time slot represented as [start, end] in "HH:mm" format (24-hour)
 * Example: ["09:00", "11:00"] represents 9 AM to 11 AM
 */
export type SlotTuple = [string, string];

/**
 * Weekly reservation time slots grouped by weekday
 * Each day maps to an array of available time slots
 * 
 * Example:
 * {
 *   saturday: [["09:00", "12:00"], ["18:00", "22:00"]],
 *   sunday: [["09:00", "12:00"]],
 *   monday: []
 * }
 */
export type ReservationTimes = Record<Weekday, SlotTuple[]>;

/**
 * Physical table entity within a branch section
 * Represents a bookable table in the restaurant
 */
export interface Table {
  id: string;
  name: string | null;
  section_id: string;
  accepts_reservations: boolean;
  seats: number;
  status: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

/**
 * Section (dining area) within a branch
 * Groups related tables together (e.g., "Terrace", "Main Dining")
 */
export interface Section {
  id: string;
  branch_id: string;
  name: string | null;
  name_localized: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  /** Only populated when using ?include=sections.tables */
  tables?: Table[];
}

/**
 * Branch entity representing a restaurant location
 * Contains reservation settings and optionally table layout
 * 
 * Note: sections is only populated when using ?include=sections or ?include=sections.tables
 */
export interface Branch {
  id: string;
  name: string;
  name_localized: string | null;
  reference: string;
  type: number;
  accepts_reservations: boolean;
  /** Reservation duration in minutes */
  reservation_duration: number;
  /** Weekly time slots when reservations are accepted */
  reservation_times: ReservationTimes;
  receives_online_orders: boolean;
  opening_from: string;
  opening_to: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  /** Only populated when using ?include=sections or ?include=sections.tables */
  sections?: Section[];
}

/**
 * Payload for updating branch reservation settings
 */
export interface UpdateBranchSettingsPayload {
  reservation_duration: number;
  reservation_times: ReservationTimes;
}
