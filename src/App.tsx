import { useEffect, useRef, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "convex/react";
import AdminLayout from "./layouts/AdminLayout";
import Navbar from "./components/Navbar";
import { LanguageProvider } from "./lib/LanguageContext";
import { Toaster } from 'react-hot-toast';
import LoadingScreen from "./components/LoadingScreen";
import { api } from "../convex/_generated/api";

// Route-level code splitting — each page is loaded on demand
const LoginPage = lazy(() => import("./pages/LoginPage"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const VerifyEmailPage = lazy(() => import("./pages/VerifyEmailPage"));
const InventoryPage = lazy(() => import("./pages/InventoryPage"));
const AddCarPage = lazy(() => import("./pages/AddCarPage"));
const EditCarPage = lazy(() => import("./pages/EditCarPage"));
const SalesPage = lazy(() => import("./pages/SalesPage"));
const CustomersPage = lazy(() => import("./pages/CustomersPage"));
const UsersPage = lazy(() => import("./pages/UsersPage"));
const BookingsPage = lazy(() => import("./pages/BookingsPage"));
const InvoicesPage = lazy(() => import("./pages/InvoicesPage"));
const StatisticsPage = lazy(() => import("./pages/StatisticsPage"));
const OrdersPage = lazy(() => import("./pages/OrdersPage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const ArchivedInventoryPage = lazy(() => import("./pages/ArchivedInventoryPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const CarDetailsPage = lazy(() => import("./pages/CarDetailsPage"));

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
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          {/* Landing page */}
          <Route path="/" element={<><Navbar onOpenAuth={() => navigate("/login")} /><LandingPage /></>} /> 
          
          {/* Public car details */}
          <Route path="/inventory/:carId" element={<><Navbar onOpenAuth={() => navigate("/login")} /><CarDetailsPage /></>} />
          
          {/* Email verification */}
          <Route path="/verify-email" element={<VerifyEmailPage />} />

          <Route path="/login" element={token ? <Navigate to="/admin" /> : <LoginPage />} />
          
          <Route path="/admin/*" element={token ? <AuthenticatedApp /> : <Navigate to="/login" />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
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

  if (user === null && token) {
    localStorage.removeItem("convex_token"); // حذف التوكن فوراً لكسر الحلقة المفرغة
    return <Navigate to="/login" replace />;
  }

  return (
    <AdminLayout>
      <Suspense fallback={<LoadingScreen />}>
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
          <Route path="invoices" element={<InvoicesPage />} />
          <Route path="statistics" element={<StatisticsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </Suspense>
    </AdminLayout>
  );
}