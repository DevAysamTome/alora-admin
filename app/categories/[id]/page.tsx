"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../../services/firebase";
import ProtectedRoute from "../../../components/ProtectedRoute";

export default function EditCategoryPage() {
  const [name, setName] = useState("");
  const [oldImageUrl, setOldImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const params = useParams();
  // نفترض أن معرّف المستند (القديم) = اسم الصنف القديم
  const { id: oldName } = params as { id: string };

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        // جلب المستند القديم
        const docRef = doc(db, "categories", oldName);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const categoryData = docSnap.data();
          setName(categoryData.name || oldName);
          setOldImageUrl(categoryData.imageUrl || "");
        } else {
          alert("الصنف غير موجود!");
          router.push("/categories");
        }
      } catch (error) {
        console.error("خطأ في جلب الصنف:", error);
        alert("حدث خطأ أثناء جلب الصنف.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [oldName, router]);

  // اختيار ملف الصورة الجديد
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const newName = name.trim();
      // إذا المستخدم لم يغيّر الاسم
      if (newName === oldName) {
        await updateSameDoc(); // تحديث عادي على نفس المستند
      } else {
        await renameDoc(); // إنشاء مستند جديد وحذف القديم
      }

      alert("تم تحديث الصنف بنجاح!");
      router.push("/categories");
    } catch (error) {
      console.error("خطأ في تحديث الصنف:", error);
      alert("حدث خطأ أثناء تحديث الصنف.");
    } finally {
      setLoading(false);
    }
  };

  // تحديث عادي على نفس المستند (في حالة الاسم لم يتغير)
  const updateSameDoc = async () => {
    const docRef = doc(db, "categories", oldName);

    // إذا اختار المستخدم ملفًا جديدًا، ارفعه
    let newImageUrl = oldImageUrl;
    if (imageFile) {
      const storageRef = ref(
        storage,
        `categories/${Date.now()}_${imageFile.name}`
      );
      await uploadBytes(storageRef, imageFile);
      newImageUrl = await getDownloadURL(storageRef);
    }

    // حدّث المستند نفسه
    await updateDoc(docRef, {
      name: name.trim(),
      imageUrl: newImageUrl,
    });
  };

  // إذا تغيّر الاسم -> ننشئ مستند جديد بمعرّف = newName وننسخ البيانات ثم نحذف القديم
  const renameDoc = async () => {
    const newName = name.trim();

    // ارفع الصورة إن وجدت
    let newImageUrl = oldImageUrl;
    if (imageFile) {
      const storageRef = ref(
        storage,
        `categories/${Date.now()}_${imageFile.name}`
      );
      await uploadBytes(storageRef, imageFile);
      newImageUrl = await getDownloadURL(storageRef);
    }

    // 1) أنشئ مستند جديد بالاسم الجديد
    const newDocRef = doc(db, "categories", newName);
    await setDoc(newDocRef, {
      name: newName,
      imageUrl: newImageUrl,
    });

    // 2) احذف المستند القديم
    const oldDocRef = doc(db, "categories", oldName);
    await deleteDoc(oldDocRef);
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
        <h1 className="text-xl font-bold mb-4">تعديل الصنف</h1>
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block mb-1 text-gray-700">اسم الصنف:</label>
            <input
              type="text"
              className="border w-full px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-700">الصورة الحالية:</label>
            {oldImageUrl ? (
              <img
                src={oldImageUrl}
                alt="Category"
                className="w-32 h-32 object-cover mb-2"
              />
            ) : (
              <p className="text-sm text-gray-500 mb-2">لا توجد صورة قديمة.</p>
            )}
          </div>

          <div>
            <label className="block mb-1 text-gray-700">
              اختر صورة جديدة (اختياري):
            </label>
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

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            {loading ? "جاري التحديث..." : "تحديث الصنف"}
          </button>
        </form>
      </div>
    </ProtectedRoute>
  );
}
