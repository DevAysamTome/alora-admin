'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import ProtectedRoute from '../../../components/ProtectedRoute';

export default function OrderDetailPage() {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('name'); // 'name', 'price', 'quantity'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc', 'desc'

  const params = useParams();
  const router = useRouter();
  const { id } = params as { id: string };

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const docRef = doc(db, 'orders', id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          alert('الطلب غير موجود!');
          router.push('/orders');
          return;
        }

        setOrder({ id: docSnap.id, ...docSnap.data() });
      } catch (error) {
        console.error('خطأ في جلب تفاصيل الطلب:', error);
        alert('حدث خطأ أثناء جلب تفاصيل الطلب.');
        router.push('/orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, router]);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex justify-center items-center h-64">
          <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!order) {
    return null; // تمت إعادة التوجيه أو لا يوجد طلب
  }

  const { name, phoneNumber, address, status, total, cartItems } = order;
  const { area, city, street, village } = address || {};  // استخراج تفاصيل العنوان من كائن address

  const sortItems = (items: any[]) => {
    if (!items) return [];
    return [...items].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'quantity':
          comparison = a.quantity - b.quantity;
          break;
        default:
          comparison = 0;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  return (
    <ProtectedRoute>
      <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow mt-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold">تفاصيل الطلب #{order.id.split('-')[0]}</h1>
          <button
            onClick={() => window.print()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
            </svg>
            طباعة
          </button>
        </div>

        {/* معلومات الطلب الأساسية */}
        <div className="mb-6 space-y-3">
          <div className="flex items-center justify-between">
            <p><span className="font-semibold">رقم الطلب:</span> #{order.id.split('-')[0]}</p>
            <span className={`px-3 py-1 rounded-full text-sm font-medium
              ${status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                status === 'completed' ? 'bg-green-100 text-green-800' : 
                status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                'bg-gray-100 text-gray-800'}`}>
              {status}
            </span>
          </div>
          <p><span className="font-semibold">اسم العميل:</span> {name}</p>
          <p><span className="font-semibold">رقم الهاتف:</span> {phoneNumber}</p>
          <p><span className="font-semibold">الإجمالي:</span> {total} شيكل</p>
        </div>

        {/* Address Card */}
        <div className="mb-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <h2 className="text-lg font-semibold text-gray-700">عنوان التوصيل</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-600">المنطقة:</span>
                <span className="font-medium text-gray-900">{area}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-600">المدينة:</span>
                <span className="font-medium text-gray-900">{city}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-600">القرية:</span>
                <span className="font-medium text-gray-900">{village}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-600">الشارع:</span>
                <span className="font-medium text-gray-900">{street}</span>
              </div>
            </div>
          </div>
        </div>

        {/* عرض العناصر المشتراة في الطلب */}
        {cartItems && cartItems.length > 0 ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-4">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="name">الاسم</option>
                  <option value="price">السعر</option>
                  <option value="quantity">الكمية</option>
                </select>
                <button
                  onClick={toggleSortOrder}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              <div className="text-sm text-gray-600">
                عدد العناصر: {cartItems.length}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 rounded-lg shadow divide-y divide-gray-200">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-2 text-right text-gray-600 font-semibold">#</th>
                    <th className="px-4 py-2 text-right text-gray-600 font-semibold">اسم المنتج</th>
                    <th className="px-4 py-2 text-right text-gray-600 font-semibold">صورة المنتج</th>
                    <th className="px-4 py-2 text-right text-gray-600 font-semibold">السعر</th>
                    <th className="px-4 py-2 text-right text-gray-600 font-semibold">الكمية</th>
                    <th className="px-4 py-2 text-right text-gray-600 font-semibold">المجموع الفرعي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sortItems(cartItems).map((item: any, index: number) => {
                    const subtotal = item.price * item.quantity;
                    return (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-2 whitespace-nowrap text-gray-500">{index + 1}</td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{item.name}</div>
                        </td>
                        <td>
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-16 h-16 object-cover rounded shadow-sm"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                              <span className="text-gray-400 text-sm">لا توجد صورة</span>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-gray-700">{item.price} شيكل</td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {item.quantity}
                          </span>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap font-medium text-gray-900">{subtotal} شيكل</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={5} className="px-4 py-3 text-right font-semibold">المجموع الكلي:</td>
                    <td className="px-4 py-3 font-bold text-blue-600">{total} شيكل</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="mt-2 text-gray-500">لا توجد عناصر في هذا الطلب.</p>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
