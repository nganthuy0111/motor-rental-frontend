import api from "../api/axios";
import type { PaginatedResponse, Customer } from "./../types/customer";

export async function getCustomers(
  params: { page?: number; limit?: number; search?: string },
  signal?: AbortSignal
): Promise<PaginatedResponse<Customer>> {
  const { page = 1, limit = 10, search = "" } = params;
  const res = await api.get<PaginatedResponse<Customer>>("/customers", {
    params: { page, limit, search },
    signal,
  });
  return res.data;
}
export async function createCustomer(data: FormData, signal?: AbortSignal) {
  return api.post("/customers", data, {
    headers: { "Content-Type": "multipart/form-data" },
    signal,
  });
}