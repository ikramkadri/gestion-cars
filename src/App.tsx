import { useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "convex/react";
import LoginPage from "./pages/LoginPage";
import AdminLayout from "./layouts/AdminLayout";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import InventoryPage from "./pages/InventoryPage";
import AddCarPage from "./pages/AddCarPage";
import EditCarPage from "./pages/EditCarPage";
import SalesPage from "./pages/SalesPage";
import CustomersPage from "./pages/CustomersPage";
import UsersPage from "./pages/UsersPage";
import BookingsPage from "./pages/BookingsPage";
import InvoicesPage from "./pages/InvoicesPage";
import StatisticsPage from "./pages/StatisticsPage";
import OrdersPage from "./pages/OrdersPage";
import NotificationsPage from "./pages/NotificationsPage";
import ReviewsPage from "./pages/ReviewsPage";
import ArchivedInventoryPage from "./pages/ArchivedInventoryPage";
import SettingsPage from "./pages/SettingsPage";
import Navbar from "./components/Navbar";
import { LanguageProvider } from "./lib/LanguageContext";
import { Toaster } from 'react-hot-toast';
import LoadingScreen from "./components/LoadingScreen";
import { api } from "../convex/_generated/api";
import CarDetailsPage from "./pages/CarDetailsPage";

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
        
        {/* مسار عام لرؤية تفاصيل السيارة للجميع */}
        <Route path="/inventory/:carId" element={<><Navbar onOpenAuth={() => navigate("/login")} /><CarDetailsPage /></>} />
        
        {/* مسار توثيق الإيميل */}
        <Route path="/verify-email" element={<VerifyEmailPage />} />

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
  const user = useQuery(api.users.viewer, token ? { token } : "skip");
  const hasStoredUser = useRef(false);

  useEffect(() => {
    if (token && user && !hasStoredUser.current) {
      storeUser({ token });
      hasStoredUser.current = true;
    }
  }, [token, user, storeUser]);

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
          user?.role === "admin" || user?.role === "sales_manager" ? <Dashboard /> : <Navigate to="/admin/inventory" replace />
        } />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="inventory/add" element={<AddCarPage />} />
        <Route path="inventory/edit/:carId" element={<EditCarPage />} />
        <Route path="inventory/archived" element={<ArchivedInventoryPage />} />
        <Route path="sales" element={<SalesPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="bookings" element={<BookingsPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="reviews-admin" element={<ReviewsPage />} />
        <Route path="invoices" element={<InvoicesPage />} />
        <Route path="statistics" element={<StatisticsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminLayout>
  );
}