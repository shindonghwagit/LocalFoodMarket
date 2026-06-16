import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import useAuthStore from './store/authStore';
import type { Role } from './types';

import Layout from './components/layout/Layout';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OAuth2CallbackPage from './pages/OAuth2CallbackPage';
import FarmsPage from './pages/FarmsPage';
import FarmDetailPage from './pages/FarmDetailPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CommunityPage from './pages/CommunityPage';
import PostDetailPage from './pages/PostDetailPage';

import MyPage from './pages/MyPage';
import OrdersPage from './pages/OrdersPage';
import CommunityWritePage from './pages/CommunityWritePage';

import FarmDashboardPage from './pages/farm/FarmDashboardPage';
import FarmProductManagePage from './pages/farm/FarmProductManagePage';

interface PrivateRouteProps {
  roles?: Role[];
}

function PrivateRoute({ roles }: PrivateRouteProps) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/oauth2/callback" element={<OAuth2CallbackPage />} />

        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/farms" element={<FarmsPage />} />
          <Route path="/farms/:id" element={<FarmDetailPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/community" element={<CommunityPage />} />

          <Route element={<PrivateRoute />}>
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/community/write" element={<CommunityWritePage />} />
            <Route path="/community/:id" element={<PostDetailPage />} />
          </Route>

          <Route element={<PrivateRoute roles={['FARMER']} />}>
            <Route path="/farm/dashboard" element={<FarmDashboardPage />} />
            <Route path="/farm/products" element={<FarmProductManagePage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
