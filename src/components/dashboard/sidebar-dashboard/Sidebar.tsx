import React from "react";
import SidebarItem from "./SidebarItem";
import "./Sidebar.css";

interface SidebarProps {
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
}

const menuItems = [
  { icon: "📊", text: "Dashboard" },
  { icon: "🚗", text: "Quản lý xe" },
  { icon: "👥", text: "Khách hàng" },
  { icon: "📝", text: "Đơn thuê" },
  { icon: "📅", text: "Lịch trình" },
  { icon: "📈", text: "Báo cáo" },
  { icon: "⏳", text: "Log hoạt động" },
  { icon: "⚙️", text: "Cài đặt" },
];

const Sidebar: React.FC<SidebarProps> = ({ selectedTab, setSelectedTab }) => {
  return (
    <div className="w-64 h-screen bg-white shadow-lg p-4">
      <div className="mb-6">
        <div className="w-25 h-25  rounded flex items-center justify-center mb-2">
          <img
            src="https://scontent.fsgn2-9.fna.fbcdn.net/v/t39.30808-1/487918174_122130592664670845_4381871860685337387_n.jpg?stp=cp6_dst-jpg_s200x200_tt6&_nc_cat=106&ccb=1-7&_nc_sid=2d3e12&_nc_ohc=vOq9oIfw5A4Q7kNvwHtc4lK&_nc_oc=AdkT-0_nBqyssilMiBhIvEPgc4jrmAvpuXnG3iQ8fG3B0k1ZCUd68WTdt8t-VY9svrY&_nc_zt=24&_nc_ht=scontent.fsgn2-9.fna&_nc_gid=2ghnHdI8FFeTx9IkkiHwyg&oh=00_AfbVNXxlsnqMYdF8D6acIWDdPD0oYiopksVANwuLu4ge6g&oe=68D7E350"
            alt="logo"
          />
        </div>
        <p className="text-xs text-gray-500 ">Hệ thống quản lý</p>
      </div>
      <div className="space-y-1">
        {menuItems.map((item, index) => (
          <SidebarItem
            key={index}
            icon={item.icon}
            text={item.text}
            active={selectedTab === item.text}
            onClick={() => setSelectedTab(item.text)}
          />
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
