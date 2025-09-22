import React from 'react';
import './HeaderDashboard.css';
const HeaderDashboard: React.FC = () => {
  const currentDate = new Date().toLocaleString('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).replace(' lúc ', ', ');

  return (
    <div className="bg-white p-4 shadow-md flex justify-between items-center">
      <h2 className="text-xl font-bold text-gray-800">Moto Rental Pro</h2>
      <div className="text-gray-600 text-sm">
        Hôm nay, {currentDate}
      </div>
      <div className="flex items-center">
        <span className="text-gray-700 mr-2">Nguyễn Văn Admin - Quản trị viên</span>
        <span className="text-red-500">🔔</span>
      </div>
    </div>
  );
};

export default HeaderDashboard;