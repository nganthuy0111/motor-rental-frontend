import { useEffect, useState } from "react";
import { deleteCustomer, getCustomers } from "../../service/customerService";
import type { Customer } from "../../types/customer";
import { useDebounce } from "../../hooks/useDebounce";
import { createCustomer, updateCustomer } from "../../service/customerService";
import "./CustomerManagement.css";

export default function CustomerManagement() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [pages, setPages] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);

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
    <div className="customer-page">
      <h2 className="title">Quản lý khách hàng</h2>

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
      <div className="toolbar">
        <input
          className="search-input"
          placeholder="Tìm kiếm theo tên, sđt, CCCD..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
<button className="btn-add" onClick={() => setShowForm(true)}>
  + Thêm khách hàng
</button>
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
        <button type="button" onClick={() => setShowForm(false)}>Hủy</button>
        <button type="submit">Lưu</button>
      </div>
    </form>
  </div>
)}


      </div>

      {/* Bảng */}
      <div className="table-container">
        <table className="customer-table">
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
                  <span className="status success">Hoạt động</span>
                </td>
                <td>
                  <button
  className="btn-edit"
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
  ✏️
</button>

  <button
    className="btn-delete"
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
    🗑️
  </button>                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
