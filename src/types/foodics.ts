/**
 * @file foodics.ts
 * @summary Module: src/types/foodics.ts
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */
export type Weekday = "saturday" | "sunday" | "monday" | "tuesday" | "wednesday" | "thursday" | "friday";
export type SlotTuple = [
    string,
    string
];
export type ReservationTimes = Record<Weekday, SlotTuple[]>;
export interface ITable {
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
export interface ISection {
    id: string;
    branch_id: string;
    name: string | null;
    name_localized: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    tables?: ITable[];
}
export interface IBranch {
    id: string;
    name: string;
    name_localized: string | null;
    reference: string;
    type: number;
    accepts_reservations: boolean;
    reservation_duration: number;
    reservation_times: ReservationTimes;
    receives_online_orders: boolean;
    opening_from: string;
    opening_to: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    sections?: ISection[];
}
export interface IUpdateBranchSettingsPayload {
    reservation_duration: number;
    reservation_times: ReservationTimes;
}

// Backward-compatibility aliases (preserve public API while migrating to I* interfaces)
export type Table = ITable;
export type Section = ISection;
export type Branch = IBranch;
export type UpdateBranchSettingsPayload = IUpdateBranchSettingsPayload;
