import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import useAuthStore from './store/authStore';
import type { Role } from './types';

import Layout from './components/layout/Layout';

// 공개 페이지
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OAuth2CallbackPage from './pages/OAuth2CallbackPage';
import FarmsPage from './pages/FarmsPage';
import FarmDetailPage from './pages/FarmDetailPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CommunityPage from './pages/CommunityPage';
import PostDetailPage from './pages/PostDetailPage';

// 로그인 필요
import MyPage from './pages/MyPage';
import OrdersPage from './pages/OrdersPage';
import CommunityWritePage from './pages/CommunityWritePage';

// 농가 전용
import FarmDashboardPage from './pages/farm/FarmDashboardPage';

// 관리자 전용
import AdminPage from './pages/admin/AdminPage';

/* ── PrivateRoute ────────────────────────────────────────────────────────── */
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

/* ── 관리자 레이아웃 (Header/Footer 없이 전용 UI 가능) ───────────────────── */
function AdminLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Outlet />
    </div>
  );
}

/* ── App ─────────────────────────────────────────────────────────────────── */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 소셜 로그인 콜백 — 레이아웃 없이 독립 처리 */}
        <Route path="/oauth2/callback" element={<OAuth2CallbackPage />} />

        {/* 공개 라우트 — Header + Footer */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/farms" element={<FarmsPage />} />
          <Route path="/farms/:id" element={<FarmDetailPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/community" element={<CommunityPage />} />

          {/* 로그인 필요 */}
          <Route element={<PrivateRoute />}>
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            {/* /community/write 가 /:id 보다 먼저 매칭되도록 순서 주의 */}
            <Route path="/community/write" element={<CommunityWritePage />} />
            <Route path="/community/:id" element={<PostDetailPage />} />
          </Route>

          {/* 농가 전용 */}
          <Route element={<PrivateRoute roles={['FARMER']} />}>
            <Route path="/farm/dashboard" element={<FarmDashboardPage />} />
          </Route>
        </Route>

        {/* 관리자 전용 — 별도 레이아웃 */}
        <Route element={<AdminLayout />}>
          <Route element={<PrivateRoute roles={['ADMIN']} />}>
            <Route path="/admin/*" element={<AdminPage />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
