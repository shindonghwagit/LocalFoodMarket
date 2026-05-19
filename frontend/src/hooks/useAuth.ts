import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import * as authApi from '../api/auth';
import type { Role } from '../types';

export function useAuth() {
  const navigate = useNavigate();
  const { user, isAuthenticated, setAuth, logout: storeLogout } = useAuthStore();

  const login = async (email: string, password: string) => {
    const { data } = await authApi.login(email, password);
    const { accessToken, refreshToken, user } = data.data;
    setAuth(user, accessToken, refreshToken);
    redirectAfterLogin(user.role);
  };

  const register = async (email: string, password: string, role: Role) => {
    const { data } = await authApi.register(email, password, role);
    const { accessToken, refreshToken, user } = data.data;
    setAuth(user, accessToken, refreshToken);
    redirectAfterLogin(user.role);
  };

  const logout = () => {
    storeLogout();
    navigate('/login');
  };

  const redirectAfterLogin = (role: Role) => {
    if (role === 'CONSUMER') navigate('/mypage');
    else if (role === 'FARMER') navigate('/farm/dashboard');
    else if (role === 'ADMIN') navigate('/admin');
  };

  return { user, isAuthenticated, login, register, logout };
}
