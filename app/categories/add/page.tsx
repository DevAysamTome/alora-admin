"use client";
import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../../services/firebase';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '../../../components/ProtectedRoute';

export default function AddCategoryPage() {
  const [name, setName] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null); // ملف الصورة
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  // دالة لاختيار ملف الصورة
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let downloadURL = '';

      // إذا اختار المستخدم صورة، ارفعها واحصل على رابطها
      if (imageFile) {
        // 1) أنشئ مرجعًا في Storage (مسار الحفظ)
        const storageRef = ref(storage, `categories/${Date.now()}_${imageFile.name}`);
        // 2) ارفع الملف
        await uploadBytes(storageRef, imageFile);
        // 3) احصل على رابط التحميل
        downloadURL = await getDownloadURL(storageRef);
      }

      // 4) أضف المستند إلى Firestore
      await addDoc(collection(db, 'categories'), {
        name,
        imageUrl: downloadURL, // تخزين رابط التحميل
      });

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
          {/* حقل اسم الصنف */}
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

          {/* حقل اختيار الصورة */}
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
