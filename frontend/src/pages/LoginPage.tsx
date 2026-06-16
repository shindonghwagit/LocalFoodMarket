import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const KAKAO_AUTH_URL = 'http://localhost:8080/api/v1/auth/oauth2/authorization/kakao';
const GOOGLE_AUTH_URL = 'http://localhost:8080/api/v1/auth/oauth2/authorization/google';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password, from);
    } catch (err: any) {
      setError(
        err?.response?.data?.error?.message ??
          err?.message ??
          '로그인에 실패했어요. 이메일과 비밀번호를 확인해주세요.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (url: string) => {
    if (from) sessionStorage.setItem('loginRedirect', from);
    else sessionStorage.removeItem('loginRedirect');
    window.location.href = url;
  };

  return (
    <div className="bg-background py-xl px-gutter">
      <div className="mx-auto w-full max-w-[28rem]">
        {/* 로고 */}
        <div className="text-center mb-lg">
          <Link to="/" className="inline-flex flex-col items-center gap-sm">
            <img src={logo} alt="Farmer's Market" className="h-16 w-auto" />
            <span className="font-headline-md text-headline-md font-bold text-primary">
              Farmer's Market
            </span>
          </Link>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
            농장과 식탁을 잇는 직거래 플랫폼
          </p>
        </div>

        {/* 로그인 카드 */}
        <div className="bg-white rounded-2xl shadow-sm border border-outline-variant p-lg">
          <h1 className="font-headline-sm text-headline-sm text-on-surface mb-lg">로그인</h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-md">
            <Input
              label="이메일"
              type="email"
              placeholder="이메일을 입력해주세요"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="비밀번호"
              type="password"
              placeholder="비밀번호를 입력해주세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && (
              <p className="font-body-md text-body-md text-error bg-error-container px-md py-sm rounded-lg">
                {error}
              </p>
            )}

            <Button type="submit" loading={loading} className="w-full mt-xs">
              로그인
            </Button>
          </form>

          {/* 구분선 */}
          <div className="flex items-center gap-sm my-lg">
            <div className="flex-1 h-px bg-outline-variant" />
            <span className="font-label-sm text-label-sm text-outline">또는 소셜 로그인</span>
            <div className="flex-1 h-px bg-outline-variant" />
          </div>

          {/* 소셜 로그인 */}
          <div className="flex flex-col gap-sm">
            <button
              type="button"
              onClick={() => handleSocialLogin(KAKAO_AUTH_URL)}
              className="flex items-center justify-center gap-sm w-full py-sm px-md rounded-lg font-body-md text-body-md font-semibold transition-opacity hover:opacity-90 cursor-pointer"
              style={{ backgroundColor: '#FEE500', color: '#3C1E1E' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3C6.477 3 2 6.477 2 10.8c0 2.747 1.524 5.168 3.84 6.653l-.984 3.656a.36.36 0 0 0 .52.41l4.275-2.84A11.2 11.2 0 0 0 12 18.6c5.523 0 10-3.477 10-7.8S17.523 3 12 3z" />
              </svg>
              카카오로 로그인
            </button>
            <button
              type="button"
              onClick={() => handleSocialLogin(GOOGLE_AUTH_URL)}
              className="flex items-center justify-center gap-sm w-full py-sm px-md rounded-lg border border-outline-variant bg-white font-body-md text-body-md text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer"
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google로 로그인
            </button>
          </div>
        </div>

        {/* 회원가입 링크 */}
        <div className="flex justify-center gap-md mt-lg">
          <Link
            to="/register"
            className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors"
          >
            소비자 회원가입
          </Link>
          <span className="text-outline">|</span>
          <Link
            to="/register?role=farmer"
            className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors"
          >
            농가로 가입하기
          </Link>
        </div>
      </div>
    </div>
  );
}
