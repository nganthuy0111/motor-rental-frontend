
import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';
import { toast } from 'react-toastify';
import type { Vehicle } from '../../types/vehicle';
import "../../styles/management.css";


const statusMap: Record<string, { label: string; color: string }> = {
  available: { label: 'Sẵn sàng', color: 'bg-green-600' },
  rented: { label: 'Đang thuê', color: 'bg-red-600' },
  maintenance: { label: 'Bảo trì', color: 'bg-orange-500' },
};

const VehicleManagement: React.FC = () => {
  // State & logic cho update xe
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState<any>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [detailVehicle, setDetailVehicle] = useState<Vehicle | null>(null);

  const handleDeleteVehicle = async (vehicleId: string) => {
    if (window.confirm('Bạn có chắc muốn xóa xe này?')) {
      setDeleteLoading(true);
      try {
        await axios.delete(`/vehicles/${vehicleId}`);
        toast.success('Xóa xe thành công!');
        fetchVehicles(); // Cập nhật lại danh sách sau khi xóa
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Xóa xe thất bại!');
      } finally {
        setDeleteLoading(false);
      }
    }
  };
  
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!editForm) return;
    const { name, value, files } = e.target as any;
    if (name === 'images' && files) {
      setEditForm((f: any) => ({ ...f, images: Array.from(files) }));
    } else {
      setEditForm((f: any) => ({ ...f, [name]: value }));
    }
  };

  const handleEditVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError('');
    try {
      const formData = new FormData();
      formData.append('licensePlate', editForm.licensePlate);
      formData.append('type', editForm.type);
      formData.append('brand', editForm.brand);
      formData.append('pricePerDay', editForm.pricePerDay);
      formData.append('status', editForm.status);
      if (editForm.images && editForm.images.length > 0) {
        editForm.images.forEach((img: File) => formData.append('images', img));
      }
      await axios.put(`/vehicles/${editForm._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setShowEdit(false);
      setEditForm(null);
      fetchVehicles();
    } catch (err: any) {
      setEditError(err.response?.data?.message || 'Cập nhật xe thất bại!');
    } finally {
      setEditLoading(false);
    }
  };
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({
    licensePlate: '',
    type: '',
    brand: '',
    pricePerDay: '',
    status: 'available',
    images: [] as File[],
  });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/vehicles');
      setVehicles(res.data);
    } catch (err) {
      setVehicles([]);
      console.log(err)
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  // Thống kê
  const total = vehicles.length;
  const available = vehicles.filter(v => v.status === 'available').length;
  const rented = vehicles.filter(v => v.status === 'rented').length;
  const maintenance = vehicles.filter(v => v.status === 'maintenance').length;

  // Lọc
  const filtered = vehicles.filter(v =>
    v.licensePlate.toLowerCase().includes(search.toLowerCase()) ||
    v.brand.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, files } = e.target as any;
    if (name === 'images' && files) {
      setAddForm(f => ({ ...f, images: Array.from(files) }));
    } else {
      setAddForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);
    setAddError('');
    try {
      const formData = new FormData();
      formData.append('licensePlate', addForm.licensePlate);
      formData.append('type', addForm.type);
      formData.append('brand', addForm.brand);
      formData.append('pricePerDay', addForm.pricePerDay);
      formData.append('status', addForm.status);
      addForm.images.forEach(img => formData.append('images', img));
      await axios.post('/vehicles', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setShowAdd(false);
      setAddForm({ licensePlate: '', type: '', brand: '', pricePerDay: '', status: 'available', images: [] });
      fetchVehicles();
    } catch (err: any) {
      setAddError(err.response?.data?.message || 'Thêm xe thất bại!');
    } finally {
      setAddLoading(false);
    }
  };

  return (
  <div className="mgmt-page">
      <h1 className="mgmt-title">Quản lý xe</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-between border border-gray-200">
          <div>
            <div className="text-lg">Tổng số xe</div>
            <div className="text-2xl font-bold text-red-500">{total}</div>
          </div>
          <span className="text-3xl text-red-400">🚗</span>
        </div>
        <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-between border border-gray-200">
          <div>
            <div className="text-lg">Sẵn sàng</div>
            <div className="text-2xl font-bold text-green-500">{available}</div>
          </div>
          <span className="text-3xl text-green-500">🚗</span>
        </div>
        <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-between border border-gray-200">
          <div>
            <div className="text-lg">Đang thuê</div>
            <div className="text-2xl font-bold text-red-500">{rented}</div>
          </div>
          <span className="text-3xl text-red-500">🚗</span>
        </div>
        <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-between border border-gray-200">
          <div>
            <div className="text-lg">Bảo trì</div>
            <div className="text-2xl font-bold text-orange-500">{maintenance}</div>
          </div>
          <span className="text-3xl text-orange-500">⚙️</span>
        </div>
      </div>

      {/* Bộ lọc & tìm kiếm */}
      <div className="bg-gray-100 rounded-lg p-4 mb-6 border border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between">
        <input
          className="bg-white text-gray-900 border border-gray-300 rounded px-4 py-2 w-full md:w-1/2 mb-2 md:mb-0"
          placeholder="Tìm kiếm theo biển số, hãng xe..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="bg-white text-gray-900 border border-gray-300 rounded px-4 py-2 ml-0 md:ml-4">
          <option>Tất cả trạng thái</option>
        </select>
  <button className="mgmt-btn primary ml-0 md:ml-4 mt-2 md:mt-0" onClick={() => setShowAdd(true)}>+ Thêm xe mới</button>
      {/* Modal thêm xe mới dạng popup nổi */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0" style={{ background: '#666666', opacity: 0.6 }}></div>
          <div className="relative bg-white text-gray-900 rounded-lg p-8 w-full max-w-lg shadow-lg border border-gray-200 z-10 animate-fade-in">
            <button className="absolute top-4 right-6 text-gray-400 hover:text-red-400 text-2xl" onClick={() => setShowAdd(false)}>&times;</button>
            <h2 className="text-2xl font-bold mb-6">Thêm xe mới</h2>
            <form onSubmit={handleAddVehicle} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block mb-1">Biển số xe *</label>
                  <input name="licensePlate" value={addForm.licensePlate} onChange={handleAddChange} required className="border border-gray-300 rounded px-3 py-2 w-full bg-white text-gray-900 focus:bg-gray-50" />
                </div>
                <div>
                  <label className="block mb-1">Loại xe *</label>
                  <input name="type" value={addForm.type} onChange={handleAddChange} required className="border border-gray-300 rounded px-3 py-2 w-full bg-white text-gray-900 focus:bg-gray-50" />
                </div>
                <div>
                  <label className="block mb-1">Hãng xe *</label>
                  <input name="brand" value={addForm.brand} onChange={handleAddChange} required className="border border-gray-300 rounded px-3 py-2 w-full bg-white text-gray-900 focus:bg-gray-50" />
                </div>
                <div>
                  <label className="block mb-1">Giá thuê/ngày (VND) *</label>
                  <input name="pricePerDay" value={addForm.pricePerDay} onChange={handleAddChange} required type="number" min={0} className="border border-gray-300 rounded px-3 py-2 w-full bg-white text-gray-900 focus:bg-gray-50" />
                </div>
                <div>
                  <label className="block mb-1">Trạng thái *</label>
                  <select name="status" value={addForm.status} onChange={handleAddChange} className="border border-gray-300 rounded px-3 py-2 w-full bg-white text-gray-900">
                    <option value="available">Sẵn sàng</option>
                    <option value="rented">Đang thuê</option>
                    <option value="maintenance">Bảo trì</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1">Ảnh xe</label>
                  <button
                    type="button"
                    className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg w-full py-3 bg-white text-gray-400 hover:text-red-500 hover:border-red-400 transition-colors"
                    style={{ maxWidth: 120, margin: '0 auto' }}
                    onClick={() => document.getElementById('vehicle-image-input')?.click()}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 mb-1">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75v-7.5A2.25 2.25 0 014.5 6h15a2.25 2.25 0 012.25 2.25v7.5A2.25 2.25 0 0119.5 18h-15A2.25 2.25 0 012.25 15.75z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 9V6.75A2.25 2.25 0 019 4.5h6a2.25 2.25 0 012.25 2.25V9" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15.75a3 3 0 100-6 3 3 0 000 6z" />
                    </svg>
                    <span className="font-medium text-xs">Chọn ảnh</span>
                  </button>
                  <input
                    id="vehicle-image-input"
                    name="images"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleAddChange}
                    className="hidden"
                  />
                  {addForm.images.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2 justify-center">
                      {addForm.images.map((file, idx) => (
                        <img
                          key={idx}
                          src={URL.createObjectURL(file)}
                          alt={`preview-${idx}`}
                          className="w-14 h-10 object-cover rounded border border-gray-200"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {addError && <div className="text-red-500 text-sm text-center">{addError}</div>}
              <div className="flex justify-end gap-4 mt-6">
                <button type="button" className="px-6 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300" onClick={() => setShowAdd(false)}>Hủy</button>
                <button type="submit" className="px-6 py-2 rounded bg-red-600 text-white hover:bg-red-700" disabled={addLoading}>{addLoading ? 'Đang lưu...' : 'Lưu'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>

      {/* Danh sách xe */}
      <div className="mgmt-table-wrapper">
        <div className="mb-2 font-semibold">Danh sách xe ({filtered.length} xe)</div>
        <div className="overflow-x-auto">
          <table className="mgmt-table">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="text-left">Hình ảnh</th>
                <th className="text-left">Biển số</th>
                <th className="text-left">Xe</th>
                <th className='text-left'>Loại xe</th>
                <th className="text-left">Trạng thái</th>
                <th className="text-left">Giá/ngày</th>
                <th className="text-left">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center py-8">Đang tải...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-8">Không có xe nào</td></tr>
              ) : (
                filtered.map((v) => (
                  <tr key={v._id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="p-2">
                      {v.images && v.images.length > 0 ? (
                        <img src={v.images[0]} alt="xe" className="w-12 h-8 object-cover rounded" />
                      ) : (
                        <div className="w-12 h-8 bg-gray-300 flex items-center justify-center rounded text-xs text-gray-500">No image</div>
                      )}
                    </td>
                    <td className="p-2 font-semibold" style={{ color: v.status === 'rented' ? '#ef4444' : v.status === 'maintenance' ? '#f59e42' : '#22c55e' }}>{v.licensePlate}</td>
                    <td className="p-2">{v.brand}</td>
                    <td className="p-2">{v.type}</td>
                    <td className="p-2">
                      <span className={`mgmt-badge ${v.status === 'available' ? 'completed' : v.status === 'rented' ? 'overdue' : 'active'}`}>{statusMap[v.status]?.label}</span>
                    </td>
                    <td className="p-2">{v.pricePerDay?.toLocaleString('vi-VN')} VND</td>
                    <td className="p-2 flex gap-2">
                      <button
                        className="mgmt-btn secondary"
                        title="Xem chi tiết"
                        onClick={() => {
                          setDetailVehicle(v);
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
                        className="mgmt-btn secondary"
                        title="Sửa"
                        onClick={() => {
                          setEditForm({
                            ...v,
                            pricePerDay: v.pricePerDay?.toString() || '',
                            images: [],
                            imagesOld: v.images || [],
                          });
                          setShowEdit(true);
                          setEditError('');
                        }}
                      >
                        <span role="img" aria-label="edit">✏️</span>
                      </button>
      {/* Modal sửa xe (giống modal thêm) */}
      {showEdit && editForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0" style={{ background: '#666666', opacity: 0.2 }}></div>
          <div className="relative bg-white text-gray-900 rounded-lg p-8 w-full max-w-lg shadow-lg border border-gray-200 z-10 animate-fade-in">
            <button className="absolute top-4 right-6 text-gray-400 hover:text-red-400 text-2xl" onClick={() => { setShowEdit(false); setEditForm(null); }}>&times;</button>
            <h2 className="text-2xl font-bold mb-6">Cập nhật xe</h2>
            <form onSubmit={handleEditVehicle} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block mb-1">Biển số xe *</label>
                  <input name="licensePlate" value={editForm.licensePlate} onChange={handleEditChange} required className="border border-gray-300 rounded px-3 py-2 w-full bg-white text-gray-900 focus:bg-gray-50" />
                </div>
                <div>
                  <label className="block mb-1">Loại xe *</label>
                  <input name="type" value={editForm.type} onChange={handleEditChange} required className="border border-gray-300 rounded px-3 py-2 w-full bg-white text-gray-900 focus:bg-gray-50" />
                </div>
                <div>
                  <label className="block mb-1">Hãng xe *</label>
                  <input name="brand" value={editForm.brand} onChange={handleEditChange} required className="border border-gray-300 rounded px-3 py-2 w-full bg-white text-gray-900 focus:bg-gray-50" />
                </div>
                <div>
                  <label className="block mb-1">Giá thuê/ngày (VND) *</label>
                  <input name="pricePerDay" value={editForm.pricePerDay} onChange={handleEditChange} required type="number" min={0} className="border border-gray-300 rounded px-3 py-2 w-full bg-white text-gray-900 focus:bg-gray-50" />
                </div>
                <div>
                  <label className="block mb-1">Trạng thái *</label>
                  <select name="status" value={editForm.status} onChange={handleEditChange} className="border border-gray-300 rounded px-3 py-2 w-full bg-white text-gray-900">
                    <option value="available">Sẵn sàng</option>
                    <option value="rented">Đang thuê</option>
                    <option value="maintenance">Bảo trì</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1">Ảnh xe</label>
                  <button
                    type="button"
                    className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg w-full py-3 bg-white text-gray-400 hover:text-red-500 hover:border-red-400 transition-colors"
                    style={{ maxWidth: 120, margin: '0 auto' }}
                    onClick={() => document.getElementById('vehicle-edit-image-input')?.click()}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 mb-1">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75v-7.5A2.25 2.25 0 014.5 6h15a2.25 2.25 0 012.25 2.25v7.5A2.25 2.25 0 0119.5 18h-15A2.25 2.25 0 012.25 15.75z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 9V6.75A2.25 2.25 0 019 4.5h6a2.25 2.25 0 012.25 2.25V9" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15.75a3 3 0 100-6 3 3 0 000 6z" />
                    </svg>
                    <span className="font-medium text-xs">Chọn ảnh</span>
                  </button>
                  <input
                    id="vehicle-edit-image-input"
                    name="images"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleEditChange}
                    className="hidden"
                  />
                  {editForm.images && editForm.images.length > 0
                    ? (
                      <div className="mt-2 flex flex-wrap gap-2 justify-center">
                        {editForm.images.map((file: File, idx: number) => (
                          <img
                            key={idx}
                            src={URL.createObjectURL(file)}
                            alt={`preview-edit-${idx}`}
                            className="w-14 h-10 object-cover rounded border border-gray-200"
                          />
                        ))}
                      </div>
                    )
                    : (editForm.imagesOld && editForm.imagesOld.length > 0) && (
                      <div className="mt-2 flex flex-wrap gap-2 justify-center">
                        {editForm.imagesOld.map((url: string, idx: number) => (
                          <img
                            key={idx}
                            src={url}
                            alt={`preview-old-${idx}`}
                            className="w-14 h-10 object-cover rounded border border-gray-200"
                          />
                        ))}
                      </div>
                    )}
                </div>
              </div>
              {editError && <div className="text-red-500 text-sm text-center">{editError}</div>}
              <div className="flex justify-end gap-4 mt-6">
                <button type="button" className="px-6 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300" onClick={() => { setShowEdit(false); setEditForm(null); }}>Hủy</button>
                <button type="submit" className="px-6 py-2 rounded bg-red-600 text-white hover:bg-red-700" disabled={editLoading}>{editLoading ? 'Đang lưu...' : 'Lưu'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showDetail && detailVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0" style={{ background: '#666666', opacity: 0.2 }}></div>
          <div className="relative bg-white text-gray-900 rounded-lg p-8 w-full max-w-2xl shadow-lg border border-gray-200 z-10 animate-fade-in">
            <button
              className="absolute top-4 right-6 text-gray-400 hover:text-red-400 text-2xl"
              onClick={() => { setShowDetail(false); setDetailVehicle(null); }}
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-4">Chi tiết xe</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="mb-2"><span className="font-semibold">Biển số:</span> {detailVehicle.licensePlate}</div>
                <div className="mb-2"><span className="font-semibold">Hãng xe:</span> {detailVehicle.brand}</div>
                <div className="mb-2"><span className="font-semibold">Loại xe:</span> {detailVehicle.type}</div>
                <div className="mb-2">
                  <span className="font-semibold">Trạng thái:</span>{' '}
                  <span className={`mgmt-badge ${detailVehicle.status === 'available' ? 'completed' : detailVehicle.status === 'rented' ? 'overdue' : 'active'}`}>
                    {statusMap[detailVehicle.status]?.label}
                  </span>
                </div>
                <div className="mb-2"><span className="font-semibold">Giá/ngày:</span> {detailVehicle.pricePerDay?.toLocaleString('vi-VN')} VND</div>
              </div>
              <div>
                <div className="font-semibold mb-2">Hình ảnh</div>
                {detailVehicle.images && detailVehicle.images.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {detailVehicle.images.map((url: string, idx: number) => (
                      <img key={idx} src={url} alt={`vehicle-${idx}`} className="w-24 h-16 object-cover rounded border border-gray-200" />
                    ))}
                  </div>
                ) : (
                  <div className="w-full h-16 bg-gray-100 border border-gray-200 rounded flex items-center justify-center text-sm text-gray-500">Không có ảnh</div>
                )}
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                className="px-6 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                onClick={() => { setShowDetail(false); setDetailVehicle(null); }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
                      <button
    className="mgmt-btn destructive"
    title="Xóa"
    onClick={() => handleDeleteVehicle(v._id)}
    disabled={deleteLoading}
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
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VehicleManagement;
