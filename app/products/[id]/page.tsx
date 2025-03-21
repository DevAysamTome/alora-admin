"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import { doc, getDoc, updateDoc, getDocs, collection } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../../services/firebase";
import ProtectedRoute from "../../../components/ProtectedRoute";

// واجهة تمثل كل حجم (اسم + سعر)
interface SizeOption {
  name: string;
  price: number;
}

export default function EditProductPage() {
  // الحقول الرئيسية
  const [name, setName] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);

  // الحقول الإضافية
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState<number>(0);
  const [isAvailable, setIsAvailable] = useState<boolean>(true);

  // الأحجام (كمصفوفة من الكائنات)
  const [sizes, setSizes] = useState<SizeOption[]>([]);
  // الحقول المؤقتة لإضافة حجم جديد
  const [newSizeName, setNewSizeName] = useState("");
  const [newSizePrice, setNewSizePrice] = useState<number>(0);

  // رابط الصورة القديم
  const [oldImageURL, setOldImageURL] = useState("");
  // ملف الصورة الجديد (إن اختاره المستخدم)
  const [imageFile, setImageFile] = useState<File | null>(null);

  // الأصناف
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(""); // الصنف المختار

  // الماركات
  const [brands, setBrands] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedBrandId, setSelectedBrandId] = useState<string>(""); // الماركة المختارة (اختياري)

  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const params = useParams();
  const { id } = params as { id: string };

  // 1) جلب بيانات المنتج من Firestore
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const productData = docSnap.data();

          // تعبئة الحقول
          setName(productData.name || "");
          setPrice(productData.price || 0);
          setDiscount(productData.discount || 0);
          setDescription(productData.description || "");
          setQuantity(productData.quantity || 0);
          setIsAvailable(
            productData.hasOwnProperty("isAvailable")
              ? !!productData.isAvailable
              : true
          );

          // إذا الأحجام مخزنة ككائنات [{ name, price }, ...]
          setSizes(productData.sizes || []);
          setOldImageURL(productData.imageURL || "");
          setSelectedCategoryId(productData.categoryId || "");
          setSelectedBrandId(productData.brandId || "");
        } else {
          alert("المنتج غير موجود!");
          router.push("/products");
        }
      } catch (error) {
        console.error("خطأ في جلب المنتج:", error);
        alert("حدث خطأ أثناء جلب المنتج.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, router]);

  // 2) جلب الأصناف
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const snap = await getDocs(collection(db, "categories"));
        const cats = snap.docs.map((d) => ({
          id: d.id,
          name: d.data().name || "",
        }));
        setCategories(cats);
      } catch (error) {
        console.error("خطأ في جلب الأصناف:", error);
      }
    };

    fetchCategories();
  }, []);

  // 3) جلب الماركات
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const snap = await getDocs(collection(db, "brands"));
        const fetchedBrands = snap.docs.map((d) => ({
          id: d.id,
          name: d.data().name || "",
        }));
        setBrands(fetchedBrands);
      } catch (error) {
        console.error("خطأ في جلب الماركات:", error);
      }
    };

    fetchBrands();
  }, []);

  // إضافة حجم جديد
  const handleAddSize = () => {
    if (newSizeName.trim()) {
      const newSizeObj: SizeOption = {
        name: newSizeName.trim(),
        price: newSizePrice,
      };
      setSizes((prev) => [...prev, newSizeObj]);
      setNewSizeName("");
      setNewSizePrice(0);
    }
  };

  // حذف حجم من المصفوفة
  const handleRemoveSize = (sizeToRemove: SizeOption) => {
    setSizes((prev) => prev.filter((sz) => sz !== sizeToRemove));
  };

  // اختيار ملف الصورة الجديد
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  // تحديث المنتج
  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const docRef = doc(db, "products", id);

      // رفع الصورة الجديدة (إن وجدت)
      let newImageURL = oldImageURL;
      if (imageFile) {
        const storageRef = ref(storage, `products/${Date.now()}_${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        newImageURL = await getDownloadURL(storageRef);
      }

      // تحديث المستند في Firestore
      await updateDoc(docRef, {
        name,
        price,
        discount,
        description,
        quantity,
        isAvailable,
        sizes, // مصفوفة [{ name, price }, ...]
        imageURL: newImageURL,
        categoryId: selectedCategoryId,
        // الماركة اختياري => إذا selectedBrandId فارغ، نضعه فارغًا أو نحذفه
        brandId: selectedBrandId || "",
      });

      router.push("/products"); // العودة لقائمة المنتجات
    } catch (error) {
      console.error("خطأ في تحديث المنتج:", error);
      alert("حدث خطأ أثناء تحديث المنتج.");
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
        <h1 className="text-xl font-bold mb-4">تعديل المنتج</h1>
        <form onSubmit={handleUpdate} className="space-y-4">
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
          </div>

          {/* هل المنتج متاح؟ */}
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

          {/* الأحجام (اسم + سعر) */}
          <div>
            <label className="block mb-1 text-gray-700">الأحجام:</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                className="border px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
                placeholder="اسم الحجم (مثلاً XL)"
                value={newSizeName}
                onChange={(e) => setNewSizeName(e.target.value)}
              />
              <input
                type="number"
                className="border px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-blue-400 w-24"
                placeholder="سعر الحجم"
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
            <p className="text-sm text-gray-500 mt-1">الأصناف من قاعدة البيانات.</p>
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
              يمكنك تركه فارغًا إذا لم يكن هناك ماركة محددة.
            </p>
          </div>

          {/* الصورة القديمة + اختيار صورة جديدة */}
          <div>
            <label className="block mb-1 text-gray-700">الصورة الحالية:</label>
            {oldImageURL ? (
              <img
                src={oldImageURL}
                alt="صورة المنتج"
                className="w-32 h-32 object-cover mb-2"
              />
            ) : (
              <p className="text-sm text-gray-500 mb-2">لا توجد صورة سابقة.</p>
            )}

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

          {/* زر التحديث */}
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            {loading ? "جاري التحديث..." : "تحديث المنتج"}
          </button>
        </form>
      </div>
    </ProtectedRoute>
  );
}
