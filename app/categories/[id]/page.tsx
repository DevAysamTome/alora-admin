"use client";

import { useState, useEffect, FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../../services/firebase';
import ProtectedRoute from '../../../components/ProtectedRoute';

export default function EditCategoryPage() {
  const [name, setName] = useState('');
  const [oldImageUrl, setOldImageUrl] = useState(''); // رابط الصورة القديمة من Firestore
  const [imageFile, setImageFile] = useState<File | null>(null); // الملف الجديد
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const params = useParams();
  const { id } = params as { id: string };

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const docRef = doc(db, 'categories', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const categoryData = docSnap.data();
          setName(categoryData.name || '');
          setOldImageUrl(categoryData.imageUrl || '');
        } else {
          alert('الصنف غير موجود!');
          router.push('/categories');
        }
      } catch (error) {
        console.error('خطأ في جلب الصنف:', error);
        alert('حدث خطأ أثناء جلب الصنف.');
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [id, router]);

  // دالة لاختيار الملف من input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const docRef = doc(db, 'categories', id);

      // إذا اختار المستخدم ملفًا جديدًا، ارفعه واحصل على رابط التحميل
      let newImageUrl = oldImageUrl; // الافتراضي هو الرابط القديم
      if (imageFile) {
        const storageRef = ref(storage, `categories/${Date.now()}_${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        newImageUrl = await getDownloadURL(storageRef);
      }

      // حدّث المستند في Firestore
      await updateDoc(docRef, {
        name,
        imageUrl: newImageUrl, // استخدم الرابط الجديد إن وجد، وإلا القديم
      });
      router.push('/categories');
    } catch (error) {
      console.error('خطأ في تحديث الصنف:', error);
      alert('حدث خطأ أثناء تحديث الصنف.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex justify-center items-center h-64">
          <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="max-w-md mx-auto bg-white p-6 rounded shadow mt-6">
        <h1 className="text-xl font-bold mb-4">تعديل الصنف</h1>
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block mb-1 text-gray-700">اسم الصنف:</label>
            <input
              type="text"
              className="border w-full px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-700">الصورة الحالية:</label>
            {oldImageUrl ? (
              <img src={oldImageUrl} alt="Category" className="w-32 h-32 object-cover mb-2" />
            ) : (
              <p className="text-sm text-gray-500 mb-2">لا توجد صورة قديمة.</p>
            )}
          </div>

          <div>
            <label className="block mb-1 text-gray-700">اختر صورة جديدة (اختياري):</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                         file:rounded file:border-0
                         file:text-sm file:font-semibold
                         file:bg-blue-50 file:text-blue-700
                         hover:file:bg-blue-100"
            />
            <p className="text-sm text-gray-500 mt-1">
              إذا لم تختر صورة جديدة، ستبقى الصورة القديمة كما هي.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            {loading ? 'جاري التحديث...' : 'تحديث الصنف'}
          </button>
        </form>
      </div>
    </ProtectedRoute>
  );
}
