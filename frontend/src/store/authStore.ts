import { create } from 'zustand';
import type { User } from '../types';
import { getMe } from '../api/auth';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isHydrating: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
  hydrate: () => Promise<void>;
}

const initialToken = localStorage.getItem('accessToken');

const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: initialToken,
  refreshToken: localStorage.getItem('refreshToken'),
  isAuthenticated: !!initialToken,
  isHydrating: !!initialToken,

  setAuth: (user, accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    set({ user, accessToken, refreshToken, isAuthenticated: true, isHydrating: false });
  },

  setUser: (user) => {
    set({ user });
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false, isHydrating: false });
  },

  hydrate: async () => {
    if (!get().accessToken) {
      set({ isHydrating: false });
      return;
    }
    try {
      const { data } = await getMe({ _skipAuthRedirect: true } as Parameters<typeof getMe>[0]);
      set({ user: data.data, isAuthenticated: true, isHydrating: false });
    } catch {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false, isHydrating: false });
    }
  },
}));

export default useAuthStore;
