import type { Booking } from "../types/booking";
import api from "../api/axios";

export async function getBookings(
  signal?: AbortSignal
): Promise<Booking[]> {
  const res = await api.get<Booking[]>("/bookings", { signal });
  return res.data;
}

// Accept both legacy and new shapes; server expects vehicles: string[]
export type CreateBookingPayload = {
  customer: string;
  // legacy single vehicle id
  vehicle?: string;
  // new array of vehicle ids
  vehicles?: string[];
  startDate: string;
  endDate: string;
  totalPrice: number;
};

export const createBooking = async (data: CreateBookingPayload): Promise<Booking> => {
  const payload: any = {
    customer: data.customer,
    vehicles: Array.isArray(data.vehicles)
      ? data.vehicles
      : (data.vehicle ? [data.vehicle] : []),
    startDate: data.startDate,
    endDate: data.endDate,
    totalPrice: data.totalPrice,
  };
  const res = await api.post("/bookings", payload);
  return res.data;
};

// PUT update booking payload as per Swagger
export type UpdateBookingPayload = {
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: Booking["status"];
  // optional change of vehicles list
  vehicles?: string[];
  // legacy single vehicle for safety (will be normalized)
  vehicle?: string;
};

// id là path param, payload là body
export const updateBooking = async (id: string, data: UpdateBookingPayload): Promise<Booking> => {
  const payload: any = {
    startDate: data.startDate,
    endDate: data.endDate,
    totalPrice: data.totalPrice,
    status: data.status,
  };
  if (data.vehicles || data.vehicle) {
    payload.vehicles = Array.isArray(data.vehicles) ? data.vehicles : (data.vehicle ? [data.vehicle] : undefined);
  }
  const res = await api.put(`/bookings/${id}`, payload);
  return res.data;
};

// Delete a booking by id
export const deleteBooking = async (id: string): Promise<void> => {
  await api.delete(`/bookings/${id}`);
};