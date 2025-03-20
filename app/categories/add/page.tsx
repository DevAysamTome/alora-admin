'use client';

import { useState } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../../services/firebase';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '../../../components/ProtectedRoute';

export default function AddCategoryPage() {
  const [name, setName] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // اختيار ملف الصورة
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('يرجى إدخال اسم الصنف');
      return;
    }

    setLoading(true);

    try {
      // استخدام اسم الصنف مباشرةً كمعرّف للمستند
      // يُمكنك تعديل هذا السطر لتحويل الاسم إلى slug إن رغبت (مثلاً: name.trim().toLowerCase().replace(/\s+/g, '-'))
      const categoryId = name.trim();
      const categoryRef = doc(db, 'categories', categoryId);

      // تحقق إن كان هناك صنف بنفس الاسم (بمعرّف مطابق)
      const docSnap = await getDoc(categoryRef);
      if (docSnap.exists()) {
        alert('يوجد صنف بهذا الاسم بالفعل!');
        setLoading(false);
        return;
      }

      // ارفع الصورة إن وُجدت
      let downloadURL = '';
      if (imageFile) {
        const storageRef = ref(storage, `categories/${Date.now()}_${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        downloadURL = await getDownloadURL(storageRef);
      }

      // أنشئ المستند بمعرّف الصنف (اسم الصنف)
      await setDoc(categoryRef, {
        name: name.trim(),
        imageUrl: downloadURL,
      });

      alert('تم إضافة الصنف بنجاح!');
      router.push('/categories'); // العودة لقائمة الأصناف
    } catch (error) {
      console.error('خطأ في إضافة الصنف:', error);
      alert('حدث خطأ أثناء إضافة الصنف.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-md mx-auto bg-white p-6 rounded shadow mt-6">
        <h1 className="text-xl font-bold mb-4">إضافة صنف جديد</h1>
        <form onSubmit={handleAddCategory} className="space-y-4">
          {/* اسم الصنف */}
          <div>
            <label className="block mb-1 text-gray-700">اسم الصنف:</label>
            <input
              type="text"
              className="border w-full px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              سيُستخدم اسم الصنف كمعرّف للمستند في Firestore. لا يمكن تكراره.
            </p>
          </div>

          {/* اختيار الصورة */}
          <div>
            <label className="block mb-1 text-gray-700">الصورة:</label>
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
              اختر صورة للصنف (png أو jpg).
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            {loading ? 'جاري الإضافة...' : 'إضافة الصنف'}
          </button>
        </form>
      </div>
    </ProtectedRoute>
  );
}
