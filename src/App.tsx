import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "convex/react";
import LoginPage from "./pages/LoginPage"; // Keep LoginPage import
import AdminLayout from "./layouts/AdminLayout";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import InventoryPage from "./pages/InventoryPage";
import AddCarPage from "./pages/AddCarPage";
import EditCarPage from "./pages/EditCarPage";
import SettingsPage from "./pages/SettingsPage";
import Navbar from "./components/Navbar";
import { LanguageProvider } from "./lib/LanguageContext";
import { Toaster } from 'react-hot-toast';
import LoadingScreen from "./components/LoadingScreen";
import { api } from "../convex/_generated/api";

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

function AppContent() {
  const navigate = useNavigate();
  const token = localStorage.getItem("convex_token");

  return (
    <LanguageProvider>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        {/* الصفحة الرئيسية: صفحة الهبوط التي تحتوي على السيارة والتحريك */}
        <Route path="/" element={<><Navbar onOpenAuth={() => navigate("/login")} /><LandingPage /></>} /> 
        
        <Route path="/login" element={token ? <Navigate to="/admin" /> : <LoginPage />} />
        
        <Route path="/admin/*" element={token ? <AuthenticatedApp /> : <Navigate to="/login" />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </LanguageProvider>
  );
}

function AuthenticatedApp() {
  const token = localStorage.getItem("convex_token") ?? undefined;
  const storeUser = useMutation(api.users.storeUser);
  const user = useQuery(api.users.viewer, token ? { token } : "skip"); // Pass token only if it exists, otherwise skip

  useEffect(() => {
    // بمجرد الدخول، نرسل بيانات الإيميل لـ Convex ليتم التحقق منها
    // استدعاء storeUser فقط إذا كان التوكن موجوداً والمستخدم قد تم تحميله بنجاح (وليس null)
    if (token && user) { 
      storeUser({ token });
    }
  }, [storeUser, token, user]); // إضافة user إلى قائمة التبعيات

  // انتظر حتى يتم تحميل بيانات المستخدم
  if (user === undefined) {
    return <LoadingScreen />;
  }

  // إذا كانت النتيجة null والتوكن موجود، فهذا يعني أن التوكن تالف أو منتهي
  if (user === null && token) {
    localStorage.removeItem("convex_token"); // حذف التوكن فوراً لكسر الحلقة المفرغة
    return <Navigate to="/login" replace />;
  }

  return (
    <AdminLayout>
      <Routes>
        <Route index element={
          user?.role === "admin" ? <Dashboard /> : <Navigate to="/admin/inventory" replace />
        } />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="inventory/add" element={<AddCarPage />} />
        <Route path="inventory/edit/:carId" element={<EditCarPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminLayout>
  );
}