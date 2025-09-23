import type { Customer } from "./customer";
import type { Vehicle } from "./vehicle";

export interface Booking {
  _id: string;
  customer: Customer | null;
  vehicle: Vehicle | null;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: "pending" | "active" | "completed" | "overdue";
  createdAt: string;
  updatedAt: string;
}
