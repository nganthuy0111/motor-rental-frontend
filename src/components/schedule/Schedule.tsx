import React, { useEffect, useMemo, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import resourceTimelinePlugin from "@fullcalendar/resource-timeline";
import interactionPlugin from "@fullcalendar/interaction";
import { getVehicles } from "../../service/vehicleService";
import { getBookings } from "../../service/bookingService";
import type { Vehicle } from "../../types/vehicle";
import type { Booking } from "../../types/booking";
import "./Schedule.css";

type FCEvent = {
  id: string;
  title: string; // customer name + phone
  start: string; // ISO
  end: string;   // ISO
  resourceId: string; // vehicleId
  extendedProps: {
    status?: Booking["status"];
    totalPrice?: number;
    vehicleId: string;
  };
};

function Schedule() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [events, setEvents] = useState<FCEvent[]>([]);
  const [view, setView] = useState("resourceTimelineWeek");
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());
  const [selectedStatuses, setSelectedStatuses] = useState<Set<string>>(new Set(["pending","active","completed","overdue","canceled"]));
  const [search, setSearch] = useState("");


  const calendarRef = useRef<FullCalendar | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const vRes = await getVehicles({ page: 1, limit: 1000, search: "" }, controller.signal);
        const vList = (vRes as any)?.data ?? vRes;
        const vArr: Vehicle[] = Array.isArray(vList) ? vList : vList?.data ?? [];
        setVehicles(vArr);
        setSelectedTypes(new Set(vArr.map(v => v.type || "Khác")));

        const bArr = await getBookings(controller.signal);
        const mapped: FCEvent[] = (bArr || []).flatMap((b: any) => {
          const start = new Date(b.startDate).toISOString();
          const end = new Date(b.endDate).toISOString();
          const custName = (b as any).customer?.name || "Khách";
          const custPhone = (b as any).customer?.phone ? ` (${(b as any).customer.phone})` : "";
          const title = `${custName}${custPhone}`;
          const vehIds: string[] = Array.isArray(b.vehicles)
            ? b.vehicles.map((x: any) => typeof x === "string" ? x : x?._id).filter(Boolean)
            : (b.vehicle?._id ? [b.vehicle._id] : []);
          return vehIds.map((vid: string, i: number) => ({
            id: `${b._id}-${i}`,
            title,
            start,
            end,
            resourceId: vid,
            extendedProps: { status: b.status, totalPrice: b.totalPrice, vehicleId: vid },
          }));
        });
        setEvents(mapped);
      } finally {
        // no-op
      }
    })();
    return () => controller.abort();
  }, []);

  const typeOptions = useMemo(() => Array.from(new Set(vehicles.map(v => v.type || "Khác"))).sort(), [vehicles]);
  const filteredResources = useMemo(() => {
    const q = search.trim().toLowerCase();
    return vehicles
      .filter(v => selectedTypes.has(v.type || "Khác"))
      .filter(v => q ? v.licensePlate.toLowerCase().includes(q) : true)
      .map(v => ({ id: v._id, title: v.licensePlate }));
  }, [vehicles, selectedTypes, search]);

  const filteredEvents = useMemo(() => {
    const q = search.trim().toLowerCase();
    return events
      .filter(e => !e.extendedProps.status || selectedStatuses.has(e.extendedProps.status))
      .filter(e => {
        if (!q) return true;
        const plate = vehicles.find(v => v._id === e.extendedProps.vehicleId)?.licensePlate?.toLowerCase?.() || "";
        return plate.includes(q) || e.title.toLowerCase().includes(q);
      });
  }, [events, selectedStatuses, search, vehicles]);

  const eventDidMount = (info: any) => {
    const { title, start, end, extendedProps } = info.event;
    const s = new Date(start).toLocaleString();
    const ed = new Date(end).toLocaleString();
    const price = extendedProps?.totalPrice ? `\nGiá: ${Number(extendedProps.totalPrice).toLocaleString("vi-VN")} VND` : "";
    info.el.title = `${title}\n${s} → ${ed}${price}`;
  };

  return (
    <div className="flex flex-col gap-2" style={{ height: "80vh" }}>
      <div className="flex items-center gap-2">
        <button className="mgmt-btn secondary" onClick={() => calendarRef.current?.getApi().today()}>Hôm nay</button>
        <button className="mgmt-btn secondary" onClick={() => calendarRef.current?.getApi().prev()}>Trước</button>
        <button className="mgmt-btn secondary" onClick={() => calendarRef.current?.getApi().next()}>Sau</button>
        <div className="ml-2 flex items-center gap-2">
          <button className={`mgmt-btn ${view === "resourceTimelineDay" ? "primary" : "secondary"}`} onClick={() => setView("resourceTimelineDay")}>Ngày</button>
          <button className={`mgmt-btn ${view === "resourceTimelineWeek" ? "primary" : "secondary"}`} onClick={() => setView("resourceTimelineWeek")}>Tuần</button>
          <button className={`mgmt-btn ${view === "resourceTimelineMonth" ? "primary" : "secondary"}`} onClick={() => setView("resourceTimelineMonth")}>Tháng</button>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <input
            className="bg-white text-gray-900 border border-gray-300 rounded px-3 py-2"
            placeholder="Tìm biển số hoặc khách hàng..."
            value={search}
            onChange={(e)=> setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Loại xe:</span>
          {typeOptions.map(t => (
            <label key={t} className="flex items-center gap-1 text-sm">
              <input type="checkbox" checked={selectedTypes.has(t)} onChange={(e)=>{
                setSelectedTypes(prev => { const n=new Set(prev); e.target.checked?n.add(t):n.delete(t); return n; });
              }} />
              <span>{t}</span>
            </label>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Trạng thái:</span>
          {["pending","active","completed","overdue","canceled"].map(s => (
            <label key={s} className="flex items-center gap-1 text-sm">
              <input type="checkbox" checked={selectedStatuses.has(s)} onChange={(e)=>{
                setSelectedStatuses(prev => { const n=new Set(prev); e.target.checked?n.add(s):n.delete(s); return n; });
              }} />
              <span>{s}</span>
            </label>
          ))}
        </div>
      </div>

      <div style={{ height: "100%" }}>
        <FullCalendar
          ref={calendarRef as any}
          plugins={[resourceTimelinePlugin, interactionPlugin]}
          initialView={view as any}
          datesSet={(arg: any) => setView(arg.view.type)}
          nowIndicator={true}
          slotDuration={{ days: 1 } as any}
          slotLabelFormat={{ weekday: "short", day: "2-digit", month: "short" } as any}
          dayHeaderFormat={{ weekday: "short" } as any}
          resourceAreaWidth={140}
          resourceAreaHeaderContent="Biển số"
          resources={filteredResources}
          events={filteredEvents}
          eventDidMount={eventDidMount}
          headerToolbar={false as any}
          height="100%"
          schedulerLicenseKey="GPL-My-Project-Is-Open-Source"
        />
      </div>
    </div>
  );
}

export default Schedule;
