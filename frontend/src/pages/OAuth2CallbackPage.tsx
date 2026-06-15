import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import * as authApi from '../api/auth';
import useAuthStore from '../store/authStore';
import type { Role } from '../types';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function OAuth2CallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [roleLoading, setRoleLoading] = useState(false);
  const [error, setError] = useState('');

  const isNewUser = searchParams.get('isNewUser') === 'true';
  const tempToken = searchParams.get('tempToken') ?? '';
  const provider = searchParams.get('provider') ?? '';
  const email = searchParams.get('email') ?? '';
  const accessToken = searchParams.get('accessToken') ?? '';
  const refreshToken = searchParams.get('refreshToken') ?? '';
  const isError = searchParams.get('error') === 'true';

  useEffect(() => {
    if (isError) {
      setError('소셜 로그인에 실패했어요. 다시 시도해주세요.');
      return;
    }

    if (!isNewUser && accessToken && refreshToken) {
      // 기존 사용자 — 토큰 저장 후 원래 페이지(또는 홈)로
      authApi
        .getMe()
        .then(({ data }) => {
          setAuth(data.data, accessToken, refreshToken);
          const redirect = sessionStorage.getItem('loginRedirect');
          sessionStorage.removeItem('loginRedirect');
          navigate(redirect ?? '/', { replace: true });
        })
        .catch(() => {
          setError('로그인 처리 중 오류가 발생했어요.');
        });
    }
  }, []);

  const handleRoleSelect = async (role: Role) => {
    if (!tempToken) return;
    setRoleLoading(true);
    setError('');
    try {
      const { data } = await authApi.completeOAuth2({ tempToken, role });
      const { accessToken, refreshToken, user } = data.data;
      setAuth(user, accessToken, refreshToken);
      const redirect = sessionStorage.getItem('loginRedirect');
      sessionStorage.removeItem('loginRedirect');
      if (redirect && role === 'CONSUMER') navigate(redirect, { replace: true });
      else if (role === 'FARMER') navigate('/farm/dashboard', { replace: true });
      else navigate('/mypage', { replace: true });
    } catch (err: any) {
      setError(
        err?.response?.data?.error?.message ?? '가입 처리 중 오류가 발생했어요.',
      );
    } finally {
      setRoleLoading(false);
    }
  };

  if (isError || error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-gutter">
        <div className="text-center max-w-sm">
          <span className="material-symbols-outlined text-[64px] text-error mb-md block">
            error
          </span>
          <h2 className="font-headline-md text-headline-md text-on-surface mb-sm">
            로그인 실패
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant mb-lg">
            {error || '소셜 로그인에 실패했어요. 다시 시도해주세요.'}
          </p>
          <Button onClick={() => navigate('/login')}>로그인 페이지로</Button>
        </div>
      </div>
    );
  }

  if (!isNewUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-md">
          <LoadingSpinner size="lg" />
          <p className="font-body-md text-body-md text-on-surface-variant">로그인 처리 중...</p>
        </div>
      </div>
    );
  }

  // 신규 가입 — 역할 선택
  const providerLabel = provider === 'kakao' ? '카카오' : provider === 'google' ? '구글' : provider;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-gutter">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-outline-variant p-lg text-center">
          <div className="w-16 h-16 bg-primary-fixed rounded-full flex items-center justify-center mx-auto mb-md">
            <span className="material-symbols-outlined text-[32px] text-primary">waving_hand</span>
          </div>

          <h2 className="font-headline-md text-headline-md text-on-surface mb-xs">
            {providerLabel} 가입을 환영해요!
          </h2>
          {email && (
            <p className="font-body-md text-body-md text-on-surface-variant mb-lg">{email}</p>
          )}

          <p className="font-body-md text-body-md text-on-surface mb-lg">
            어떤 용도로 이용하실 건가요?
          </p>

          <div className="flex flex-col gap-md">
            <button
              onClick={() => handleRoleSelect('CONSUMER')}
              disabled={roleLoading}
              className="w-full p-md border-2 border-outline-variant rounded-xl text-left hover:border-primary hover:bg-primary-fixed transition-all cursor-pointer disabled:opacity-50"
            >
              <div className="flex items-center gap-md">
                <span className="text-3xl">🛒</span>
                <div>
                  <p className="font-headline-sm text-headline-sm text-on-surface">소비자</p>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    신선한 농산물을 구매하고 싶어요
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleRoleSelect('FARMER')}
              disabled={roleLoading}
              className="w-full p-md border-2 border-outline-variant rounded-xl text-left hover:border-primary hover:bg-primary-fixed transition-all cursor-pointer disabled:opacity-50"
            >
              <div className="flex items-center gap-md">
                <span className="text-3xl">🌾</span>
                <div>
                  <p className="font-headline-sm text-headline-sm text-on-surface">농가</p>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    직접 기른 농산물을 판매하고 싶어요
                  </p>
                </div>
              </div>
            </button>
          </div>

          {roleLoading && (
            <div className="flex justify-center mt-md">
              <LoadingSpinner />
            </div>
          )}

          {error && (
            <p className="font-body-md text-body-md text-error mt-md">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
