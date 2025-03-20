'use client';

import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db, storage } from '../../../services/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { useRouter } from 'next/navigation';

export default function AddBrandPage() {
  const [name, setName] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // جلب الأصناف من Firestore لاستخدامها في اختيار الصنف للعلامة التجارية
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'categories'));
        const fetchedCategories = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCategories(fetchedCategories);
      } catch (error) {
        console.error('خطأ في جلب الأصناف:', error);
      }
    };

    fetchCategories();
  }, []);

  // التعامل مع اختيار الملف للصورة
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) {
      alert("يرجى اختيار الصنف للعلامة التجارية.");
      return;
    }
    setLoading(true);
    try {
      let imageUrl = "";
      if (imageFile) {
        // رفع الصورة إلى Firebase Storage
        const storageRef = ref(storage, `brands/${new Date().getTime()}_${imageFile.name}`);
        const snapshot = await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(snapshot.ref);
      }
      // إضافة العلامة التجارية مع ربطها بالصنف المختار
      await addDoc(collection(db, 'brands'), {
        name,
        imageUrl,
        categoryId: selectedCategory,
      });
      router.push('/brands');
    } catch (error) {
      console.error('خطأ في إضافة العلامة التجارية:', error);
      alert('حدث خطأ أثناء إضافة العلامة التجارية.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="bg-white p-6 rounded shadow max-w-md mx-auto">
        <h1 className="text-xl font-bold mb-4">إضافة علامة تجارية جديدة</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">اسم العلامة التجارية</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="border border-gray-300 rounded px-3 py-2 w-full"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700">اختر الصنف</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              required
              className="border border-gray-300 rounded px-3 py-2 w-full"
            >
              <option value="">-- اختر الصنف --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700">تحميل الصورة</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="border border-gray-300 rounded px-3 py-2 w-full"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors w-full"
          >
            {loading ? 'جاري الإضافة...' : 'إضافة العلامة التجارية'}
          </button>
        </form>
      </div>
    </ProtectedRoute>
  );
}
