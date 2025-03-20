'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import ProtectedRoute from '../../components/ProtectedRoute';
import Link from 'next/link';

export default function PromoImagesPage() {
  const [promoImages, setPromoImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchPromoImages = async () => {
      try {
        setLoading(true);
        const querySnapshot = await getDocs(collection(db, 'promo-images'));
        const fetchedImages = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPromoImages(fetchedImages);
      } catch (error) {
        console.error('خطأ في جلب الصور الترويجية:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPromoImages();
  }, []);

  const handleDelete = async (id: string) => {
    const confirmDelete = confirm("هل أنت متأكد أنك تريد حذف هذه الصورة؟");
    if (!confirmDelete) return;
    try {
      await deleteDoc(doc(db, 'promo-images', id));
      setPromoImages((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error('خطأ في حذف الصورة الترويجية:', error);
      alert('حدث خطأ أثناء حذف الصورة.');
    }
  };

  const filteredImages = promoImages.filter(img => 
    img.title?.toLowerCase().includes(search.toLowerCase()) || 
    img.id?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ProtectedRoute>
      <div className="bg-white p-6 rounded shadow">
        {/* العنوان وشريط الأدوات */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
          <h1 className="text-xl font-bold">إدارة الصور الترويجية</h1>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="ابحث عن صورة..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-400 w-full md:w-64"
            />
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              طباعة
            </button>
            <Link
              href="/promo-images/add"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              إضافة صورة جديدة
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-4">
            <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredImages.length === 0 ? (
          <p className="text-center text-gray-500">لا توجد صور مطابقة للبحث.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-lg shadow divide-y divide-gray-200">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-2 text-left text-gray-600 font-semibold">معرّف الصورة</th>
                  <th className="px-4 py-2 text-left text-gray-600 font-semibold">الصورة</th>
                  <th className="px-4 py-2 text-left text-gray-600 font-semibold">العنوان</th>
                  <th className="px-4 py-2 text-left text-gray-600 font-semibold">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredImages.map((img) => (
                  <tr key={img.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2 whitespace-nowrap">{img.id}</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {img.imageUrl ? (
                        <img src={img.imageUrl} alt={img.title} className="w-16 h-16 object-cover rounded" />
                      ) : (
                        <span className="text-gray-400">لا توجد صورة</span>
                      )}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">{img.title}</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="flex gap-2">
                        <Link
                          href={`/promo-images/${img.id}`}
                          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                        >
                          تعديل
                        </Link>
                        <button
                          onClick={() => handleDelete(img.id)}
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
