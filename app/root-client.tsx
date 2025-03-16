"use client";
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Topbar from '@/components/Topbar';
import Sidebar from '@/components/Sidebar';

export default function RootClient({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  function toggleSidebar(open?: boolean) {
    if (typeof open === 'boolean') {
      setSidebarOpen(open);
    } else {
      setSidebarOpen(!sidebarOpen);
    }
  }

  // إغلاق الشريط كلما تغيّر المسار
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <>
      {/* نفترض أن Topbar عنده onToggleSidebar أيضًا */}
      <Topbar onToggleSidebar={toggleSidebar} isSidebarOpen={sidebarOpen} />

      <div className="min-h-screen block md:flex">
  <Sidebar isOpen={sidebarOpen} onToggleSidebar={toggleSidebar} />
  <main className="flex-1 p-6">{children}</main>
</div>

    </>
  );
}
