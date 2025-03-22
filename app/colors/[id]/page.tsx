"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
} from "firebase/firestore";
import { db } from "@/services/firebase";

interface CategoryData {
  id: string;
  name: string;
}

interface ProductData {
  id: string;
  name: string;
  color?: string; // أو colors?: string[] لو كنت تستخدم مصفوفة
}

export default function EditColorPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params as { id: string };

  // حقول اللون
  const [colorName, setColorName] = useState("");
  const [colorCode, setColorCode] = useState("");
  const [loading, setLoading] = useState(true);

  // لاختيار التصنيف
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  // المنتجات التابعة للتصنيف المختار
  const [products, setProducts] = useState<ProductData[]>([]);
  // المنتجات المختارة
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  useEffect(() => {
    // 1) جلب بيانات اللون من Firestore
    const fetchColor = async () => {
      try {
        const docRef = doc(db, "colors", id);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data() as { name: string; colorCode?: string };
          setColorName(data.name || "");
          setColorCode(data.colorCode || "");
        } else {
          alert("اللون غير موجود!");
          router.push("/colors");
        }
      } catch (error) {
        console.error("خطأ في جلب اللون:", error);
        alert("حدث خطأ أثناء جلب اللون.");
        router.push("/colors");
      }
    };

    // 2) جلب التصنيفات
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

    fetchColor();
    fetchCategories();
    setLoading(false);
  }, [id, router]);

  // عند اختيار تصنيف جديد
  useEffect(() => {
    if (!selectedCategoryId) {
      setProducts([]);
      setSelectedProductIds([]);
      return;
    }
    // جلب المنتجات الخاصة بالتصنيف
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const snap = await getDocs(collection(db, "products"));
        const fetched = snap.docs
          .filter((doc) => doc.data().categoryId === selectedCategoryId)
          .map((doc) => {
            const d = doc.data();
            return {
              id: doc.id,
              name: d.name || "",
              color: d.color || "",
              categoryId : d.categoryId || ""
            } as ProductData;
          });

        setProducts(fetched);

        // تحديد أي المنتجات لديها color == هذا اللون
        // إذا كنت تستخدم array (colors) فافحص array.contains(id)
        const preSelected = fetched
          .filter((p) => p.color === id)
          .map((p) => p.id);
        setSelectedProductIds(preSelected);
      } catch (error) {
        console.error("خطأ في جلب المنتجات:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [selectedCategoryId, id]);

  function toggleProductSelection(productId: string) {
    setSelectedProductIds((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!colorName.trim()) {
      alert("يرجى إدخال اسم اللون");
      return;
    }
    setLoading(true);

    try {
      // أ) تحديث بيانات اللون نفسه
      const colorRef = doc(db, "colors", id);
      await updateDoc(colorRef, {
        name: colorName.trim(),
        colorCode: colorCode.trim(),
        categoryId : selectedCategoryId
      });

      // ب) تحديث المنتجات (المختارة / غير المختارة)
      // 1) المنتجات الظاهرة في القائمة = products
      //    بعضها قد يكون لديه color = هذا اللون
      //    إذا المستخدم أزال التحديد => نزيل اللون
      //    إذا المستخدم أضاف التحديد => نضيف اللون
      for (const product of products) {
        const productRef = doc(db, "products", product.id);

        // هل المنتج مختار حاليًا؟
        const isSelectedNow = selectedProductIds.includes(product.id);

        if (isSelectedNow) {
          // إذا المنتج لا يملك هذا اللون => نحدّث
          if (product.color !== id) {
            await updateDoc(productRef, { color: id });
          }
        } else {
          // إذا المنتج كان يملك هذا اللون => نزيله
          if (product.color === id) {
            await updateDoc(productRef, { color: "" }); // أو null
          }
        }
      }

      alert("تم تحديث اللون والمنتجات بنجاح");
      router.push("/colors");
    } catch (err) {
      console.error("خطأ في تحديث اللون:", err);
      alert("حدث خطأ أثناء تحديث اللون.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow mt-6">
      <h1 className="text-xl font-bold mb-4">تعديل اللون</h1>
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
          <label className="block mb-1 text-gray-700">كود اللون:</label>
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

        {selectedCategoryId && products.length > 0 && (
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
          {loading ? "جاري التحديث..." : "تحديث اللون"}
        </button>
      </form>
    </div>
  );
}
