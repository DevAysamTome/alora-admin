import './globals.css';
import { Metadata } from 'next';
import AuthWrapper from '../components/AuthWrapper';
import Footer from '../components/Footer';
import RootClient from './root-client'; // مكوّن عميل

export const metadata: Metadata = {
  title: 'لوحة التحكم تطبيق الورا',
  description: 'تصميم وبرمجة شركة تكنو كور 2025',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-gray-100 text-gray-800 min-h-screen">
        <AuthWrapper>
          {/* مكوّن عميل يحوي المنطق التفاعلي لفتح/إغلاق الشريط الجانبي */}
          <RootClient>
            {children}
          </RootClient>
          <Footer />
        </AuthWrapper>
      </body>
    </html>
  );
}
