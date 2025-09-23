import { useEffect, useState } from "react";
import type { Booking } from "../../types/booking";
import { getBookings, createBooking } from "../../service/bookingService";
import { getCustomers } from "../../service/customerService";
import { getVehicles } from "../../service/vehicleService";
import type { Customer } from "../../types/customer";
import type { Vehicle } from "../../types/vehicle";
import "./BookingManagement.css";

const BookingManagement = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    customer: "",
    vehicle: "",
    startDate: "",
    endDate: "",
    totalPrice: 0,
  });

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
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Fetch customers with debounce when dropdown open or search changes
  useEffect(() => {
    if (!customerOpen) return;
    const controller = new AbortController();
    const t = setTimeout(async () => {
      try {
        setLoadingCustomers(true);
        const res = await getCustomers({ page: 1, limit: 10, search: customerSearch }, controller.signal);
        // Some APIs may return { data: [] }, ensure we set an array
        // Fallbacks: res.data?.data (paginated) -> res.data (array) -> []
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
      const newBooking = await createBooking(formData);
      setBookings((prev) => [...prev, newBooking]);
      setShowForm(false);
      setFormData({
        customer: "",
        vehicle: "",
        startDate: "",
        endDate: "",
        totalPrice: 0,
      });
    } catch (error) {
      console.error("Tạo booking thất bại:", error);
    }
  };

  if (loading) return <p className="loading">Đang tải dữ liệu...</p>;

  return (
    <div className="booking-container">
      <h1 className="booking-title">Quản lý đơn thuê</h1>

      <button className="add-btn" onClick={() => setShowForm(true)}>
        + Thêm đơn thuê
      </button>

      <div className="booking-table-wrapper">
        <table className="booking-table">
          <thead>
            <tr>
              <th>Khách hàng</th>
              <th>Xe</th>
              <th>Thời gian</th>
              <th>Số tiền</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b._id}>
                <td>
                  {b.customer
                    ? `${b.customer.name} (${b.customer.phone})`
                    : "—"}
                </td>
                <td>
                  {b.vehicle
                    ? `${b.vehicle.licensePlate} - ${b.vehicle.brand}`
                    : "—"}
                </td>
                <td>
                  {new Date(b.startDate).toLocaleDateString()} →{" "}
                  {new Date(b.endDate).toLocaleDateString()}
                </td>
                <td className="price">
                  {b.totalPrice.toLocaleString("vi-VN")} VND
                </td>
                <td>
                  <span className={`status-badge ${b.status}`}>{b.status}</span>
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
                <div className="dropdown" onClick={() => setCustomerOpen(true)}>
                  <input
                    id="customer"
                    type="text"
                    name="customerLabel"
                    placeholder="Tìm và chọn khách hàng"
                    value={customerOpen ? customerSearch : (customerLabel || "")}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="form-input dropdown-toggle"
                    onFocus={() => setCustomerOpen(true)}
                    autoComplete="off"
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
                <div className="dropdown" onClick={() => setVehicleOpen(true)}>
                  <input
                    id="vehicle"
                    type="text"
                    name="vehicleLabel"
                    placeholder="Tìm và chọn xe"
                    value={vehicleOpen ? vehicleSearch : (vehicleLabel || "")}
                    onChange={(e) => setVehicleSearch(e.target.value)}
                    className="form-input dropdown-toggle"
                    onFocus={() => setVehicleOpen(true)}
                    autoComplete="off"
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
                  type="date"
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
                  type="date"
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

              <div className="form-actions">
                <button type="submit" className="save-btn">
                  Lưu
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowForm(false)}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingManagement;
