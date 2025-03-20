'use client';

import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../../services/firebase';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '../../../components/ProtectedRoute';

export default function AddPromoImagePage() {
  const [title, setTitle] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleAddPromoImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('يرجى إدخال عنوان الصورة');
      return;
    }
    setLoading(true);
    try {
      let downloadURL = '';
      if (imageFile) {
        const storageRef = ref(storage, `promo-images/${Date.now()}_${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        downloadURL = await getDownloadURL(storageRef);
      }

      await addDoc(collection(db, 'promo-images'), {
        title: title.trim(),
        imageUrl: downloadURL,
      });

      alert('تم إضافة الصورة الترويجية بنجاح!');
      router.push('/promo-images');
    } catch (error) {
      console.error('خطأ في إضافة الصورة الترويجية:', error);
      alert('حدث خطأ أثناء إضافة الصورة الترويجية.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-md mx-auto bg-white p-6 rounded shadow mt-6">
        <h1 className="text-xl font-bold mb-4">إضافة صورة ترويجية جديدة</h1>
        <form onSubmit={handleAddPromoImage} className="space-y-4">
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
            <label className="block mb-1 text-gray-700">الصورة:</label>
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
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors w-full"
          >
            {loading ? 'جاري الإضافة...' : 'إضافة الصورة'}
          </button>
        </form>
      </div>
    </ProtectedRoute>
  );
}
