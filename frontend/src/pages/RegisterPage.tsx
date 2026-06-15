import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import logo from '../assets/logo.png';
import * as authApi from '../api/auth';
import { updateMyFarm } from '../api/farm';
import useAuthStore from '../store/authStore';
import type { Role } from '../types';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const FARM_CATEGORIES = ['채소', '과일', '곡류', '축산', '수산', '기타'];
const CERTIFICATIONS = ['무농약', '유기농', 'GAP인증', '친환경'];

export default function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);

  const initialRole: Role = searchParams.get('role') === 'farmer' ? 'FARMER' : 'CONSUMER';
  const [role, setRole] = useState<Role>(initialRole);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  const [farmName, setFarmName] = useState('');
  const [region, setRegion] = useState('');
  const [category, setCategory] = useState(FARM_CATEGORIES[0]);
  const [certification, setCertification] = useState('');
  const [description, setDescription] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('비밀번호는 8자 이상이어야 해요.');
      return;
    }
    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않아요.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await authApi.register({ email, password, role });
      const { accessToken, refreshToken, user } = data.data;

      setAuth(user, accessToken, refreshToken);

      if (role === 'FARMER' && farmName) {
        await updateMyFarm({
          name: farmName,
          region,
          category,
          certification: certification || undefined,
          description: description || undefined,
        });
      }

      navigate(role === 'FARMER' ? '/farm/dashboard' : '/mypage');
    } catch (err: any) {
      setError(
        err?.response?.data?.error?.message ??
          '회원가입에 실패했어요. 다시 시도해주세요.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background py-xl px-gutter">
      <div className="mx-auto w-full max-w-[36rem]">
        {/* 로고 */}
        <div className="text-center mb-lg">
          <Link to="/" className="inline-flex flex-col items-center gap-sm">
            <img src={logo} alt="Farmer's Market" className="h-14 w-auto" />
            <span className="font-headline-md text-headline-md font-bold text-primary">
              Farmer's Market
            </span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-outline-variant p-lg">
          <h1 className="font-headline-sm text-headline-sm text-on-surface mb-lg">회원가입</h1>

          {/* 역할 탭 */}
          <div className="flex rounded-xl overflow-hidden border border-outline-variant mb-lg">
            {(['CONSUMER', 'FARMER'] as Role[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`flex-1 py-sm font-body-md text-body-md transition-colors cursor-pointer ${
                  role === r
                    ? 'bg-primary text-on-primary'
                    : 'bg-white text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                {r === 'CONSUMER' ? '🛒 소비자' : '🌾 농가'}
              </button>
            ))}
          </div>

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
              label="비밀번호 (8자 이상)"
              type="password"
              placeholder="비밀번호를 입력해주세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Input
              label="비밀번호 확인"
              type="password"
              placeholder="비밀번호를 다시 입력해주세요"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              error={passwordConfirm && password !== passwordConfirm ? '비밀번호가 일치하지 않아요.' : ''}
              required
            />

            {/* 농가 전용 추가 입력 */}
            {role === 'FARMER' && (
              <div className="flex flex-col gap-md pt-md border-t border-outline-variant">
                <p className="font-label-md text-label-md text-primary font-semibold">
                  🌱 농가 정보 (선택 — 나중에 수정 가능)
                </p>
                <Input
                  label="농장명"
                  placeholder="예) 청솔농장"
                  value={farmName}
                  onChange={(e) => setFarmName(e.target.value)}
                />
                <Input
                  label="지역"
                  placeholder="예) 충남 아산"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                />
                <div className="flex flex-col gap-xs">
                  <label className="font-label-md text-label-md text-on-surface-variant">카테고리</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-md py-sm border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary py-sm"
                  >
                    {FARM_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-xs">
                  <label className="font-label-md text-label-md text-on-surface-variant">인증 (선택)</label>
                  <select
                    value={certification}
                    onChange={(e) => setCertification(e.target.value)}
                    className="w-full px-md py-sm border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary py-sm"
                  >
                    <option value="">없음</option>
                    {CERTIFICATIONS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-xs">
                  <label className="font-label-md text-label-md text-on-surface-variant">농가 소개 (선택)</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="농가를 소개해주세요"
                    rows={3}
                    className="w-full px-md py-sm border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>
              </div>
            )}

            {error && (
              <p className="font-body-md text-body-md text-error bg-error-container px-md py-sm rounded-lg">
                {error}
              </p>
            )}

            <Button type="submit" loading={loading} className="w-full mt-xs">
              {role === 'FARMER' ? '농가 회원가입' : '소비자 회원가입'}
            </Button>
          </form>
        </div>

        <div className="text-center mt-lg">
          <span className="font-body-md text-body-md text-on-surface-variant">
            이미 계정이 있으신가요?{' '}
          </span>
          <Link to="/login" className="font-body-md text-body-md text-primary font-semibold hover:underline">
            로그인
          </Link>
        </div>
      </div>
    </div>
  );
}
