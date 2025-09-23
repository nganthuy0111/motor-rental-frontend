import { useEffect, useState } from "react";
import type { Booking } from "../../types/booking";
import { getBookings, createBooking, updateBooking, deleteBooking, type CreateBookingPayload, type UpdateBookingPayload } from "../../service/bookingService";
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

  type FormState = CreateBookingPayload & {
    status?: Booking["status"]; // chỉ dùng khi edit
  };
  
  const [formData, setFormData] = useState<FormState>({
    customer: "",
    vehicle: "",
    startDate: "",
    endDate: "",
    totalPrice: 0,
  });
  
  const [editingId, setEditingId] = useState<string | null>(null);

  // Searchable dropdown states
  const [customerOpen, setCustomerOpen] = useState(false);
  const [vehicleOpen, setVehicleOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [customerLabel, setCustomerLabel] = useState("");
  const [vehicleLabel, setVehicleLabel] = useState("");

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
        const res = await getCustomers({ page: 1, limit: 10, search: customerSearch }, controller.signal);
        
        const list = (res as any)?.data ?? res;
        setCustomers(Array.isArray(list) ? list : (list?.data ?? []));
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
        const res = await getVehicles({ page: 1, limit: 10, search: vehicleSearch }, controller.signal);
        const list = (res as any)?.data ?? res;
        setVehicles(Array.isArray(list) ? list : (list?.data ?? []));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        const payload: UpdateBookingPayload = {
          startDate: formData.startDate,
          endDate: formData.endDate,
          totalPrice: Number(formData.totalPrice) || 0,
          status: formData.status ?? "pending",
        };
        await updateBooking(editingId, payload);
        // Re-fetch to ensure customer/vehicle are populated and the UI updates immediately
        const refreshed = await getBookings();
        setBookings(refreshed);
      } else {
        await createBooking({
          customer: formData.customer,
          vehicle: formData.vehicle,
          startDate: formData.startDate,
          endDate: formData.endDate,
          totalPrice: Number(formData.totalPrice) || 0,
        });
        // Re-fetch to get populated customer/vehicle for the new booking as well
        const refreshed = await getBookings();
        setBookings(refreshed);
      }
  
      // Reset form
      setShowForm(false);
      setEditingId(null);
      setCustomerLabel("");
      setVehicleLabel("");
      setCustomerSearch("");
      setVehicleSearch("");
      setFormData({
        customer: "",
        vehicle: "",
        startDate: "",
        endDate: "",
        totalPrice: 0,
      });
    } catch (error) {
      console.error("Lưu booking thất bại:", error);
    }
  };

  if (loading) return <p className="loading">Đang tải dữ liệu...</p>;

  // Lọc theo từ khóa giống trang Vehicle (tìm theo KH, SĐT, biển số, hãng xe)
  const filtered = bookings.filter((b) => {
    const customerName = (b as any).customer?.name?.toLowerCase?.() || "";
    const customerPhone = (b as any).customer?.phone?.toLowerCase?.() || "";
    const vehiclePlate = (b as any).vehicle?.licensePlate?.toLowerCase?.() || "";
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
          <button className="mgmt-btn primary ml-0 md:ml-0 mt-2 md:mt-0" onClick={() => setShowForm(true)}>
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
                  {(
                    (b as any).customer &&
                    typeof (b as any).customer === "object" &&
                    ((b as any).customer.name || (b as any).customer.phone)
                  )
                    ? `${(b as any).customer.name ?? ""}${(b as any).customer.phone ? `(${(b as any).customer.phone})` : ""}`
                    : "—"}
                </td>
                <td>
                  {(
                    (b as any).vehicle &&
                    typeof (b as any).vehicle === "object" &&
                    (((b as any).vehicle.licensePlate) || ((b as any).vehicle.brand))
                  )
                    ? `${(b as any).vehicle.licensePlate ?? ""} - ${(b as any).vehicle.brand ?? ""}`
                    : "—"}
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
                          customer: b.customer?._id || "",
                          vehicle: b.vehicle?._id || "",
                          startDate: toLocalInputValue(b.startDate),
                          endDate: toLocalInputValue(b.endDate),
                          totalPrice: b.totalPrice || 0,
                          status: b.status,
                        });
                        setCustomerLabel(
                          b.customer ? `${b.customer.name}${b.customer.phone ? ` (${b.customer.phone})` : ""}` : ""
                        );
                        setVehicleLabel(
                          b.vehicle ? `${b.vehicle.licensePlate} - ${b.vehicle.brand}` : ""
                        );
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.95 1.95m-2.475-1.425l-9.193 9.193a4.5 4.5 0 00-1.17 2.137l-.313 1.25a.75.75 0 00.91.91l1.25-.313a4.5 4.5 0 002.137-1.17l9.193-9.193m-2.814-2.814a1.5 1.5 0 112.122 2.122L12.38 14.13a3 3 0 01-1.424.802l-1.068.267.267-1.068a3 3 0 01.802-1.424l6.905-6.905z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="mgmt-btn destructive icon"
                      title="Xóa"
                      onClick={async () => {
                        if (!confirm("Bạn có chắc muốn xóa đơn thuê này?")) return;
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
              <div className="form-group dropdown-group">
                <label htmlFor="customer" className="form-label">
                  Chọn khách hàng <span className="required">*</span>
                </label>
                <div className={`dropdown ${editingId ? "disabled" : ""}`} onClick={() => !editingId && setCustomerOpen(true)}>
                  <input
                    id="customer"
                    type="text"
                    name="customerLabel"
                    placeholder="Tìm và chọn khách hàng"
                    value={customerOpen ? customerSearch : (customerLabel || "")}
                    onChange={(e) => !editingId && setCustomerSearch(e.target.value)}
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
                                setFormData((prev) => ({ ...prev, customer: c._id }));
                                setCustomerLabel(`${c.name}${c.phone ? ` (${c.phone})` : ""}`);
                                setCustomerOpen(false);
                              }}
                            >
                              <div className="item-title">{c.name}</div>
                              {c.phone && <div className="item-sub">{c.phone}</div>}
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
                <input type="hidden" name="customer" value={formData.customer} />
              </div>

              <div className="form-group dropdown-group">
                <label htmlFor="vehicle" className="form-label">
                  Chọn xe <span className="required">*</span>
                </label>
                <div className={`dropdown ${editingId ? "disabled" : ""}`} onClick={() => !editingId && setVehicleOpen(true)}>
                  <input
                    id="vehicle"
                    type="text"
                    name="vehicleLabel"
                    placeholder="Tìm và chọn xe"
                    value={vehicleOpen ? vehicleSearch : (vehicleLabel || "")}
                    onChange={(e) => !editingId && setVehicleSearch(e.target.value)}
                    className="form-input dropdown-toggle"
                    onFocus={() => !editingId && setVehicleOpen(true)}
                    autoComplete="off"
                    disabled={!!editingId}
                  />
                  {vehicleOpen && (
                    <div className="dropdown-menu">
                      <input
                        type="text"
                        className="dropdown-search"
                        placeholder="Gõ để tìm xe..."
                        value={vehicleSearch}
                        onChange={(e) => setVehicleSearch(e.target.value)}
                        autoFocus
                      />
                      <div className="dropdown-list">
                        {loadingVehicles ? (
                          <div className="dropdown-empty">Đang tải...</div>
                        ) : vehicles.length === 0 ? (
                          <div className="dropdown-empty">Không có kết quả</div>
                        ) : (
                          vehicles.map((v) => (
                            <div
                              key={v._id}
                              className="dropdown-item"
                              onClick={(e) => {
                                e.stopPropagation();
                                setFormData((prev) => ({ ...prev, vehicle: v._id }));
                                setVehicleLabel(`${v.licensePlate} - ${v.brand}`);
                                setVehicleOpen(false);
                              }}
                            >
                              <div className="item-title">{v.licensePlate} - {v.brand}</div>
                              <div className="item-sub">{v.type} • {v.color} • {v.pricePerDay.toLocaleString("vi-VN")}đ/ngày</div>
                            </div>
                          ))
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
                {/* Hidden field holds the selected vehicle ID for submit */}
                <input type="hidden" name="vehicle" value={formData.vehicle} />
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
                  required
                />
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
                  required
                />
              </div>

              <div className="form-group">
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
                      setFormData((prev) => ({ ...prev, status: e.target.value as Booking["status"] }))
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

              <div className="form-actions">
                <button type="submit" className="mgmt-btn primary">
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
              onClick={() => { setShowDetail(false); setDetailBooking(null); }}
            >
              &times;
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
              <div>
                <div className="mb-2"><span className="font-semibold">Khách hàng:</span> {((detailBooking as any).customer && typeof (detailBooking as any).customer === 'object') ? `${(detailBooking as any).customer.name}${(detailBooking as any).customer.phone ? ` (${(detailBooking as any).customer.phone})` : ''}` : '—'}</div>
                <div className="mb-2"><span className="font-semibold">Xe:</span> {((detailBooking as any).vehicle && typeof (detailBooking as any).vehicle === 'object') ? `${(detailBooking as any).vehicle.licensePlate} - ${(detailBooking as any).vehicle.brand}` : '—'}</div>
                <div className="mb-2"><span className="font-semibold">Thời gian:</span> {new Date(detailBooking.startDate).toLocaleDateString()} → {new Date(detailBooking.endDate).toLocaleDateString()}</div>
                <div className="mb-2"><span className="font-semibold">Tổng tiền:</span> {detailBooking.totalPrice.toLocaleString('vi-VN')} VND</div>
                <div className="mb-2"><span className="font-semibold">Trạng thái:</span> <span className={`mgmt-badge ${detailBooking.status}`}>{detailBooking.status}</span></div>
              </div>
            </div>
            <div className="form-actions mt-6">
              <button className="mgmt-btn secondary" onClick={() => { setShowDetail(false); setDetailBooking(null); }}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingManagement;
