import api from "../api/axios";

export type LogStatus = "SUCCESS" | "FAIL";
export type LogEntry = {
  _id?: string;
  id?: string;
  actor?: string;
  action?: string;
  entity?: string;
  status?: LogStatus | string;
  message?: string;
  createdAt?: string; // ISO
  timestamp?: string; // ISO
  [key: string]: any;
};

export type GetLogsParams = {
  actor?: string;
  action?: string;
  entity?: string;
  status?: LogStatus;
  from?: string; // ISO
  to?: string;   // ISO
  page?: number;
  limit?: number;
};

export const LOGS_ENDPOINT = "/logs"; // change if your backend uses another path

export async function getLogs(params: GetLogsParams = {}, signal?: AbortSignal): Promise<{ data: LogEntry[]; page?: number; limit?: number; total?: number } | LogEntry[]> {
  const { page = 1, limit = 20, ...rest } = params;
  const res = await api.get(LOGS_ENDPOINT, { params: { page, limit, ...rest }, signal });
  // Some backends return array directly, some paginate.
  return res.data;
}
