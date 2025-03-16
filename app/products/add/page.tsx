"use client";

import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../../services/firebase';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '../../../components/ProtectedRoute';

interface CategoryData {
  id: string;
  name: string;
  imageUrl?: string;
}

export default function AddProductPage() {
  // الحقول الرئيسية
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);

  // الأحجام
  const [sizes, setSizes] = useState<string[]>([]);
  const [newSize, setNewSize] = useState('');

  // ملف الصورة
  const [imageFile, setImageFile] = useState<File | null>(null);

  // الأصناف
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(''); // الصنف المختار

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // جلب الأصناف من Firestore
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const snap = await getDocs(collection(db, 'categories'));
        const cats: CategoryData[] = snap.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name || '',
          imageUrl: doc.data().imageUrl || '',
        }));
        setCategories(cats);
      } catch (error) {
        console.error('خطأ في جلب الأصناف:', error);
      }
    };

    fetchCategories();
  }, []);

  // إضافة حجم جديد إلى المصفوفة
  const handleAddSize = () => {
    if (newSize.trim()) {
      setSizes((prev) => [...prev, newSize.trim()]);
      setNewSize('');
    }
  };

  // حذف حجم من المصفوفة
  const handleRemoveSize = (sizeToRemove: string) => {
    setSizes((prev) => prev.filter((size) => size !== sizeToRemove));
  };

  // اختيار ملف الصورة
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  // إضافة المنتج
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // حساب السعر بعد الخصم
      const discountedPrice = price - (price * discount) / 100;

      // رفع الصورة (إن وجدت) والحصول على رابطها
      let downloadURL = '';
      if (imageFile) {
        const storageRef = ref(storage, `products/${Date.now()}_${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        downloadURL = await getDownloadURL(storageRef);
      }

      // إضافة المستند إلى Firestore
      await addDoc(collection(db, 'products'), {
        name,
        price,
        discount,
        sizes,
        imageURL: downloadURL, // رابط الصورة
        categoryId: selectedCategoryId, // معرّف الصنف
      });

      // العودة لقائمة المنتجات
      router.push('/products');
    } catch (error) {
      console.error('خطأ في إضافة المنتج:', error);
      alert('حدث خطأ أثناء إضافة المنتج.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-md mx-auto bg-white p-6 rounded shadow mt-6">
        <h1 className="text-xl font-bold mb-4">إضافة منتج جديد</h1>
        <form onSubmit={handleAddProduct} className="space-y-4">
          {/* اسم المنتج */}
          <div>
            <label className="block mb-1 text-gray-700">اسم المنتج:</label>
            <input
              type="text"
              className="border w-full px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* السعر */}
          <div>
            <label className="block mb-1 text-gray-700">السعر:</label>
            <input
              type="number"
              className="border w-full px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              required
            />
          </div>

          {/* الخصم */}
          <div>
            <label className="block mb-1 text-gray-700">الخصم (%):</label>
            <input
              type="number"
              className="border w-full px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
            />
            <p className="text-sm text-gray-500 mt-1">
              أدخل قيمة الخصم كنسبة مئوية (مثلاً 10 يعني 10%).
            </p>
          </div>

          {/* الأحجام */}
          <div>
            <label className="block mb-1 text-gray-700">الأحجام:</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                className="border px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-blue-400 flex-1"
                placeholder="أدخل حجمًا جديدًا"
                value={newSize}
                onChange={(e) => setNewSize(e.target.value)}
              />
              <button
                type="button"
                onClick={handleAddSize}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                إضافة
              </button>
            </div>
            {sizes.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <div
                    key={size}
                    className="flex items-center bg-gray-100 border rounded px-2 py-1"
                  >
                    <span className="mr-2">{size}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSize(size)}
                      className="text-red-500 hover:text-red-700"
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* اختيار الصنف */}
          <div>
            <label className="block mb-1 text-gray-700">اختر الصنف:</label>
            <select
              className="border w-full px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              required
            >
              <option value="">اختر الصنف</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">
              تم جلب هذه الأصناف من قاعدة البيانات.
            </p>
          </div>

          {/* رفع الصورة */}
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
              اختر صورة للمنتج (png أو jpg).
            </p>
          </div>

          {/* زر الإضافة */}
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            {loading ? 'جاري الإضافة...' : 'إضافة المنتج'}
          </button>
        </form>
      </div>
    </ProtectedRoute>
  );
}
