import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import logo from '../../assets/logo.png';
import useAuthStore from '../../store/authStore';
import { useAuth } from '../../hooks/useAuth';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isAuthenticated } = useAuthStore();
  const { logout } = useAuth();

  const getDashboardLink = () => {
    if (!user) return null;
    if (user.role === 'CONSUMER') return { to: '/mypage', label: '마이페이지' };
    if (user.role === 'FARMER') return { to: '/farm/dashboard', label: '농가 대시보드' };
    if (user.role === 'ADMIN') return { to: '/admin', label: '관리자' };
    return null;
  };

  const dashboardLink = getDashboardLink();

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `font-body-md text-body-md transition-colors duration-200 ${
      isActive ? 'text-primary font-semibold' : 'text-on-surface-variant hover:text-primary'
    }`;

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-outline-variant shadow-sm">
      <div className="max-w-max-width mx-auto px-gutter">
        <div className="flex items-center justify-between h-16">
          {/* 로고 */}
          <Link to="/" className="flex items-center gap-sm shrink-0">
            <img src={logo} alt="Farmer's Market 로고" className="h-10 w-auto" />
            <span className="font-headline-sm text-headline-sm font-bold text-primary">
              Farmer's Market
            </span>
          </Link>

          {/* 데스크탑 네비게이션 */}
          <nav className="hidden md:flex items-center gap-lg">
            <NavLink to="/" end className={navLinkClass}>홈</NavLink>
            <NavLink to="/farms" className={navLinkClass}>농가 찾기</NavLink>
            <NavLink to="/community" className={navLinkClass}>커뮤니티</NavLink>
          </nav>

          {/* 데스크탑 인증 버튼 */}
          <div className="hidden md:flex items-center gap-sm">
            {isAuthenticated && user ? (
              <>
                {dashboardLink && (
                  <Link
                    to={dashboardLink.to}
                    className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors"
                  >
                    {dashboardLink.label}
                  </Link>
                )}
                <span className="font-body-md text-body-md text-on-surface">
                  {user.email.split('@')[0]}님
                </span>
                <button
                  onClick={logout}
                  className="font-label-md text-label-md text-on-surface-variant hover:text-error transition-colors cursor-pointer"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors"
                >
                  로그인
                </Link>
                <Link
                  to="/login?mode=register"
                  className="bg-primary text-on-primary font-label-md text-label-md px-md py-xs rounded-full hover:opacity-90 transition-opacity"
                >
                  회원가입
                </Link>
              </>
            )}
          </div>

          {/* 모바일 햄버거 */}
          <button
            className="md:hidden p-xs text-on-surface-variant cursor-pointer"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="메뉴 열기"
          >
            <span className="material-symbols-outlined">
              {menuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>

        {/* 모바일 메뉴 */}
        {menuOpen && (
          <div className="md:hidden py-sm border-t border-outline-variant">
            <nav className="flex flex-col gap-sm">
              <NavLink to="/" end onClick={() => setMenuOpen(false)} className={navLinkClass}>홈</NavLink>
              <NavLink to="/farms" onClick={() => setMenuOpen(false)} className={navLinkClass}>농가 찾기</NavLink>
              <NavLink to="/community" onClick={() => setMenuOpen(false)} className={navLinkClass}>커뮤니티</NavLink>
              <div className="border-t border-outline-variant pt-sm mt-xs">
                {isAuthenticated && user ? (
                  <>
                    {dashboardLink && (
                      <Link
                        to={dashboardLink.to}
                        onClick={() => setMenuOpen(false)}
                        className="block py-xs font-body-md text-body-md text-on-surface-variant hover:text-primary"
                      >
                        {dashboardLink.label}
                      </Link>
                    )}
                    <p className="py-xs font-body-md text-body-md text-on-surface">
                      {user.email.split('@')[0]}님
                    </p>
                    <button
                      onClick={() => { logout(); setMenuOpen(false); }}
                      className="py-xs font-body-md text-body-md text-error cursor-pointer"
                    >
                      로그아웃
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMenuOpen(false)}
                      className="block py-xs font-body-md text-body-md text-on-surface-variant"
                    >
                      로그인
                    </Link>
                    <Link
                      to="/login?mode=register"
                      onClick={() => setMenuOpen(false)}
                      className="block py-xs font-body-md text-body-md text-primary font-semibold"
                    >
                      회원가입
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
