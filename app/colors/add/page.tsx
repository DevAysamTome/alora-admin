"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/services/firebase";

// نموذج بسيط للتصنيف
interface CategoryData {
  id: string;
  name: string;
}

// نموذج للمنتج
interface ProductData {
  id: string;
  name: string;
  // ... حقول أخرى إن وجدت
}

export default function AddColorPage() {
  const [colorName, setColorName] = useState("");
  const [colorCode, setColorCode] = useState("");
  const [loading, setLoading] = useState(false);

  // لاختيار التصنيف
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  // المنتجات التابعة للتصنيف المختار
  const [products, setProducts] = useState<ProductData[]>([]);
  // قائمة المنتجات التي يحددها المستخدم
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  const router = useRouter();

  // 1) جلب التصنيفات
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const snap = await getDocs(collection(db, "categories"));
        const fetched = snap.docs.map((d) => ({
          id: d.id,
          name: d.data().name || "",
        }));
        setCategories(fetched);
      } catch (error) {
        console.error("خطأ في جلب التصنيفات:", error);
      }
    };
    fetchCategories();
  }, []);

  // 2) عند اختيار تصنيف، نجلب المنتجات الخاصة به
  useEffect(() => {
    const fetchProducts = async () => {
      if (!selectedCategoryId) {
        setProducts([]);
        return;
      }
      try {
        const snap = await getDocs(collection(db, "products"));
        // فلترة المنتجات التي ينطبق عليها categoryId
        const fetched = snap.docs
          .filter((doc) => doc.data().categoryId === selectedCategoryId)
          .map((doc) => ({
            id: doc.id,
            name: doc.data().name || "",
          }));
        setProducts(fetched);
      } catch (error) {
        console.error("خطأ في جلب المنتجات:", error);
      }
    };
    fetchProducts();
  }, [selectedCategoryId]);

  // 3) تحديث قائمة المنتجات المختارة
  function toggleProductSelection(productId: string) {
    setSelectedProductIds((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  }

  // 4) عند الحفظ
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!colorName.trim()) {
      alert("يرجى إدخال اسم اللون");
      return;
    }
    setLoading(true);
    try {
      // أ) إضافة مستند اللون في مجموعة "colors"
      const docRef = await addDoc(collection(db, "colors"), {
        name: colorName.trim(),
        colorCode: colorCode.trim(),
        categoryId : selectedCategoryId.trim()
      });
      const colorId = docRef.id; // معرّف اللون

      // ب) تحديث كل منتج مختار بإضافة colorId في حقل مثلاً "colors"
      //   (أو إن كنت تريد حقلاً واحدًا "color" اكتبه)
      for (const productId of selectedProductIds) {
        const productRef = doc(db, "products", productId);
        // جلب الحقل القديم (إن أردت دمج) - أو التحديث المباشر
        // هنا سنفترض أنه array:
        //   updateDoc(productRef, { colors: FieldValue.arrayUnion(colorId) });
        // أو إن لم يكن Array Union متوفر في TypeScript, نستعمل merge
        // سنفترض أنه arrayUnion
        // لكن تحتاج استيراد FieldValue من "firebase/firestore" (أو "firebase/firestore/lite")
        // سنستخدم نهج مبسط: جلب doc ثم merge
        // -- مبسط: نضع colorId = docRef.id كقيمة "color" (واحد)
        await updateDoc(productRef, {
          color: colorId,
        });
      }

      alert("تمت إضافة اللون بنجاح وتحديث المنتجات المختارة");
      router.push("/colors"); // العودة لصفحة الألوان
    } catch (err) {
      console.error("خطأ في إضافة اللون:", err);
      alert("حدث خطأ أثناء إضافة اللون.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow mt-6">
      <h1 className="text-xl font-bold mb-4">إضافة لون جديد</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 text-gray-700">اسم اللون:</label>
          <input
            type="text"
            className="border w-full px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
            value={colorName}
            onChange={(e) => setColorName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block mb-1 text-gray-700">كود اللون (اختياري):</label>
          <input
            type="text"
            placeholder="#FF0000"
            className="border w-full px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
            value={colorCode}
            onChange={(e) => setColorCode(e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-1 text-gray-700">اختر التصنيف:</label>
          <select
            className="border w-full px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
          >
            <option value="">بدون اختيار</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <p className="text-sm text-gray-500 mt-1">
            اختر التصنيف لعرض المنتجات الخاصة به.
          </p>
        </div>

        {/* عرض المنتجات التابعة للتصنيف المختار مع Checkboxes */}
        {selectedCategoryId != null && products != null && (
          <div>
            <p className="font-semibold mb-2">اختر المنتجات:</p>
            <div className="max-h-64 overflow-y-auto border p-2 rounded">
              {products.map((prod) => (
                <div key={prod.id} className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    checked={selectedProductIds.includes(prod.id)}
                    onChange={() => toggleProductSelection(prod.id)}
                    className="mr-2"
                  />
                  <span>{prod.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          {loading ? "جاري الإضافة..." : "إضافة اللون"}
        </button>
      </form>
    </div>
  );
}
