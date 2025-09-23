import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './LoginPage.css';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  // const [error, setError] = useState('');
  // const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/users/login', {
        email,
        password,
      });
      toast.success('Đăng nhập thành công!', {
        position: 'top-center',
        autoClose: 1200,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        progress: undefined,
        theme: 'colored',
      });
      setTimeout(() => {
        navigate('/dashboard');
      }, 1200);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Đăng nhập thất bại!', {
        position: 'top-center',
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        progress: undefined,
        theme: 'colored',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="flex flex-col items-center justify-center w-full">
        <div className="mb-8 flex flex-col items-center">
          <div className="w-30 h-30  rounded flex items-center justify-center mb-2">
            <img src="./src/assets/logoMT.jpg"alt="logo" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mt-2">Thuê xe máy Đà Lạt - Minh Trung</h1>
          <p className="text-gray-500 mt-2 text-base">Chào mừng trở lại! Vui lòng đăng nhập vào tài khoản của bạn</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md flex flex-col items-center">
          <form className="w-full" onSubmit={handleSubmit}>
            <div className="mb-5 text-left w-full">
              <label className="block text-gray-700 text-base font-medium mb-1">Địa chỉ Email</label>
              <input
                type="email"
                placeholder="Nhập email của bạn"
                className="w-full p-3 border border-gray-300 rounded-md input-focus"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-5 text-left w-full">
              <label className="block text-gray-700 text-base font-medium mb-1">Mật khẩu</label>
              <input
                type="password"
                placeholder="Nhập mật khẩu của bạn"
                className="w-full p-3 border border-gray-300 rounded-md input-focus"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex justify-between items-center mb-5 w-full">
              <label className="flex items-center text-gray-700 text-sm">
                <input type="checkbox" className="mr-2" /> Nhớ tôi
              </label>
              <a href="#" className="text-red-500 text-sm hover:underline">Quên mật khẩu?</a>
            </div>
            {/* Toastify sẽ hiển thị thông báo, không cần hiển thị lỗi/success ở đây */}
            <ToastContainer />
            <button
              type="submit"
              className="w-full py-3 text-white font-semibold rounded-md gradient-button hover:opacity-90 transition text-lg"
              disabled={loading}
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
            </button>
            <p className="text-center text-gray-500 text-sm mt-5">
              Chưa có tài khoản? <a href="#" className="text-red-500 hover:underline">Đăng ký</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;