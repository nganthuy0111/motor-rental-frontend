import { useEffect, useMemo, useRef, useState } from "react";
import { getLogs, type GetLogsParams, type LogEntry } from "../../service/logService";
import "../../styles/management.css";

const ActivityLog = () => {
  const [params, setParams] = useState<GetLogsParams>({ page: 1, limit: 20 });
  const [fromLocal, setFromLocal] = useState<string>("");
  const [toLocal, setToLocal] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [data, setData] = useState<LogEntry[]>([]);
  const [total, setTotal] = useState<number | undefined>(undefined);

  const controllerRef = useRef<AbortController | null>(null);

  const fetchLogs = async (override?: Partial<GetLogsParams>) => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setLoading(true);
    setError("");
    try {
      const merged: GetLogsParams = { ...params, ...override };
      // Convert local inputs to ISO
      const isoFrom = fromLocal ? new Date(fromLocal).toISOString() : undefined;
      const isoTo = toLocal ? new Date(toLocal).toISOString() : undefined;
      const res = await getLogs({ ...merged, from: isoFrom, to: isoTo }, controller.signal);
      if (Array.isArray(res)) {
        setData(res as LogEntry[]);
        setTotal(undefined);
      } else {
        const anyRes = res as any;
        const items = anyRes.items ?? anyRes.data ?? [];
        setData(items as LogEntry[]);
        setTotal(anyRes.total ?? anyRes.pagination?.total ?? (Array.isArray(items) ? items.length : undefined));
      }
      setParams((prev) => ({ ...prev, ...override }));
    } catch (e: any) {
      if (e?.name === "CanceledError") return;
      setError(e?.message || "Tải log thất bại");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pages = useMemo(() => {
    if (!total || !params.limit) return undefined;
    return Math.max(1, Math.ceil(total / params.limit));
  }, [total, params.limit]);

  return (
    <div className="mgmt-page">
      <h1 className="mgmt-title">Log hoạt động</h1>

      <div className="bg-gray-100 rounded-lg p-4 mb-6 border border-gray-200 grid grid-cols-1 md:grid-cols-4 gap-3">
        <input className="bg-white text-gray-900 border border-gray-300 rounded px-3 py-2" placeholder="actor" value={params.actor || ""} onChange={(e)=> setParams(p=>({ ...p, actor: e.target.value }))} />
        <input className="bg-white text-gray-900 border border-gray-300 rounded px-3 py-2" placeholder="action (CREATE/UPDATE/DELETE...)" value={params.action || ""} onChange={(e)=> setParams(p=>({ ...p, action: e.target.value }))} />
        <input className="bg-white text-gray-900 border border-gray-300 rounded px-3 py-2" placeholder="entity (Booking/Vehicle/...)" value={params.entity || ""} onChange={(e)=> setParams(p=>({ ...p, entity: e.target.value }))} />
        <select className="bg-white text-gray-900 border border-gray-300 rounded px-3 py-2" value={params.status || ""} onChange={(e)=> setParams(p=>({ ...p, status: (e.target.value || undefined) as any }))}>
          <option value="">Trạng thái</option>
          <option value="SUCCESS">SUCCESS</option>
          <option value="FAIL">FAIL</option>
        </select>
        <div className="flex flex-col">
          <label className="text-xs text-gray-500 mb-1">Từ (local)</label>
          <input type="datetime-local" className="bg-white text-gray-900 border border-gray-300 rounded px-3 py-2" value={fromLocal} onChange={(e)=> setFromLocal(e.target.value)} />
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-gray-500 mb-1">Đến (local)</label>
          <input type="datetime-local" className="bg-white text-gray-900 border border-gray-300 rounded px-3 py-2" value={toLocal} onChange={(e)=> setToLocal(e.target.value)} />
        </div>
        <div className="flex items-center gap-2">
          <input type="number" className="bg-white text-gray-900 border border-gray-300 rounded px-3 py-2 w-24" placeholder="page" value={params.page || 1} min={1} onChange={(e)=> setParams(p=>({ ...p, page: Number(e.target.value)||1 }))} />
          <input type="number" className="bg-white text-gray-900 border border-gray-300 rounded px-3 py-2 w-24" placeholder="limit" value={params.limit || 20} min={1} onChange={(e)=> setParams(p=>({ ...p, limit: Number(e.target.value)||20 }))} />
        </div>
        <div className="flex items-center gap-2">
          <button className="mgmt-btn primary" onClick={()=> fetchLogs({ page: 1 })} disabled={loading}>Tìm</button>
          <button className="mgmt-btn secondary" onClick={()=> { setParams({ page: 1, limit: 20 }); setFromLocal(""); setToLocal(""); fetchLogs({ page: 1, limit: 20, actor: undefined, action: undefined, entity: undefined, status: undefined, from: undefined, to: undefined }); }}>Xóa lọc</button>
        </div>
      </div>

      {error && <div className="text-red-500 text-sm mb-2">{error}</div>}

      <div className="mgmt-table-wrapper">
        <table className="mgmt-table">
          <thead>
            <tr>
              <th>Thời gian</th>
              <th>Actor</th>
              <th>Hành động</th>
              <th>Entity</th>
              <th>Trạng thái</th>
              <th>Thông tin</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-6">Đang tải...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-6">Không có log</td></tr>
            ) : (
              data.map((log, idx) => {
                const time = (log.createdAt || log.timestamp) ? new Date(log.createdAt || (log as any).timestamp).toLocaleString() : "";
                const statusBadge = log.status === "SUCCESS" ? "completed" : log.status === "FAIL" ? "overdue" : "pending";
                return (
                  <tr key={(log._id || log.id || idx) as any} className="border-b border-gray-200">
                    <td>{time}</td>
                    <td>{log.actor || ""}</td>
                    <td>{log.action || ""}</td>
                    <td>{log.entity || ""}</td>
                    <td><span className={`mgmt-badge ${statusBadge}`}>{log.status || ""}</span></td>
                    <td className="text-xs text-gray-600">
                      {log.message ? log.message : (log as any).details ? JSON.stringify((log as any).details) : ""}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {pages && pages > 1 && (
        <div className="mt-3 flex items-center gap-2">
          <button className="mgmt-btn secondary" disabled={loading || (params.page||1) <= 1} onClick={()=> fetchLogs({ page: Math.max(1, (params.page||1)-1) })}>Trước</button>
          <div className="text-sm">Trang {(params.page||1)} / {pages}</div>
          <button className="mgmt-btn secondary" disabled={loading || (params.page||1) >= pages} onClick={()=> fetchLogs({ page: Math.min(pages, (params.page||1)+1) })}>Sau</button>
        </div>
      )}
    </div>
  );
};

export default ActivityLog;
