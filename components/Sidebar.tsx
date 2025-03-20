"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MdDashboard, MdShoppingCart, MdCategory, MdHome, MdClose, MdDiscount, MdBrandingWatermark } from 'react-icons/md';

interface SidebarProps {
  isOpen: boolean;
  onToggleSidebar: (open: boolean) => void; // <-- أضفنا هذا
}

const navItems = [
  { label: 'الرئيسية', href: '/', icon: MdHome },
  { label: 'الطلبات', href: '/orders', icon: MdShoppingCart },
  { label: 'المنتجات', href: '/products', icon: MdDashboard },
  { label: 'الأصناف', href: '/categories', icon: MdCategory },
  { label: 'صور العروض', href: '/promo-images', icon: MdDiscount },
  { label: 'العلامات التجارية', href: '/brands', icon: MdBrandingWatermark },

];

export default function Sidebar({ isOpen, onToggleSidebar }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
  className={`
    fixed top-0 bottom-0 right-0 z-40
    bg-white shadow-lg border-l border-gray-200
    transform transition-transform duration-300
    ${isOpen ? 'translate-x-0' : 'translate-x-full'}

    md:static md:translate-x-0 md:border-r md:w-64
  `}
>
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-center">لوحة التحكم</h2>
      </div>

      <nav className="p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href ? 'bg-gray-200' : '';
            return (
              <li key={item.href}>
                <Link
                onClick={() => onToggleSidebar(false)}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors ${active}`}
                >
                  <Icon className="text-xl" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* زر الإغلاق يظهر فقط على الشاشات الصغيرة */}
      <button
        onClick={() => onToggleSidebar(false)}
        className="md:hidden absolute top-4 left-4 text-gray-700"
      >
        <MdClose size={24} />
      </button>
    </aside>
  );
}
