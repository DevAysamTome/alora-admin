"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db } from "@/services/firebase";
import Link from "next/link";

interface ColorData {
  id: string;
  name: string;     // أو colorName
  colorCode?: string; // إن أردت تخزين كود اللون (مثل #FF0000)
}

export default function ColorsPage() {
  const [colors, setColors] = useState<ColorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchColors = async () => {
      try {
        setLoading(true);
        const snap = await getDocs(collection(db, "colors"));
        const fetched = snap.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name || "",
          colorCode: doc.data().colorCode || "",
        }));
        setColors(fetched);
      } catch (error) {
        console.error("خطأ في جلب الألوان:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchColors();
  }, []);

  const filteredColors = colors.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.colorCode || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    const confirmDelete = confirm("هل أنت متأكد من حذف هذا اللون؟");
    if (!confirmDelete) return;
    try {
      await deleteDoc(doc(db, "colors", id));
      setColors((prev) => prev.filter((col) => col.id !== id));
    } catch (error) {
      console.error("خطأ في حذف اللون:", error);
      alert("حدث خطأ أثناء حذف اللون.");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
        <h1 className="text-xl font-bold">إدارة الألوان</h1>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="ابحث عن لون..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-400 w-full md:w-64"
          />
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            طباعة
          </button>
          <Link
            href="/colors/add"
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            إضافة لون جديد
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-4">
          <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredColors.length === 0 ? (
        <p className="text-center text-gray-500">لا توجد ألوان مطابقة للبحث.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg shadow divide-y divide-gray-200">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-4 py-2 text-left text-gray-600 font-semibold">
                  رقم اللون (ID)
                </th>
                <th className="px-4 py-2 text-left text-gray-600 font-semibold">
                  الاسم
                </th>
                <th className="px-4 py-2 text-left text-gray-600 font-semibold">
                  كود اللون
                </th>
                <th className="px-4 py-2 text-left text-gray-600 font-semibold">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredColors.map((col) => (
                <tr key={col.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-2 whitespace-nowrap">{col.id}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{col.name}</td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {col.colorCode}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <div className="flex gap-2">
                      <Link
                        href={`/colors/${col.id}`}
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                      >
                        تعديل
                      </Link>
                      <button
                        onClick={() => handleDelete(col.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                      >
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
