import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import * as authApi from '../api/auth';
import type { Role } from '../types';

const APP_MODE = (import.meta.env.VITE_APP_MODE ?? 'user') as 'user' | 'admin';

export function useAuth() {
  const navigate = useNavigate();
  const { user, isAuthenticated, setAuth, logout: storeLogout } = useAuthStore();

  const enforceMode = (role: Role) => {
    if (APP_MODE === 'user' && role === 'ADMIN') {
      storeLogout();
      throw new Error('관리자 계정은 여기서 로그인할 수 없어요.');
    }
    if (APP_MODE === 'admin' && role !== 'ADMIN') {
      storeLogout();
      throw new Error('관리자 계정만 로그인할 수 있어요.');
    }
  };

  const login = async (email: string, password: string, redirectTo?: string) => {
    const { data } = await authApi.login({ email, password });
    const { accessToken, refreshToken, user } = data.data;
    setAuth(user, accessToken, refreshToken);
    try {
      enforceMode(user.role);
    } catch (e) {
      throw e;
    }
    if (redirectTo) navigate(redirectTo);
    else redirectAfterLogin(user.role);
  };

  const register = async (email: string, password: string, role: Role, redirectTo?: string) => {
    const { data } = await authApi.register({ email, password, role });
    const { accessToken, refreshToken, user } = data.data;
    setAuth(user, accessToken, refreshToken);
    if (redirectTo) navigate(redirectTo);
    else redirectAfterLogin(user.role);
  };

  const logout = () => {
    storeLogout();
    navigate('/login');
  };

  const redirectAfterLogin = (role: Role) => {
    if (APP_MODE === 'admin') {
      navigate('/admin');
      return;
    }
    if (role === 'CONSUMER') navigate('/mypage');
    else if (role === 'FARMER') navigate('/farm/dashboard');
    else navigate('/');
  };

  return { user, isAuthenticated, login, register, logout };
}
