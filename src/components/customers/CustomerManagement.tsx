import { useEffect, useState } from "react";
import { deleteCustomer, getCustomers } from "../../service/customerService";
import type { Customer } from "../../types/customer";
import { useDebounce } from "../../hooks/useDebounce";
import { createCustomer, updateCustomer } from "../../service/customerService";
import "./CustomerManagement.css";
import "../../styles/management.css";

export default function CustomerManagement() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [pages, setPages] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [detailCustomer, setDetailCustomer] = useState<Customer | null>(null);

  const debouncedSearch = useDebounce(search, 400);

  const [showForm, setShowForm] = useState(false);

const [form, setForm] = useState({
  name: "",
  phone: "",
  cccd: "",
  driverLicense: "",
  notes: "",
  cccdImage: null as File | null,
  driverLicenseImage: null as File | null,
});

async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  const formData = new FormData();
  formData.append("name", form.name);
  formData.append("phone", form.phone);
  formData.append("cccd", form.cccd);
  formData.append("driverLicense", form.driverLicense);
  formData.append("notes", form.notes);
  if (form.cccdImage) formData.append("cccdImage", form.cccdImage);
  if (form.driverLicenseImage) formData.append("driverLicenseImage", form.driverLicenseImage);

  try {
    if (editingId) {
      await updateCustomer(editingId, formData);
    } else {
      await createCustomer(formData);
    }
    setShowForm(false);
    setEditingId(null);
    setPage(1);
  } catch (err) {
    console.error(err);
  }
}


  useEffect(() => {
    const controller = new AbortController();
    getCustomers({ page, limit, search: debouncedSearch }, controller.signal)
      .then((res) => {
        setCustomers(res.data);
        setPages(res.pages);
      })
      .catch((err: any) => console.error(err));
    return () => controller.abort();
  }, [page, limit, debouncedSearch]);

  function getImageUrl(img: Customer["cccdImage"]) {
    if (!img) return "/placeholder.png";
    if (typeof img === "string") return img;
    return img.url ?? "/placeholder.png";
  }

  return (
    <div className="mgmt-page">
      <h2 className="mgmt-title">Quản lý khách hàng</h2>

      {/* Cards thống kê */}
      <div className="stats">
        <div className="stat-card">
          <span className="stat-value">{customers.length}</span>
          <span className="stat-label">Tổng số khách hàng</span>
        </div>
        <div className="stat-card">
          <span className="stat-value green">5</span>
          <span className="stat-label">Khách hàng mới</span>
        </div>
        <div className="stat-card">
          <span className="stat-value red">2</span>
          <span className="stat-label">Vi phạm</span>
        </div>
      </div>

      {/* Thanh tìm kiếm */}
      <div className="bg-gray-100 rounded-lg p-4 mb-6 border border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between">
        <input
          className="bg-white text-gray-900 border border-gray-300 rounded px-4 py-2 w-full md:w-1/2 mb-2 md:mb-0"
          placeholder="Tìm kiếm theo tên, sđt, CCCD..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <div className="flex gap-3 ml-0 md:ml-4">
          <button className="mgmt-btn primary ml-0 md:ml-0 mt-2 md:mt-0" onClick={() => setShowForm(true)}>
            + Thêm khách hàng
          </button>
        </div>
        {showForm && (
          <div className="modal">
            <form onSubmit={handleSubmit} className="form">
<h3>{editingId ? "Cập nhật khách hàng" : "Thêm khách hàng mới"}</h3>

      <div className="form-group">
        <label>Họ tên</label>
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </div>

      <div className="form-group">
        <label>Số điện thoại</label>
        <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      </div>

      <div className="form-group">
        <label>CCCD</label>
        <input value={form.cccd} onChange={(e) => setForm({ ...form, cccd: e.target.value })} />
      </div>

      <div className="form-group">
        <label>Bằng lái</label>
        <input value={form.driverLicense} onChange={(e) => setForm({ ...form, driverLicense: e.target.value })} />
      </div>

      <div className="form-group">
        <label>Ghi chú</label>
        <textarea onChange={(e) => setForm({ ...form, notes: e.target.value })}></textarea>
      </div>

      <div className=" flex flex-row gap-4 ">
        <div className="flex-1 min-w-0">
          <label>Ảnh CCCD</label>
          <button
            type="button"
            className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg w-full py-3 bg-white text-gray-400 hover:text-red-500 hover:border-red-400 transition-colors w-35 h-28"
            onClick={() => document.getElementById('cccd-image-input')?.click()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 mb-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75v-7.5A2.25 2.25 0 014.5 6h15a2.25 2.25 0 012.25 2.25v7.5A2.25 2.25 0 0119.5 18h-15A2.25 2.25 0 012.25 15.75z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 9V6.75A2.25 2.25 0 019 4.5h6a2.25 2.25 0 012.25 2.25V9" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15.75a3 3 0 100-6 3 3 0 000 6z" />
            </svg>
            <span className="font-medium text-xs">Chọn ảnh</span>
          </button>
          <input
            id="cccd-image-input"
            type="file"
            accept="image/*"
            onChange={e => setForm({ ...form, cccdImage: e.target.files?.[0] || null })}
            className="hidden"
          />
          {form.cccdImage && (
            <div className="mt-2 flex justify-center">
              <img src={URL.createObjectURL(form.cccdImage)} alt="preview-cccd" className="w-14 h-10 object-cover rounded border border-gray-200" />
            </div>
          )}
        </div>
  <div className="flex-1 min-w-0">
          <label>Ảnh BLX</label>
          <button
            type="button"
            className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg w-full py-3 bg-white text-gray-400 hover:text-red-500 hover:border-red-400 transition-colors h-28"
            onClick={() => document.getElementById('blx-image-input')?.click()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 mb-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75v-7.5A2.25 2.25 0 014.5 6h15a2.25 2.25 0 012.25 2.25v7.5A2.25 2.25 0 0119.5 18h-15A2.25 2.25 0 012.25 15.75z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 9V6.75A2.25 2.25 0 019 4.5h6a2.25 2.25 0 012.25 2.25V9" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15.75a3 3 0 100-6 3 3 0 000 6z" />
            </svg>
            <span className="font-medium text-xs">Chọn ảnh</span>
          </button>
          <input
            id="blx-image-input"
            type="file"
            accept="image/*"
            onChange={e => setForm({ ...form, driverLicenseImage: e.target.files?.[0] || null })}
            className="hidden"
          />
          {form.driverLicenseImage && (
            <div className="mt-2 flex justify-center">
              <img src={URL.createObjectURL(form.driverLicenseImage)} alt="preview-blx" className="w-14 h-10 object-cover rounded border border-gray-200" />
            </div>
          )}
        </div>
      </div>

      <div className="actions">
        <button type="button" className="mgmt-btn secondary" onClick={() => setShowForm(false)}>Hủy</button>
        <button type="submit" className="mgmt-btn primary">Lưu</button>
      </div>
            </form>
          </div>
        )}
      </div>

      {/* Bảng */}
      <div className="mgmt-table-wrapper">
        <table className="mgmt-table">
          <thead>
            <tr>
              <th>Họ tên</th>
              <th>Số điện thoại</th>
              <th>CCCD</th>
              <th>Ảnh CCCD</th>
              <th>Ảnh BLX</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c._id}>
               
                <td>{c.name}</td>
                <td>{c.phone}</td>
                <td>{c.cccd}</td>
                 <td>
                  <img
                    src={getImageUrl(c.cccdImage)}
                    alt="avatar"
                    className="avatar"
                  />
                </td>
                 <td>
                  <img
                    src={getImageUrl(c.driverLicenseImage)}
                    alt="avatar"
                    className="avatar"
                  />
                </td>
                <td>
                  <span className="mgmt-badge active">Hoạt động</span>
                </td>
                <td>
                  <div className="mgmt-actions">
                    <button
                      className="mgmt-btn secondary icon"
                      title="Xem chi tiết"
                      onClick={() => {
                        setDetailCustomer(c);
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
  className="mgmt-btn secondary icon"
  title="Sửa"
  onClick={() => {
    setForm({
      name: c.name || "",
      phone: c.phone || "",
      cccd: c.cccd || "",
      driverLicense: c.driverLicense || "",
      notes: c.notes || "",
      cccdImage: null,
      driverLicenseImage: null,
    });
    setEditingId(c._id);
    setShowForm(true);
  }}
>
  <span role="img" aria-label="edit">✏️</span>
</button>

  <button
    className="mgmt-btn destructive icon"
    title="Xóa"
    onClick={async () => {
      if (confirm("Bạn có chắc muốn xóa khách hàng này?")) {
        try {
          await deleteCustomer(c._id);
          setPage(1); // reload về trang đầu sau khi xóa
        } catch (err) {
          console.error(err);
        }
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
                  </div>                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showDetail && detailCustomer && (
        <div className="modal">
          <div className="form w-full max-w-2xl">
            <h3>Chi tiết khách hàng</h3>
            <button
              className="absolute top-4 right-6 text-gray-400 hover:text-red-400 text-2xl"
              onClick={() => { setShowDetail(false); setDetailCustomer(null); }}
            >
              &times;
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
              <div>
                <div className="mb-2"><span className="font-semibold">Họ tên:</span> {detailCustomer.name}</div>
                <div className="mb-2"><span className="font-semibold">Số điện thoại:</span> {detailCustomer.phone}</div>
                <div className="mb-2"><span className="font-semibold">CCCD:</span> {detailCustomer.cccd}</div>
                <div className="mb-2"><span className="font-semibold">Bằng lái:</span> {detailCustomer.driverLicense}</div>
                {detailCustomer.notes && (
                  <div className="mb-2"><span className="font-semibold">Ghi chú:</span> {detailCustomer.notes}</div>
                )}
              </div>
              <div>
                <div className="font-semibold mb-2">Hình ảnh</div>
                <div className="flex gap-3 items-start">
                  <div className="text-sm">
                    <div className="mb-1">CCCD</div>
                    <img src={getImageUrl(detailCustomer.cccdImage)} alt="cccd" className="w-24 h-16 object-cover rounded border border-gray-200" />
                  </div>
                  <div className="text-sm">
                    <div className="mb-1">BLX</div>
                    <img src={getImageUrl(detailCustomer.driverLicenseImage)} alt="blx" className="w-24 h-16 object-cover rounded border border-gray-200" />
                  </div>
                </div>
              </div>
            </div>
            <div className="actions mt-6">
              <button className="mgmt-btn secondary" onClick={() => { setShowDetail(false); setDetailCustomer(null); }}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* Phân trang */}
      <div className="pagination">
        <button
          className="btn"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
        >
          Trước
        </button>
        <span>
          Trang {page} / {pages}
        </span>
        <button
          className="btn"
          onClick={() => setPage((p) => Math.min(p + 1, pages))}
          disabled={page >= pages}
        >
          Sau
        </button>
      </div>
    </div>
  );
}
