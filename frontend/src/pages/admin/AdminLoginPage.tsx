import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import logo from '../../assets/logo.png';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

export default function AdminLoginPage() {
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

  return (
    <div className="bg-background min-h-screen py-xl px-gutter flex items-center">
      <div className="mx-auto w-full max-w-[28rem]">
        <div className="text-center mb-lg">
          <div className="inline-flex flex-col items-center gap-sm">
            <img src={logo} alt="Farmer's Market" className="h-16 w-auto" />
            <span className="font-headline-md text-headline-md font-bold text-primary">
              Farmer's Market — 관리자
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-outline-variant p-lg">
          <h1 className="font-headline-sm text-headline-sm text-on-surface mb-lg">관리자 로그인</h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-md">
            <Input
              label="이메일"
              type="email"
              placeholder="관리자 이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="비밀번호"
              type="password"
              placeholder="비밀번호"
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
        </div>
      </div>
    </div>
  );
}
