"use client";

import { useState, useEffect } from "react";
import { db } from "../services/firebase";
import { collection, getDocs } from "firebase/firestore";
import ProtectedRoute from "../components/ProtectedRoute";
import Footer from "@/components/Footer";

export default function DashboardPage() {
  const [ordersCount, setOrdersCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [productsCount, setProductsCount] = useState(0);
  const [categoriesCount, setCategoriesCount] = useState(0);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // 1) جلب الطلبات وحساب عددها وإجمالي الإيرادات
        const ordersSnapshot = await getDocs(collection(db, "orders"));
        setOrdersCount(ordersSnapshot.size);

        let revenue = 0;
        ordersSnapshot.forEach((doc) => {
          const data = doc.data();
          // نفترض أن هناك حقل اسمه "total" يمثل مبلغ الطلب
          revenue += data.total || 0;
        });
        setTotalRevenue(revenue);

        // 2) جلب المنتجات وحساب عددها
        const productsSnapshot = await getDocs(collection(db, "products"));
        setProductsCount(productsSnapshot.size);

        // 3) جلب الأصناف وحساب عددها
        const categoriesSnapshot = await getDocs(collection(db, "categories"));
        setCategoriesCount(categoriesSnapshot.size);
      } catch (error) {
        console.error("خطأ في جلب الإحصائيات:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

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
      <div className="p-6">
        <h1 className="text-xl font-bold mb-4">لوحة التحكم الرئيسية</h1>

        {/* مثال لعرض بعض الإحصائيات في بطاقات (Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* عدد الطلبات */}
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-gray-500 text-sm">عدد الطلبات</h3>
            <p className="text-2xl font-bold mt-2">{ordersCount}</p>
          </div>

          {/* إجمالي الإيرادات */}
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-gray-500 text-sm">إجمالي الإيرادات</h3>
            <p className="text-2xl font-bold mt-2">{totalRevenue} شيكل</p>
          </div>

          {/* عدد المنتجات */}
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-gray-500 text-sm">عدد المنتجات</h3>
            <p className="text-2xl font-bold mt-2">{productsCount}</p>
          </div>

          {/* عدد الأصناف */}
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-gray-500 text-sm">عدد الأصناف</h3>
            <p className="text-2xl font-bold mt-2">{categoriesCount}</p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
