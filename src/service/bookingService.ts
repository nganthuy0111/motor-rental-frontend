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
