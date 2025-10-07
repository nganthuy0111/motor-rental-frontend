import type { Customer } from "./customer";
import type { Vehicle } from "./vehicle";

export interface Booking {
  _id: string;
  // Backend may return just ObjectId string or populated object
  customer: string | Customer | null;
  // New structure: array of vehicles (ids or populated)
  vehicles?: Array<string | Vehicle>;
  // Legacy single vehicle (for backward compatibility in some parts of UI)
  vehicle?: Vehicle | null;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: "pending" | "active" | "completed" | "overdue";
  createdAt: string;
  updatedAt: string;
}
