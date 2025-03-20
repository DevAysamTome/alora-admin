'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { collection, getDocs } from 'firebase/firestore';
import { db, storage } from '../../../services/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { useRouter, useParams } from 'next/navigation';

export default function EditBrandPage() {
  const router = useRouter();
  const params = useParams();
  const brandId = params.id;

  const [name, setName] = useState('');
  const [existingImageUrl, setExistingImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // جلب الأصناف لاستخدامها في اختيار الصنف
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

  // جلب بيانات العلامة التجارية الحالية
  useEffect(() => {
    const fetchBrand = async () => {
      try {
        setFetching(true);
        const docRef = doc(db, 'brands', brandId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setName(data.name || '');
          setExistingImageUrl(data.imageUrl || '');
          setSelectedCategory(data.categoryId || '');
        } else {
          alert('العلامة التجارية غير موجودة.');
          router.push('/brands');
        }
      } catch (error) {
        console.error('خطأ في جلب العلامة التجارية:', error);
        alert('حدث خطأ أثناء جلب البيانات.');
      } finally {
        setFetching(false);
      }
    };

    if (brandId) {
      fetchBrand();
    }
  }, [brandId, router]);

  // التعامل مع اختيار ملف الصورة الجديد
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
      let imageUrl = existingImageUrl;
      if (imageFile) {
        // رفع الصورة الجديدة إلى Firebase Storage
        const storageRef = ref(storage, `brands/${new Date().getTime()}_${imageFile.name}`);
        const snapshot = await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(snapshot.ref);
      }
      // تحديث بيانات العلامة التجارية
      const docRef = doc(db, 'brands', brandId);
      await updateDoc(docRef, {
        name,
        imageUrl,
        categoryId: selectedCategory,
      });
      router.push('/brands');
    } catch (error) {
      console.error('خطأ في تحديث العلامة التجارية:', error);
      alert('حدث خطأ أثناء تحديث العلامة التجارية.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex justify-center items-center py-4">
        <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="bg-white p-6 rounded shadow max-w-md mx-auto">
        <h1 className="text-xl font-bold mb-4">تعديل العلامة التجارية</h1>
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
            <label className="block text-gray-700">تحميل صورة جديدة (اختياري)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="border border-gray-300 rounded px-3 py-2 w-full"
            />
            {existingImageUrl && !imageFile && (
              <div className="mt-2">
                <p className="text-gray-600">الصورة الحالية:</p>
                <img src={existingImageUrl} alt={name} className="w-32 h-32 object-cover rounded" />
              </div>
            )}
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors w-full"
          >
            {loading ? 'جاري التحديث...' : 'تحديث العلامة التجارية'}
          </button>
        </form>
      </div>
    </ProtectedRoute>
  );
}
