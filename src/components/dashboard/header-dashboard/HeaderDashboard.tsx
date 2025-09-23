import React from "react";
import "./HeaderDashboard.css";
const HeaderDashboard: React.FC = () => {
  const currentDate = new Date()
    .toLocaleString("vi-VN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Ho_Chi_Minh",
    })
    .replace("  ", ", ");

  return (
    <div className="bg-white p-4 shadow-md flex justify-between items-center">
      <h2 className="text-xl font-bold text-gray-800">
        Thuê xe máy Đà Lạt - Minh Trung
      </h2>
      <div className="text-gray-600 text-sm">{currentDate}</div>
    </div>
  );
};

export default HeaderDashboard;
