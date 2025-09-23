import type { Booking } from "../types/booking";
import api from "../api/axios";

export async function getBookings(
  signal?: AbortSignal
): Promise<Booking[]> {
  const res = await api.get<Booking[]>("/bookings", { signal });
  return res.data;
}
export const createBooking = async (data: Partial<Booking>): Promise<Booking> => {
  const res = await api.post("/bookings", data);
  return res.data;
};
