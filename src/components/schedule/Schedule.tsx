import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import type { View } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import api from "../../api/axios";

type CalendarEvent = {
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  id?: string;
};

const localizer = momentLocalizer(moment);

const Schedule: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [currentView, setCurrentView] = useState<View>("month");
  const [detail, setDetail] = useState<CalendarEvent | null>(null);
  const supportedViews: View[] = ["month", "week", "day", "agenda"];

  const fetchEvents = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/bookings");
      const data = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
      const formatted = data.map((b: any) => ({
        id: b._id,
        title: `Xe: ${b.vehicle?.licensePlate || ""} - ${b.vehicle?.brand || ""} - ${b.customer?.name || ""}`,
        start: new Date(b.startDate),
        end: new Date(b.endDate),
      }));
      setEvents(formatted);
    } catch (err: any) {
      setError(err?.message || "Tải lịch thất bại");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Custom toolbar to ensure all buttons work and are visible
  const Toolbar: React.FC<any> = (toolbarProps) => {
    const { label } = toolbarProps;
    return (
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <button className="mgmt-btn secondary" onClick={() => toolbarProps.onNavigate("TODAY")}>Hôm nay</button>
          <button className="mgmt-btn secondary" onClick={() => toolbarProps.onNavigate("PREV")}>Trước</button>
          <button className="mgmt-btn secondary" onClick={() => toolbarProps.onNavigate("NEXT")}>Sau</button>
          <span className="ml-2 font-semibold">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <button className={`mgmt-btn ${currentView === "month" ? "primary" : "secondary"}`} onClick={() => toolbarProps.onView("month")}>Tháng</button>
          <button className={`mgmt-btn ${currentView === "week" ? "primary" : "secondary"}`} onClick={() => toolbarProps.onView("week")}>Tuần</button>
          <button className={`mgmt-btn ${currentView === "day" ? "primary" : "secondary"}`} onClick={() => toolbarProps.onView("day")}>Ngày</button>
          <button className={`mgmt-btn ${currentView === "agenda" ? "primary" : "secondary"}`} onClick={() => toolbarProps.onView("agenda")}>Agenda</button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col" style={{ height: "80vh" }}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold">Lịch đặt xe</h2>
        <div className="flex items-center gap-2">
          <button className="mgmt-btn secondary" onClick={fetchEvents} disabled={loading}>
            {loading ? "Đang tải..." : "Làm mới"}
          </button>
        </div>
      </div>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <div style={{ height: "100%" }}>
        <Calendar
          localizer={localizer}
          events={events}
          date={currentDate}
          onNavigate={(date) => setCurrentDate(date)}
          view={currentView}
          onView={(v) => {
            if (supportedViews.includes(v as View)) {
              setCurrentView(v as View);
            }
          }}
          startAccessor="start"
          endAccessor="end"
          components={{ toolbar: Toolbar }}
          views={supportedViews}
          selectable
          popup
          style={{ height: "100%" }}
          onSelectEvent={(e: CalendarEvent) => setDetail(e)}
        />
      </div>
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0" style={{ background: '#666666', opacity: 0.2 }}></div>
          <div className="relative bg-white text-gray-900 rounded-lg p-6 w-full max-w-lg shadow-lg border border-gray-200 z-10 animate-fade-in">
            <button className="absolute top-3 right-4 text-gray-400 hover:text-red-400 text-2xl" onClick={() => setDetail(null)}>&times;</button>
            <h3 className="text-xl font-bold mb-3">Chi tiết sự kiện</h3>
            <div className="space-y-2">
              <div><span className="font-semibold">Tiêu đề:</span> {detail.title}</div>
              <div><span className="font-semibold">Bắt đầu:</span> {detail.start.toLocaleString()}</div>
              <div><span className="font-semibold">Kết thúc:</span> {detail.end.toLocaleString()}</div>
            </div>
            <div className="flex justify-end mt-4">
              <button className="px-5 py-2 rounded bg-red-600 text-white hover:bg-red-700" onClick={() => setDetail(null)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Schedule;
