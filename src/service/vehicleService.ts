import api from "../api/axios";
import type { Vehicle } from "../types/vehicle";
import type { PaginatedResponse } from "../types/customer";

export async function getVehicles(
  params: { page?: number; limit?: number; search?: string },
  signal?: AbortSignal
): Promise<PaginatedResponse<Vehicle>> {
  const { page = 1, limit = 10, search = "" } = params;
  const res = await api.get<PaginatedResponse<Vehicle>>("/vehicles", {
    params: { page, limit, search },
    signal,
  });
  return res.data;
}
