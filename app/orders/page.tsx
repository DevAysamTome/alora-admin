"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import ProtectedRoute from "../../components/ProtectedRoute";
import Link from "next/link";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // جلب الطلبات من Firestore
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const querySnapshot = await getDocs(collection(db, "orders"));
        const fetchedOrders = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOrders(fetchedOrders);
      } catch (error) {
        console.error("خطأ في جلب الطلبات:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // تصفية الطلبات حسب البحث
  const filteredOrders = orders.filter(
    (order) =>
      order.name?.toLowerCase().includes(search.toLowerCase()) ||
      order.id?.toLowerCase().includes(search.toLowerCase()) ||
      order.phoneNumber?.toLowerCase().includes(search.toLowerCase())
  );

  // دالة لطباعة الصفحة (وبالتالي طباعة الجدول ضمنها)
  const handlePrint = () => {
    window.print();
  };

  // دالة لتبديل حالة الطلب بين "مكتمل" و"قيد التنفيذ"
  const toggleOrderStatus = async (orderId: string, currentStatus: string) => {
    // إذا كانت الحالة "مكتمل" نعيدها إلى "قيد التنفيذ"، وبالعكس
    const newStatus = currentStatus === "مكتمل" ? "قيد التنفيذ" : "مكتمل";

    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { status: newStatus });

      // تحديث الحالة في الواجهة محليًا
      setOrders((prevOrders) =>
        prevOrders.map((o) =>
          o.id === orderId ? { ...o, status: newStatus } : o
        )
      );
    } catch (error) {
      console.error("خطأ في تحديث حالة الطلب:", error);
      alert("حدث خطأ أثناء تحديث حالة الطلب.");
    }
  };

  return (
    <ProtectedRoute>
      <div className="bg-white p-6 rounded shadow">
        {/* العنوان وشريط الأدوات */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
          <h1 className="text-xl font-bold">إدارة الطلبات</h1>

          <div className="flex items-center gap-2">
            {/* مربع البحث */}
            <input
              type="text"
              placeholder="ابحث عن طلب..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-400 w-full md:w-64"
            />
            {/* زر الطباعة */}
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              طباعة الطلبات
            </button>
          </div>
        </div>

        {/* حالة التحميل */}
        {loading ? (
          <div className="flex justify-center items-center py-4">
            {/* دائرة انتظار بسيطة */}
            <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <p className="text-center text-gray-500">
            لا توجد طلبات مطابقة للبحث.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-lg shadow divide-y divide-gray-200">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-2 text-left text-gray-600 font-semibold">
                    رقم الطلب
                  </th>
                  <th className="px-4 py-2 text-left text-gray-600 font-semibold">
                    اسم العميل
                  </th>
                  <th className="px-4 py-2 text-left text-gray-600 font-semibold">
                    رقم الهاتف
                  </th>
                  <th className="px-4 py-2 text-left text-gray-600 font-semibold">
                    عنوان التوصيل
                  </th>
                  <th className="px-4 py-2 text-left text-gray-600 font-semibold">
                    المجموع
                  </th>
                  <th className="px-4 py-2 text-left text-gray-600 font-semibold">
                    الحالة
                  </th>
                  <th className="px-4 py-2 text-left text-gray-600 font-semibold">
                    تفاصيل الطلب
                  </th>
                  <th className="px-4 py-2 text-left text-gray-600 font-semibold">
                    تغيير الحالة
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map((order,index) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-2 whitespace-nowrap">#{index + 1}</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {order.name}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {order.phoneNumber}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {order.addressLocation}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {order.total} شيكل
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {/* مثال لتلوين الحالة حسب قيمتها */}
                      {order.status === "مكتمل" ? (
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm">
                          مكتمل
                        </span>
                      ) : order.status === "قيد التنفيذ" ? (
                        <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-sm">
                          قيد التنفيذ
                        </span>
                      ) : (
                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                          غير معروف
                        </span>
                      )}
                    </td>
                    {/* رابط تفاصيل الطلب */}
                    <td className="px-4 py-2">
                      <Link
                        href={`/orders/${order.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        عرض التفاصيل
                      </Link>
                    </td>
                    {/* زر لتبديل الحالة */}
                    <td className="px-4 py-2">
                      {order.status === "مكتمل" ? (
                        <button
                          onClick={() =>
                            toggleOrderStatus(order.id, order.status)
                          }
                          className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                        >
                          إعادته لقيد التنفيذ
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            toggleOrderStatus(order.id, order.status)
                          }
                          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                        >
                          إكمال الطلب
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
