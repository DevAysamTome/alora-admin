"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import ProtectedRoute from "../../components/ProtectedRoute";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const router = useRouter();

  // جلب المنتجات من Firestore
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const querySnapshot = await getDocs(collection(db, "products"));
        const fetchedProducts = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(fetchedProducts);
      } catch (error) {
        console.error("خطأ في جلب المنتجات:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // البحث عن المنتج حسب الاسم أو الـ ID
  const filteredProducts = products.filter(
    (product) =>
      product.name?.toLowerCase().includes(search.toLowerCase()) ||
      product.id?.toLowerCase().includes(search.toLowerCase())
  );

  // زر الطباعة
  const handlePrint = () => {
    window.print();
  };

  // حذف المنتج من Firestore
  const handleDelete = async (id: string) => {
    const confirmDelete = confirm("هل أنت متأكد أنك تريد حذف هذا المنتج؟");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "products", id));
      // تحديث القائمة بعد الحذف
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error("خطأ في حذف المنتج:", error);
      alert("حدث خطأ أثناء حذف المنتج.");
    }
  };

  return (
    <ProtectedRoute>
      <div className="bg-white p-6 rounded shadow">
        {/* العنوان وشريط الأدوات */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
          <h1 className="text-xl font-bold">إدارة المنتجات</h1>

          <div className="flex items-center gap-2">
            {/* مربع البحث */}
            <input
              type="text"
              placeholder="ابحث عن منتج..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-400 w-full md:w-64"
            />
            {/* زر الطباعة (اختياري) */}
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              طباعة المنتجات
            </button>
            {/* زر إضافة منتج جديد */}
            <Link
              href="/products/add"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              إضافة منتج جديد
            </Link>
          </div>
        </div>

        {/* حالة التحميل */}
        {loading ? (
          <div className="flex justify-center items-center py-4">
            <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <p className="text-center text-gray-500">
            لا توجد منتجات مطابقة للبحث.
          </p>
        ) : (
          // جدول المنتجات
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-lg shadow divide-y divide-gray-200">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-2 text-left text-gray-600 font-semibold">
                    رقم المنتج
                  </th>
                  <th className="px-4 py-2 text-left text-gray-600 font-semibold">
                    اسم المنتج
                  </th>
                  <th className="px-4 py-2 text-left text-gray-600 font-semibold">
                    صورة المنتج
                  </th>
                  <th className="px-4 py-2 text-left text-gray-600 font-semibold">
                    الخصم
                  </th>
                  <th className="px-4 py-2 text-left text-gray-600 font-semibold">
                    الاحجام
                  </th>
                  <th className="px-4 py-2 text-left text-gray-600 font-semibold">
                    السعر
                  </th>
                  <th className="px-4 py-2 text-left text-gray-600 font-semibold">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-2 whitespace-nowrap">
                      {product.id}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {product.name}
                    </td>
                    <td>
  {product.imageURL ? (
    <img
      src={product.imageURL}
      alt={product.name}
      className="w-16 h-16 object-cover rounded"
    />
  ) : (
    <span className="text-gray-400">لا توجد صورة</span>
  )}
</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {product.discount}%
                    </td>

                    {/* عرض الأحجام كقائمة مفصولة بفواصل */}
                    <td className="px-4 py-2 whitespace-nowrap">
                      {product.sizes && product.sizes.length > 0
                        ? product.sizes.join(", ")
                        : "لا توجد أحجام"}
                    </td>

                    <td className="px-4 py-2 whitespace-nowrap">
                      {product.price} شيكل
                    </td>

                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="flex gap-2">
                        {/* زر تعديل ينقلنا للصفحة [id] */}
                        <Link
                          href={`/products/${product.id}`}
                          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                        >
                          تعديل
                        </Link>
                        {/* زر حذف */}
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                        >
                          حذف
                        </button>
                      </div>
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
