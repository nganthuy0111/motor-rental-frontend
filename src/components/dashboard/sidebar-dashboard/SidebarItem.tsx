import React from 'react';

interface SidebarItemProps {
  icon: string;
  text: string;
  active?: boolean;
  onClick?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, text, active, onClick }) => {
  return (
    <div
      className={`flex items-center p-3 cursor-pointer rounded ${active ? 'bg-red-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
      onClick={onClick}
    >
      <span className="mr-3 text-xl">{icon}</span>
      <span className="text-sm font-medium">{text}</span>
    </div>
  );
};

export default SidebarItem;