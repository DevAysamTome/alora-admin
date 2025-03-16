"use client";
import { MdMenu, MdClose } from 'react-icons/md';

interface TopbarProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export default function Topbar({ onToggleSidebar, isSidebarOpen }: TopbarProps) {
  return (
    <header
      className="
        flex items-center justify-between 
        px-4 py-3 shadow bg-white 
        md:hidden   /* مخفي في الشاشات المتوسطة فأعلى إذا أردت */
        z-50        /* لضمان ظهوره فوق الشريط الجانبي */
      "
    >
      {/* زر الهامبرغر أو الإغلاق */}
      <button onClick={onToggleSidebar} className="text-gray-700">
        {isSidebarOpen ? <MdClose size={24} /> : <MdMenu size={24} />}
      </button>

      <h1 className="font-bold text-xl text-gray-700">لوحة التحكم</h1>

      {/* مساحة لعناصر أخرى (تنبيهات، حساب...) */}
      <div className="space-x-2">{/* ... */}</div>
    </header>
  );
}
