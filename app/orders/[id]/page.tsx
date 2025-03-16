'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import ProtectedRoute from '../../../components/ProtectedRoute';

export default function OrderDetailPage() {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  const { name, phoneNumber, addressLocation, status, total, cartItems } = order;

  return (
    <ProtectedRoute>
      <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow mt-6">
        <h1 className="text-xl font-bold mb-4">تفاصيل الطلب</h1>

        {/* معلومات الطلب الأساسية */}
        <div className="mb-6">
          <p><span className="font-semibold">رقم الطلب:</span> {order.id}</p>
          <p><span className="font-semibold">اسم العميل:</span> {name}</p>
          <p><span className="font-semibold">رقم الهاتف:</span> {phoneNumber}</p>
          <p><span className="font-semibold">عنوان التوصيل:</span> {addressLocation}</p>
          <p><span className="font-semibold">الحالة:</span> {status}</p>
          <p><span className="font-semibold">الإجمالي:</span> {total} شيكل</p>
        </div>

        {/* عرض العناصر المشتراة في الطلب */}
        {cartItems && cartItems.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-lg shadow divide-y divide-gray-200">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-2 text-left text-gray-600 font-semibold">اسم المنتج</th>
                  <th className="px-4 py-2 text-left text-gray-600 font-semibold">صورة المنتج</th>
                  <th className="px-4 py-2 text-left text-gray-600 font-semibold">السعر</th>
                  <th className="px-4 py-2 text-left text-gray-600 font-semibold">الكمية</th>
                  <th className="px-4 py-2 text-left text-gray-600 font-semibold">المجموع الفرعي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {cartItems.map((item: any, index: number) => {
                  const subtotal = item.price * item.quantity;
                  return (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-2 whitespace-nowrap">{item.name}</td>
                      <td>
  {item.imageUrl ? (
    <img
      src={item.imageUrl}
      alt={item.name}
      className="w-16 h-16 object-cover rounded"
    />
  ) : (
    <span className="text-gray-400">لا توجد صورة</span>
  )}
</td>
                      <td className="px-4 py-2 whitespace-nowrap">{item.price} شيكل</td>
                      <td className="px-4 py-2 whitespace-nowrap">{item.quantity}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{subtotal} شيكل</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">لا توجد عناصر في هذا الطلب.</p>
        )}
      </div>
    </ProtectedRoute>
  );
}
