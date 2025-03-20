"use client";

import { useState, useEffect, FormEvent } from 'react';
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

interface BrandData {
  id: string;
  name: string;
  imageUrl?: string;
}

// نوع لكل حجم
interface SizeOption {
  name: string;   // اسم الحجم
  price: number;  // سعر الحجم
}

export default function AddProductPage() {
  // الحقول الرئيسية للمنتج
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [description, setDescription] = useState('');

  // الحقلان الجديدان
  const [quantity, setQuantity] = useState<number>(0);      // الكمية المتوفرة
  const [isAvailable, setIsAvailable] = useState<boolean>(true); // هل المنتج متاح؟

  // الأحجام (كمصفوفة من الكائنات)
  const [sizes, setSizes] = useState<SizeOption[]>([]);

  // الحقول المؤقتة لإضافة حجم جديد
  const [newSizeName, setNewSizeName] = useState('');
  const [newSizePrice, setNewSizePrice] = useState<number>(0);

  // ملف الصورة
  const [imageFile, setImageFile] = useState<File | null>(null);

  // الأصناف
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(''); // الصنف المختار

  // الماركات (اختياري)
  const [brands, setBrands] = useState<BrandData[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState<string>(''); // الماركة المختارة (اختياري)

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

  // جلب الماركات من Firestore
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const snap = await getDocs(collection(db, 'brands'));
        const fetchedBrands: BrandData[] = snap.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name || '',
          imageUrl: doc.data().imageUrl || '',
        }));
        setBrands(fetchedBrands);
      } catch (error) {
        console.error('خطأ في جلب الماركات:', error);
      }
    };

    fetchBrands();
  }, []);

  // إضافة حجم جديد إلى المصفوفة
  const handleAddSize = () => {
    if (newSizeName.trim()) {
      // ننشئ كائن الحجم
      const newSizeObj: SizeOption = {
        name: newSizeName.trim(),
        price: newSizePrice,
      };
      setSizes((prev) => [...prev, newSizeObj]);

      // إعادة تعيين الحقول
      setNewSizeName('');
      setNewSizePrice(0);
    }
  };

  // حذف حجم من المصفوفة
  const handleRemoveSize = (sizeToRemove: SizeOption) => {
    setSizes((prev) => prev.filter((sz) => sz !== sizeToRemove));
  };

  // اختيار ملف الصورة
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  // إضافة المنتج
  const handleAddProduct = async (e: FormEvent) => {
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

      // بناء كائن المنتج
      const productData: any = {
        name,
        price,
        discount,
        discountedPrice,
        description,
        quantity,       // الكمية
        isAvailable,    // التوفّر
        sizes,          // الأحجام
        imageURL: downloadURL,
        categoryId: selectedCategoryId,
      };

      // إذا المستخدم اختار ماركة
      if (selectedBrandId) {
        productData.brandId = selectedBrandId;
      }

      // إضافة المستند إلى Firestore
      await addDoc(collection(db, 'products'), productData);

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

          {/* الوصف */}
          <div>
            <label className="block mb-1 text-gray-700">الوصف:</label>
            <textarea
              className="border w-full px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
            <p className="text-sm text-gray-500 mt-1">
              أدخل وصفًا موجزًا للمنتج.
            </p>
          </div>

          {/* الكمية */}
          <div>
            <label className="block mb-1 text-gray-700">الكمية المتوفرة:</label>
            <input
              type="number"
              className="border w-full px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              أدخل عدد الوحدات المتوفرة من المنتج.
            </p>
          </div>

          {/* هل المنتج متاح أم لا */}
          <div className="flex items-center gap-2">
            <label className="block mb-1 text-gray-700">متاح؟</label>
            <input
              type="checkbox"
              checked={isAvailable}
              onChange={(e) => setIsAvailable(e.target.checked)}
            />
            <span className="text-sm text-gray-500">
              إن كان محددًا، يعتبر المنتج متاحًا للعرض والشراء.
            </span>
          </div>

          {/* الأحجام مع السعر الخاص بكل حجم */}
          <div>
            <label className="block mb-1 text-gray-700">الأحجام (لكل حجم سعره الخاص):</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="اسم الحجم"
                className="border px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-blue-400 flex-1"
                value={newSizeName}
                onChange={(e) => setNewSizeName(e.target.value)}
              />
              <input
                type="number"
                placeholder="سعر الحجم"
                className="border px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-blue-400 w-24"
                value={newSizePrice}
                onChange={(e) => setNewSizePrice(Number(e.target.value))}
              />
              <button
                type="button"
                onClick={handleAddSize}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                إضافة
              </button>
            </div>
            {/* عرض الأحجام */}
            {sizes.length > 0 && (
              <div className="flex flex-col gap-2">
                {sizes.map((sz, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-gray-100 border rounded px-2 py-1"
                  >
                    <span className="mr-2">
                      {sz.name} - {sz.price} ريال
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSize(sz)}
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

          {/* اختيار الماركة (اختياري) */}
          <div>
            <label className="block mb-1 text-gray-700">اختر الماركة (اختياري):</label>
            <select
              className="border w-full px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
              value={selectedBrandId}
              onChange={(e) => setSelectedBrandId(e.target.value)}
            >
              <option value="">بدون ماركة</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">
              يمكنك اختيار الماركة إن وجدت. إن تركته فارغًا، سيعتبر المنتج بلا ماركة.
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
