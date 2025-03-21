"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db } from "@/services/firebase"; // عدّل المسار
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useRouter } from "next/navigation";

interface SocialLink {
  id: string;
  type: string;
  url: string;
}

export default function SettingsPage() {
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const router = useRouter();

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        setLoading(true);
        const snap = await getDocs(collection(db, "socialLinks"));
        const fetched = snap.docs.map((doc) => ({
          id: doc.id,
          type: doc.data().type || "",
          url: doc.data().url || "",
        }));
        setLinks(fetched);
      } catch (error) {
        console.error("خطأ في جلب الروابط:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLinks();
  }, []);

  // البحث في نوع الرابط أو الـ URL
  const filteredLinks = links.filter(
    (link) =>
      link.type.toLowerCase().includes(search.toLowerCase()) ||
      link.url.toLowerCase().includes(search.toLowerCase())
  );

  const handlePrint = () => {
    window.print();
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = confirm("هل أنت متأكد أنك تريد حذف هذا الرابط؟");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "socialLinks", id));
      setLinks((prev) => prev.filter((l) => l.id !== id));
    } catch (error) {
      console.error("خطأ في حذف الرابط:", error);
      alert("حدث خطأ أثناء حذف الرابط.");
    }
  };

  return (
    <ProtectedRoute>
      <div className="bg-white p-6 rounded shadow">
        {/* العنوان وشريط الأدوات */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
          <h1 className="text-xl font-bold">إدارة روابط التواصل</h1>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="ابحث عن رابط..."
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
              href="/settings/add"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              إضافة رابط جديد
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-4">
            <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredLinks.length === 0 ? (
          <p className="text-center text-gray-500">لا توجد روابط مطابقة للبحث.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-lg shadow divide-y divide-gray-200">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-2 text-left text-gray-600 font-semibold">
                    رقم الرابط (ID)
                  </th>
                  <th className="px-4 py-2 text-left text-gray-600 font-semibold">
                    النوع
                  </th>
                  <th className="px-4 py-2 text-left text-gray-600 font-semibold">
                    الرابط (URL)
                  </th>
                  <th className="px-4 py-2 text-left text-gray-600 font-semibold">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredLinks.map((link) => (
                  <tr key={link.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2 whitespace-nowrap">{link.id}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{link.type}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{link.url}</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="flex gap-2">
                        <Link
                          href={`/settings/${link.id}`}
                          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                        >
                          تعديل
                        </Link>
                        <button
                          onClick={() => handleDelete(link.id)}
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
    </ProtectedRoute>
  );
}
