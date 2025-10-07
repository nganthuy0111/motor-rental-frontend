import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import type { Booking } from "../../types/booking";
import {
  getBookings,
  createBooking,
  updateBooking,
  deleteBooking,
  type UpdateBookingPayload,
} from "../../service/bookingService";
import { getCustomers } from "../../service/customerService";
import { getVehicles } from "../../service/vehicleService";
import type { Customer } from "../../types/customer";
import type { Vehicle } from "../../types/vehicle";
import "./BookingManagement.css";
import "../../styles/management.css";

const BookingManagement = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [detailBooking, setDetailBooking] = useState<Booking | null>(null);
  const [search, setSearch] = useState("");

  // Helper: format ISO date string to 'YYYY-MM-DDTHH:MM' in local time for <input type="datetime-local">
  const toLocalInputValue = (dateStr?: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    const tzOffset = d.getTimezoneOffset();
    const local = new Date(d.getTime() - tzOffset * 60000);
    return local.toISOString().slice(0, 16);
  };

  // Define explicit form state to avoid optional vehicles and ensure strong typing
  type FormState = {
    customer: string;
    vehicles: string[];
    startDate: string;
    endDate: string;
    totalPrice: number;
    status?: Booking["status"]; // chỉ dùng khi edit
    color?: string; // màu hiển thị trên timeline
  };

  const [formData, setFormData] = useState<FormState>({
    customer: "",
    vehicles: [],
    startDate: "",
    endDate: "",
    totalPrice: 0,
    color: "#3b82f6",
  });

  const [editingId, setEditingId] = useState<string | null>(null);

  // Searchable dropdown states
  const [customerOpen, setCustomerOpen] = useState(false);
  const [vehicleOpen, setVehicleOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleMap, setVehicleMap] = useState<Record<string, Vehicle>>({});
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [customerLabel, setCustomerLabel] = useState("");
  const [showVehiclesList, setShowVehiclesList] = useState(false);
  const [vehiclesListData, setVehiclesListData] = useState<Array<any>>([]);

  useEffect(() => {
    getBookings()
      .then(setBookings)
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "totalPrice" ? Number(value) || 0 : value,
    }));
  };

  // Fetch customers with debounce when dropdown open or search changes
  useEffect(() => {
    if (!customerOpen) return;
    const controller = new AbortController();
    const t = setTimeout(async () => {
      try {
        setLoadingCustomers(true);
        const res = await getCustomers(
          { page: 1, limit: 10, search: customerSearch },
          controller.signal
        );

        const list = (res as any)?.data ?? res;
        setCustomers(Array.isArray(list) ? list : list?.data ?? []);
      } catch (e) {
        // ignore
      } finally {
        setLoadingCustomers(false);
      }
    }, 300);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [customerOpen, customerSearch]);

  // Fetch vehicles with debounce when dropdown open or search changes
  useEffect(() => {
    if (!vehicleOpen) return;
    const controller = new AbortController();
    const t = setTimeout(async () => {
      try {
        setLoadingVehicles(true);
        const res = await getVehicles(
          { page: 1, limit: 10, search: vehicleSearch },
          controller.signal
        );
        const list = (res as any)?.data ?? res;
        setVehicles(Array.isArray(list) ? list : list?.data ?? []);
      } catch (e) {
        // ignore
      } finally {
        setLoadingVehicles(false);
      }
    }, 300);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [vehicleOpen, vehicleSearch]);

  // Select-all checkbox state for vehicle list
  const selectableIds = vehicles.map(v => v._id);
  const allSelected = selectableIds.length > 0 && selectableIds.every(id => formData.vehicles.includes(id));
  const someSelected = selectableIds.some(id => formData.vehicles.includes(id)) && !allSelected;
  const selectAllRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someSelected;
    }
  }, [someSelected, allSelected]);

  // Load all vehicles once for price lookup and label building (enrichment)
  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const res = await getVehicles({ page: 1, limit: 1000, search: "" }, controller.signal);
        const list = (res as any)?.data ?? res;
        const arr: Vehicle[] = Array.isArray(list) ? list : list?.data ?? [];
        setVehicleMap(arr.reduce((acc, v) => { acc[v._id] = v; return acc; }, {} as Record<string, Vehicle>));
      } catch {}
    })();
    return () => controller.abort();
  }, []);

  // Auto-calc total price = days * sum(pricePerDay of selected vehicles)
  useEffect(() => {
    const { startDate, endDate, vehicles: selected } = formData;
    if (!startDate || !endDate) return;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const ms = end.getTime() - start.getTime();
    if (isNaN(ms) || ms <= 0) return;
    const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
    const sum = selected.reduce((acc, id) => {
      const v = vehicleMap[id] || vehicles.find(x => x._id === id);
      return acc + (v?.pricePerDay || 0);
    }, 0);
    setFormData(prev => ({ ...prev, totalPrice: Math.max(0, days) * sum }));
  }, [formData.startDate, formData.endDate, formData.vehicles, vehicleMap]);

  // Inline validation: end must be after start
  const invalidRange = (() => {
    if (!formData.startDate || !formData.endDate) return false;
    const s = new Date(formData.startDate);
    const e = new Date(formData.endDate);
    return isNaN(s.getTime()) || isNaN(e.getTime()) || e <= s;
  })();

  // Start time should not be in the past (soft validation to avoid native validity popups)
  const startInPast = (() => {
    if (!formData.startDate) return false;
    const s = new Date(formData.startDate);
    const now = new Date();
    return !isNaN(s.getTime()) && s.getTime() < now.getTime();
  })();

  // Quick selectors for date-time inputs
  const setStartNow = () => {
    const now = new Date();
    // round to nearest 15 minutes
    const ms = 15 * 60 * 1000;
    const rounded = new Date(Math.ceil(now.getTime() / ms) * ms);
    setFormData(prev => ({ ...prev, startDate: toLocalInputValue(rounded.toISOString()) }));
  };
  const setEndPlusDays = (d: number) => {
    const base = formData.startDate ? new Date(formData.startDate) : new Date();
    const end = new Date(base.getTime() + d * 24 * 60 * 60 * 1000);
    setFormData(prev => ({ ...prev, endDate: toLocalInputValue(end.toISOString()) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        const payload: UpdateBookingPayload = {
          startDate: formData.startDate,
          endDate: formData.endDate,
          totalPrice: Number(formData.totalPrice) || 0,
          status: formData.status ?? "pending",
          vehicles: formData.vehicles,
          color: formData.color,
        };
        await updateBooking(editingId, payload);
        // Re-fetch to ensure customer/vehicle are populated and the UI updates immediately
        const refreshed = await getBookings();
        setBookings(refreshed);
      } else {
        await createBooking({
          customer: formData.customer,
          vehicles: formData.vehicles,
          startDate: formData.startDate,
          endDate: formData.endDate,
          totalPrice: Number(formData.totalPrice) || 0,
          color: formData.color,
        });
        // Re-fetch to get populated customer/vehicle for the new booking as well
        const refreshed = await getBookings();
        setBookings(refreshed);
      }

      // Reset form
      setShowForm(false);
      setEditingId(null);
      setCustomerLabel("");
      setCustomerSearch("");
      setVehicleSearch("");
      setFormData({
        customer: "",
        vehicles: [],
        startDate: "",
        endDate: "",
        totalPrice: 0,
        color: "#3b82f6",
      });
    } catch (error) {
      // Thông báo lỗi thân thiện bằng tiếng Việt (toast nhỏ)
      const anyErr: any = error as any;
      const msg = anyErr?.response?.data?.message || anyErr?.response?.data?.error || anyErr?.message || "Lưu booking thất bại";
      const details = anyErr?.response?.data?.details;
      let extra = "";
      if (details?.reason && details?.reason.toLowerCase().includes("overlap")) {
        const vIds: string[] | undefined = Array.isArray(details.vehicles) ? details.vehicles : undefined;
        const vLabels = vIds?.map((id: string) => {
          const v = vehicleMap[id] || vehicles.find(x => x._id === id);
          return v ? `${v.licensePlate}` : id;
        }).join(", ");
        const s = details.startDate || formData.startDate;
        const e2 = details.endDate || formData.endDate;
        const conflicts = Array.isArray(details.conflicts) && details.conflicts.length > 0 ? `\nMã đơn thuê trùng: ${details.conflicts.join(", ")}` : "";
        extra = `\nXe trùng lịch: ${vLabels ?? "(không rõ)"}\nKhoảng thời gian: ${new Date(s).toLocaleString()} → ${new Date(e2).toLocaleString()}${conflicts}`;
        toast.error(`Xe đã được đặt trong khoảng thời gian bạn chọn. Vui lòng chọn lại.\n${extra}`);
        return;
      }
      toast.error(`Không thể lưu đơn thuê: ${msg}${extra ? `\n${extra}` : ""}`);
    }
  };

  if (loading) return <p className="loading">Đang tải dữ liệu..</p>;

  // Lọc theo từ khóa giống trang Vehicle (tìm theo KH, SĐT, biển số, hãng xe)
  const filtered = bookings.filter((b) => {
    const customerName = (b as any).customer?.name?.toLowerCase?.() || "";
    const customerPhone = (b as any).customer?.phone?.toLowerCase?.() || "";
    const vehiclePlate =
      (b as any).vehicle?.licensePlate?.toLowerCase?.() || "";
    const vehicleBrand = (b as any).vehicle?.brand?.toLowerCase?.() || "";
    const term = search.toLowerCase();
    return (
      customerName.includes(term) ||
      customerPhone.includes(term) ||
      vehiclePlate.includes(term) ||
      vehicleBrand.includes(term)
    );
  });

  return (
    <div className="mgmt-page">
      <h1 className="mgmt-title">Quản lý đơn thuê</h1>
      <div className="bg-gray-100 rounded-lg p-4 mb-6 border border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between">
        <input
          className="bg-white text-gray-900 border border-gray-300 rounded px-4 py-2 w-full md:w-1/2 mb-2 md:mb-0"
          placeholder="Tìm kiếm theo KH, SĐT, biển số, hãng xe..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex gap-3 ml-0 md:ml-4">
          <button
            className="mgmt-btn primary ml-0 md:ml-0 mt-2 md:mt-0"
            onClick={() => setShowForm(true)}
          >
            + Thêm đơn thuê
          </button>
        </div>
      </div>

      <div className="mgmt-table-wrapper">
        <table className="mgmt-table">
          <thead>
            <tr>
              <th>Khách hàng</th>
              <th>Xe</th>
              <th>Thời gian</th>
              <th>Số tiền</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((b) => (
              <tr key={b._id}>
                <td>
                  {(b as any).customer &&
                  typeof (b as any).customer === "object" &&
                  ((b as any).customer.name || (b as any).customer.phone)
                    ? `${(b as any).customer.name ?? ""}${
                        (b as any).customer.phone
                          ? `(${(b as any).customer.phone})`
                          : ""
                      }`
                    : "—"}
                </td>
                <td>
                  {Array.isArray((b as any).vehicles) && (b as any).vehicles.length > 0 ? (
                    <button
                      type="button"
                      className="mgmt-btn secondary"
                      onClick={() => {
                        setVehiclesListData((b as any).vehicles);
                        setShowVehiclesList(true);
                      }}
                      title="Xem danh sách xe"
                    >
                      {(b as any).vehicles.length} xe
                    </button>
                  ) : (b as any).vehicle && typeof (b as any).vehicle === "object" ? (
                    <button
                      type="button"
                      className="mgmt-btn secondary"
                      onClick={() => {
                        setVehiclesListData([(b as any).vehicle]);
                        setShowVehiclesList(true);
                      }}
                    >
                      1 xe
                    </button>
                  ) : (
                    "—"
                  )}
                </td>
                <td>
                  {new Date(b.startDate).toLocaleDateString()} →{" "}
                  {new Date(b.endDate).toLocaleDateString()}
                </td>
                <td className="mgmt-price">
                  {b.totalPrice.toLocaleString("vi-VN")} VND
                </td>
                <td>
                  <span className={`mgmt-badge ${b.status}`}>{b.status}</span>
                </td>
                <td>
                  <div className="mgmt-actions">
                    <button
                      type="button"
                      className="mgmt-btn secondary icon"
                      title="Xem chi tiết"
                      onClick={() => {
                        setDetailBooking(b);
                        setShowDetail(true);
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="mgmt-btn secondary icon"
                      title="Sửa"
                      onClick={() => {
                        setEditingId(b._id);
                        setShowForm(true);
                        setCustomerOpen(false);
                        setVehicleOpen(false);
                        setFormData({
                          customer: (b as any).customer?._id || (typeof (b as any).customer === "string" ? (b as any).customer : ""),
                          vehicles: Array.isArray((b as any).vehicles)
                            ? (b as any).vehicles.map((v: any) => (typeof v === "string" ? v : v._id)).filter(Boolean)
                            : ((b as any).vehicle?._id ? [(b as any).vehicle._id] : []),
                          startDate: toLocalInputValue(b.startDate),
                          endDate: toLocalInputValue(b.endDate),
                          totalPrice: b.totalPrice || 0,
                          status: b.status,
                          color: (b as any).color || "#3b82f6",
                        });
                        const cust = (b as any).customer;
                        const custLabel = cust
                          ? (typeof cust === "string"
                              ? cust.slice(-6)
                              : `${cust.name ?? ""}${cust.phone ? ` (${cust.phone})` : ""}`)
                          : "";
                        setCustomerLabel(custLabel);
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16.862 4.487l1.95 1.95m-2.475-1.425l-9.193 9.193a4.5 4.5 0 00-1.17 2.137l-.313 1.25a.75.75 0 00.91.91l1.25-.313a4.5 4.5 0 002.137-1.17l9.193-9.193m-2.814-2.814a1.5 1.5 0 112.122 2.122L12.38 14.13a3 3 0 01-1.424.802l-1.068.267.267-1.068a3 3 0 01.802-1.424l6.905-6.905z"
                        />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="mgmt-btn destructive icon"
                      title="Xóa"
                      onClick={async () => {
                        if (!confirm("Bạn có chắc muốn xóa đơn thuê này?"))
                          return;
                        try {
                          await deleteBooking(b._id);
                          const refreshed = await getBookings();
                          setBookings(refreshed);
                        } catch (err) {
                          console.error("Xóa booking thất bại:", err);
                        }
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 7h12M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2m3 0v12a2 2 0 01-2 2H7a2 2 0 01-2-2V7h16z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M10 11v6m4-6v6"
                        />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="popup-overlay">
          <div className="popup">
            <h2>Thêm đơn thuê</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group dropdown-group">
                <label htmlFor="customer" className="form-label">
                  Chọn khách hàng <span className="required">*</span>
                </label>
                <div
                  className={`dropdown ${editingId ? "disabled" : ""}`}
                  onClick={() => !editingId && setCustomerOpen(true)}
                >
                  <input
                    id="customer"
                    type="text"
                    name="customerLabel"
                    placeholder="Tìm và chọn khách hàng"
                    value={customerOpen ? customerSearch : customerLabel || ""}
                    onChange={(e) =>
                      !editingId && setCustomerSearch(e.target.value)
                    }
                    className="form-input dropdown-toggle"
                    onFocus={() => !editingId && setCustomerOpen(true)}
                    autoComplete="off"
                    disabled={!!editingId}
                  />
                  {customerOpen && (
                    <div className="dropdown-menu">
                      <input
                        type="text"
                        className="dropdown-search"
                        placeholder="Gõ để tìm khách hàng..."
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                        autoFocus
                      />
                      <div className="dropdown-list">
                        {loadingCustomers ? (
                          <div className="dropdown-empty">Đang tải...</div>
                        ) : customers.length === 0 ? (
                          <div className="dropdown-empty">Không có kết quả</div>
                        ) : (
                          customers.map((c) => (
                            <div
                              key={c._id}
                              className="dropdown-item"
                              onClick={(e) => {
                                e.stopPropagation();
                                setFormData((prev) => ({
                                  ...prev,
                                  customer: c._id,
                                }));
                                setCustomerLabel(
                                  `${c.name}${c.phone ? ` (${c.phone})` : ""}`
                                );
                                setCustomerOpen(false);
                              }}
                            >
                              <div className="item-title">{c.name}</div>
                              {c.phone && (
                                <div className="item-sub">{c.phone}</div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                      <button
                        type="button"
                        className="dropdown-close"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCustomerOpen(false);
                        }}
                      >
                        Đóng
                      </button>
                    </div>
                  )}
                </div>
                {/* Hidden field holds the selected customer ID for submit */}
                <input
                  type="hidden"
                  name="customer"
                  value={formData.customer}
                />
              </div>

              <div className="form-group dropdown-group">
                <label htmlFor="vehicles" className="form-label">
                  Chọn xe (nhiều) <span className="required">*</span>
                </label>
                <div className="dropdown">
                  <div
                    className="form-input dropdown-toggle flex items-center flex-wrap gap-1 min-h-[40px] cursor-pointer"
                    onClick={() => setVehicleOpen(true)}
                  >
                    {formData.vehicles.length === 0 ? (
                      <span className="text-gray-400">Chọn 1 hoặc nhiều xe...</span>
                    ) : (
                      (() => {
                        const chips = formData.vehicles.slice(0, 2).map((id) => {
                          const v = vehicleMap[id] || vehicles.find(x => x._id === id);
                          const label = v ? `${v.licensePlate} - ${v.brand}` : id.slice(-6);
                          return (
                            <span key={id} className="px-2 py-1 bg-gray-200 text-gray-800 rounded-full text-xs flex items-center gap-1">
                              {label}
                              <button
                                type="button"
                                className="text-gray-500 hover:text-red-500"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setFormData(prev => ({ ...prev, vehicles: prev.vehicles.filter(vId => vId !== id) }));
                                }}
                                aria-label="Remove"
                              >
                                ×
                              </button>
                            </span>
                          );
                        });
                        const more = formData.vehicles.length - 2;
                        return (
                          <>
                            {chips}
                            {more > 0 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">+{more} nữa</span>
                            )}
                          </>
                        );
                      })()
                    )}
                    <span className="ml-auto text-gray-500">▾</span>
                  </div>
                  {vehicleOpen && (
                    <div className="dropdown-menu">
                      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 text-sm bg-gray-50">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            ref={selectAllRef}
                            checked={allSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData(prev => ({ ...prev, vehicles: Array.from(new Set([...prev.vehicles, ...selectableIds])) }));
                              } else {
                                const currentSet = new Set(selectableIds);
                                setFormData(prev => ({ ...prev, vehicles: prev.vehicles.filter(id => !currentSet.has(id)) }));
                              }
                            }}
                          />
                          <span>Chọn tất cả</span>
                        </label>
                        <button
                          type="button"
                          className="text-gray-500 hover:text-gray-700"
                          onClick={() => setFormData(prev => ({ ...prev, vehicles: [] }))}
                        >Bỏ chọn</button>
                      </div>
                      <input
                        type="text"
                        className="dropdown-search"
                        placeholder="Gõ để tìm xe..."
                        value={vehicleSearch}
                        onChange={(e) => setVehicleSearch(e.target.value)}
                        autoFocus
                      />
                      <div className="dropdown-list max-h-64 overflow-y-auto divide-y divide-gray-100">
                        {loadingVehicles ? (
                          <div className="dropdown-empty">Đang tải...</div>
                        ) : vehicles.length === 0 ? (
                          <div className="dropdown-empty">Không có kết quả</div>
                        ) : (
                          vehicles.map((v) => {
                            const selected = formData.vehicles.includes(v._id);
                            return (
                              <div
                                key={v._id}
                                className={`dropdown-item px-3 py-2 hover:bg-gray-50 flex items-start gap-2 cursor-pointer`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setFormData((prev) => {
                                    const set = new Set(prev.vehicles);
                                    if (set.has(v._id)) set.delete(v._id); else set.add(v._id);
                                    return { ...prev, vehicles: Array.from(set) };
                                  });
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={selected}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    setFormData((prev) => {
                                      const set = new Set(prev.vehicles);
                                      if (e.target.checked) set.add(v._id); else set.delete(v._id);
                                      return { ...prev, vehicles: Array.from(set) };
                                    });
                                  }}
                                  className="mt-0.5"
                                />
                                <div className="flex-1">
                                  <div className="item-title">{v.licensePlate} - {v.brand}</div>
                                  <div className="item-sub">{v.type} • {v.color} • {v.pricePerDay.toLocaleString("vi-VN")}đ/ngày</div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                      <button
                        type="button"
                        className="dropdown-close"
                        onClick={(e) => {
                          e.stopPropagation();
                          setVehicleOpen(false);
                        }}
                      >
                        Đóng
                      </button>
                    </div>
                  )}
                </div>
                {/* Hidden field holds the selected vehicles for submit */}
                <input type="hidden" name="vehicles" value={formData.vehicles.join(",")} />
              </div>

              <div className="form-group">
                <label htmlFor="startDate" className="form-label">
                  Ngày bắt đầu <span className="required">*</span>
                </label>
                <input
                  id="startDate"
                  type="datetime-local"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="form-input"
                  step={60}
                  required
                />
                <div className="mt-2 flex gap-2 text-xs">
                  <button type="button" className="mgmt-btn secondary" onClick={setStartNow}>Bây giờ</button>
                </div>
                {startInPast && (
                  <div className="text-orange-500 text-xs mt-1">Thời gian bắt đầu đang ở quá khứ.</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="endDate" className="form-label">
                  Ngày kết thúc <span className="required">*</span>
                </label>
                <input
                  id="endDate"
                  type="datetime-local"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="form-input"
                  step={60}
                  required
                />
                <div className="mt-2 flex gap-2 text-xs">
                  <button type="button" className="mgmt-btn secondary" onClick={() => setEndPlusDays(1)}>+1 ngày</button>
                  <button type="button" className="mgmt-btn secondary" onClick={() => setEndPlusDays(2)}>+2 ngày</button>
                  <button type="button" className="mgmt-btn secondary" onClick={() => setEndPlusDays(7)}>+7 ngày</button>
                </div>
                {invalidRange && (
                  <div className="text-red-500 text-xs mt-1">Ngày kết thúc phải sau ngày bắt đầu.</div>
                )}
              </div>

              <div className="form-group md:col-span-2">
                <label htmlFor="totalPrice" className="form-label">
                  Tổng tiền (VND) <span className="required">*</span>
                </label>
                <input
                  id="totalPrice"
                  type="number"
                  name="totalPrice"
                  placeholder="Nhập tổng tiền"
                  value={formData.totalPrice}
                  onChange={handleChange}
                  className="form-input"
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="color" className="form-label">
                  Màu hiển thị trên lịch
                </label>
                <input
                  id="color"
                  type="color"
                  name="color"
                  value={formData.color || "#3b82f6"}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              {editingId && (
                <div className="form-group">
                  <label htmlFor="status" className="form-label">
                    Trạng thái <span className="required">*</span>
                  </label>
                  <select
                    id="status"
                    name="status"
                    className="form-input form-select"
                    value={formData.status ?? "pending"}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        status: e.target.value as Booking["status"],
                      }))
                    }
                    required
                  >
                    <option value="pending">pending</option>
                    <option value="active">active</option>
                    <option value="completed">completed</option>
                    <option value="overdue">overdue</option>
                  </select>
                </div>
              )}
              <div className="form-actions md:col-span-2">
                <button type="submit" className="mgmt-btn primary" disabled={invalidRange || startInPast}>
                  Lưu
                </button>
                <button
                  type="button"
                  className="mgmt-btn secondary"
                  onClick={() => setShowForm(false)}
                >
                  Hủy
                </button>
              </div>
              </div>
            </form>
          </div>
        </div>
      )}
      {showDetail && detailBooking && (
        <div className="popup-overlay">
          <div className="popup max-w-2xl">
            <h2>Chi tiết đơn thuê</h2>
            <button
              className="absolute top-4 right-6 text-gray-400 hover:text-red-400 text-2xl"
              onClick={() => {
                setShowDetail(false);
                setDetailBooking(null);
              }}
            >
              &times;
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
              <div>
                <div className="mb-2">
                  <span className="font-semibold">Khách hàng:</span>{" "}
                  {(detailBooking as any).customer &&
                  typeof (detailBooking as any).customer === "object"
                    ? `${(detailBooking as any).customer.name}${
                        (detailBooking as any).customer.phone
                          ? ` (${(detailBooking as any).customer.phone})`
                          : ""
                      }`
                    : "—"}
                </div>
                <div className="mb-2">
                  <span className="font-semibold">Xe:</span>{" "}
                  {(detailBooking as any).vehicle &&
                  typeof (detailBooking as any).vehicle === "object"
                    ? `${(detailBooking as any).vehicle.licensePlate} - ${
                        (detailBooking as any).vehicle.brand
                      }`
                    : "—"}
                </div>
                <div className="mb-2">
                  <span className="font-semibold">Thời gian:</span>{" "}
                  {new Date(detailBooking.startDate).toLocaleDateString()} →{" "}
                  {new Date(detailBooking.endDate).toLocaleDateString()}
                </div>
                <div className="mb-2">
                  <span className="font-semibold">Tổng tiền:</span>{" "}
                  {detailBooking.totalPrice.toLocaleString("vi-VN")} VND
                </div>
                <div className="mb-2">
                  <span className="font-semibold">Trạng thái:</span>{" "}
                  <span className={`mgmt-badge ${detailBooking.status}`}>
                    {detailBooking.status}
                  </span>
                </div>
              </div>
            </div>
            <div className="form-actions mt-6">
              <button
                className="mgmt-btn secondary"
                onClick={() => {
                  setShowDetail(false);
                  setDetailBooking(null);
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
      {showVehiclesList && (
        <div className="popup-overlay">
          <div className="popup max-w-xl relative">
            <h2>Danh sách xe trong đơn</h2>
            <button
              className="absolute top-4 right-6 text-gray-400 hover:text-red-400 text-2xl"
              onClick={() => {
                setShowVehiclesList(false);
                setVehiclesListData([]);
              }}
            >
              &times;
            </button>
            <div className="mt-4">
              {(!vehiclesListData || vehiclesListData.length === 0) ? (
                <div className="text-gray-500">Không có xe</div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {vehiclesListData.map((raw: any, idx: number) => {
                    const id = typeof raw === "string" ? raw : raw?._id;
                    const v = (id && vehicleMap[id]) || (typeof raw === "object" ? raw : null);
                    const title = v ? `${v.licensePlate ?? id?.slice?.(-6)} - ${v.brand ?? ""}` : `Xe ${id?.slice?.(-6) ?? idx + 1}`;
                    return (
                      <div key={`${id}-${idx}`} className="py-3 flex items-center gap-3">
                        {v?.images?.[0] ? (
                          <img src={v.images[0]} alt="xe" className="w-14 h-10 object-cover rounded border border-gray-200" />
                        ) : (
                          <div className="w-14 h-10 bg-gray-100 flex items-center justify-center rounded text-xs text-gray-500 border border-gray-200">No image</div>
                        )}
                        <div className="flex-1">
                          <div className="font-semibold leading-5">{title}</div>
                          <div className="text-sm text-gray-600 leading-4">
                            {(v?.type ?? "")}{v?.color ? ` • ${v.color}` : ""}
                            {v?.pricePerDay ? ` • ${v.pricePerDay.toLocaleString("vi-VN")}đ/ngày` : ""}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="form-actions mt-6">
              <button
                className="mgmt-btn secondary"
                onClick={() => {
                  setShowVehiclesList(false);
                  setVehiclesListData([]);
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingManagement;
