import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import useAuthStore from './store/authStore';

import AuthHydrator from './components/auth/AuthHydrator';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminPage from './pages/admin/AdminPage';

function AdminGuard() {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

export default function AppAdmin() {
  return (
    <BrowserRouter>
      <AuthHydrator>
        <Routes>
          <Route path="/login" element={<AdminLoginPage />} />

          <Route element={<AdminGuard />}>
            <Route path="/admin/*" element={<AdminPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </AuthHydrator>
    </BrowserRouter>
  );
}
