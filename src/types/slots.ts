import type { Weekday } from "./foodics";

/**
 * Parameters for updating a slot field.
 */
export interface ISlotUpdateParams {
  day: Weekday;
  index: number;
  field: "from" | "to";
  value: string;
}
