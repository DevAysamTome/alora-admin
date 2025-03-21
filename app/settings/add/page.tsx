"use client";

import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/services/firebase";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function AddSocialLinkPage() {
  const [type, setType] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addDoc(collection(db, "socialLinks"), {
        type,
        url,
      });
      router.push("/settings"); // العودة لقائمة الروابط
    } catch (error) {
      console.error("خطأ في إضافة الرابط:", error);
      alert("حدث خطأ أثناء إضافة الرابط.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-md mx-auto bg-white p-6 rounded shadow mt-6">
        <h1 className="text-xl font-bold mb-4">إضافة رابط جديد</h1>
        <form onSubmit={handleAddLink} className="space-y-4">
          <div>
            <label className="block mb-1 text-gray-700">النوع (facebook, instagram...):</label>
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
            {loading ? "جاري الإضافة..." : "إضافة الرابط"}
          </button>
        </form>
      </div>
    </ProtectedRoute>
  );
}
