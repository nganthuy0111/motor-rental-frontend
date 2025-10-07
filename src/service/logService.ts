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

// Prefer env override, fallback to a sensible default.
// Based on your backend stack trace (activityContext), the route is likely under /activity/logs
export const LOGS_ENDPOINT = (import.meta as any).env?.VITE_LOGS_ENDPOINT ?? "/activity-logs";

export async function getLogs(params: GetLogsParams = {}, signal?: AbortSignal): Promise<{ data: LogEntry[]; page?: number; limit?: number; total?: number } | LogEntry[]> {
  const { page = 1, limit = 20, ...rest } = params;
  const res = await api.get(LOGS_ENDPOINT, { params: { page, limit, ...rest }, signal });
  // Some backends return array directly, some paginate.
  return res.data;
}
