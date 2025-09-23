import type { Booking } from "../types/booking";
import api from "../api/axios";

export async function getBookings(
  signal?: AbortSignal
): Promise<Booking[]> {
  const res = await api.get<Booking[]>("/bookings", { signal });
  return res.data;
}

export type CreateBookingPayload = {
  customer: string;
  vehicle: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
};

export const createBooking = async (data: CreateBookingPayload): Promise<Booking> => {
  const res = await api.post("/bookings", data);
  return res.data;
};

// PUT update booking payload as per Swagger
export type UpdateBookingPayload = {
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: Booking["status"];
};

// id là path param, payload là body
export const updateBooking = async (id: string, data: UpdateBookingPayload): Promise<Booking> => {
  const res = await api.put(`/bookings/${id}`, data);
  return res.data;
};

// Delete a booking by id
export const deleteBooking = async (id: string): Promise<void> => {
  await api.delete(`/bookings/${id}`);
};