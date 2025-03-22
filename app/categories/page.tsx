'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import ProtectedRoute from '../../components/ProtectedRoute';
import Link from 'next/link';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // جلب الأصناف من Firestore
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const querySnapshot = await getDocs(collection(db, 'categories'));
        const fetchedCategories = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCategories(fetchedCategories);
      } catch (error) {
        console.error('خطأ في جلب الأصناف:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // البحث عن الصنف حسب الاسم أو الـ ID
  const filteredCategories = categories.filter((cat) =>
    cat.name?.toLowerCase().includes(search.toLowerCase()) ||
    cat.id?.toLowerCase().includes(search.toLowerCase())
  );

  // زر الطباعة
  const handlePrint = () => {
    window.print();
  };

  // حذف الصنف من Firestore
  const handleDelete = async (id: string) => {
    const confirmDelete = confirm('هل أنت متأكد أنك تريد حذف هذا الصنف؟');
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, 'categories', id));
      // تحديث القائمة بعد الحذف
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (error) {
      console.error('خطأ في حذف الصنف:', error);
      alert('حدث خطأ أثناء حذف الصنف.');
    }
  };

  return (
    <ProtectedRoute>
      <div className="bg-white p-6 rounded shadow">
        {/* العنوان وشريط الأدوات */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
          <h1 className="text-xl font-bold">إدارة الأصناف</h1>
          
          <div className="flex items-center gap-2">
            {/* مربع البحث */}
            <input
              type="text"
              placeholder="ابحث عن صنف..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-400 w-full md:w-64"
            />
            {/* زر الطباعة */}
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              طباعة الأصناف
            </button>
            {/* زر إضافة صنف جديد */}
            <Link
              href="/categories/add"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              إضافة صنف جديد
            </Link>
          </div>
        </div>

        {/* حالة التحميل */}
        {loading ? (
          <div className="flex justify-center items-center py-4">
            <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredCategories.length === 0 ? (
          <p className="text-center text-gray-500">لا توجد أصناف مطابقة للبحث.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-lg shadow divide-y divide-gray-200">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-2 text-left text-gray-600 font-semibold">رقم الصنف</th>
                  <th className="px-4 py-2 text-left text-gray-600 font-semibold">الصورة</th>
                  <th className="px-4 py-2 text-left text-gray-600 font-semibold">اسم الصنف</th>
                  <th className="px-4 py-2 text-left text-gray-600 font-semibold">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCategories.map((category) => (
                  <tr
                    key={category.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-2 whitespace-nowrap">{category.id}</td>
                    
                    {/* عرض الصورة (إن وجدت) */}
                    <td className="px-4 py-2 whitespace-nowrap">
                      {category.imageUrl ? (
                        <img
                          src={category.imageUrl}
                          alt={category.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      ) : (
                        <span className="text-gray-400">لا توجد صورة</span>
                      )}
                    </td>

                    <td className="px-4 py-2 whitespace-nowrap">{category.name}</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="flex gap-2">
                        {/* زر تعديل ينقلك للصفحة [id] مع ترميز المعرف لضمان سلامة الرابط */}
                        <Link
                          href={`/categories/${encodeURIComponent(category.id)}`}
                          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                        >
                          تعديل
                        </Link>
                        {/* زر حذف */}
                        <button
                          onClick={() => handleDelete(category.id)}
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
