'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../../services/firebase';
import ProtectedRoute from '../../../components/ProtectedRoute';

export default function EditPromoImagePage() {
  const [title, setTitle] = useState('');
  const [oldImageURL, setOldImageURL] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const params = useParams();
  const { id } = params as { id: string };

  useEffect(() => {
    const fetchPromoImage = async () => {
      try {
        const docRef = doc(db, 'promo-images', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setTitle(data.title || '');
          setOldImageURL(data.imageUrl || '');
        } else {
          alert('الصورة الترويجية غير موجودة!');
          router.push('/promo-images');
        }
      } catch (error) {
        console.error('خطأ في جلب الصورة الترويجية:', error);
        alert('حدث خطأ أثناء جلب الصورة الترويجية.');
      } finally {
        setLoading(false);
      }
    };

    fetchPromoImage();
  }, [id, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const docRef = doc(db, 'promo-images', id);
      let newImageURL = oldImageURL;
      if (imageFile) {
        const storageRef = ref(storage, `promo-images/${Date.now()}_${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        newImageURL = await getDownloadURL(storageRef);
      }
      await updateDoc(docRef, {
        title,
        imageUrl: newImageURL,
      });
      alert('تم تحديث الصورة الترويجية بنجاح!');
      router.push('/promo-images');
    } catch (error) {
      console.error('خطأ في تحديث الصورة الترويجية:', error);
      alert('حدث خطأ أثناء تحديث الصورة الترويجية.');
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
        <h1 className="text-xl font-bold mb-4">تعديل الصورة الترويجية</h1>
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block mb-1 text-gray-700">عنوان الصورة:</label>
            <input
              type="text"
              className="border w-full px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1 text-gray-700">الصورة الحالية:</label>
            {oldImageURL ? (
              <img src={oldImageURL} alt="الصورة الترويجية" className="w-32 h-32 object-cover mb-2" />
            ) : (
              <p className="text-sm text-gray-500 mb-2">لا توجد صورة سابقة.</p>
            )}
          </div>
          <div>
            <label className="block mb-1 text-gray-700">اختر صورة جديدة (اختياري):</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            {loading ? 'جاري التحديث...' : 'تحديث الصورة'}
          </button>
        </form>
      </div>
    </ProtectedRoute>
  );
}
