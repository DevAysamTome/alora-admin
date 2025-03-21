"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/services/firebase";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function EditSocialLinkPage() {
  const [type, setType] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const params = useParams();
  const { id } = params as { id: string };

  useEffect(() => {
    const fetchLink = async () => {
      try {
        const docRef = doc(db, "socialLinks", id);
        const snap = await getDoc(docRef);

        if (snap.exists()) {
          const data = snap.data() as { type: string; url: string };
          setType(data.type || "");
          setUrl(data.url || "");
        } else {
          alert("الرابط غير موجود!");
          router.push("/settings");
        }
      } catch (error) {
        console.error("خطأ في جلب الرابط:", error);
        alert("حدث خطأ أثناء جلب الرابط.");
      } finally {
        setLoading(false);
      }
    };

    fetchLink();
  }, [id, router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const docRef = doc(db, "socialLinks", id);
      await updateDoc(docRef, {
        type,
        url,
      });
      router.push("/settings"); // العودة لقائمة الروابط
    } catch (error) {
      console.error("خطأ في تحديث الرابط:", error);
      alert("حدث خطأ أثناء تحديث الرابط.");
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
        <h1 className="text-xl font-bold mb-4">تعديل الرابط</h1>
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block mb-1 text-gray-700">
              النوع (facebook, instagram...):
            </label>
            <input
              type="text"
              className="border w-full px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-700">الرابط (URL):</label>
            <input
              type="text"
              className="border w-full px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            {loading ? "جاري التحديث..." : "تحديث الرابط"}
          </button>
        </form>
      </div>
    </ProtectedRoute>
  );
}
