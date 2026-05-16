'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  isAdmin: () => boolean;
  isAuthenticated: () => boolean;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,

      setAuth: (user, token) => {
        localStorage.setItem('access_token', token);
        document.cookie = `access_token=${token}; path=/; max-age=604800; SameSite=Lax`;
        set({ user, token });
      },

      logout: () => {
        localStorage.removeItem('access_token');
        document.cookie = 'access_token=; path=/; max-age=0';
        set({ user: null, token: null });
      },

      isAdmin: () => get().user?.role === 'admin',

      isAuthenticated: () => !!get().token && !!get().user,

      updateUser: (data) => {
        const current = get().user;
        if (current) set({ user: { ...current, ...data } });
      },
    }),
    {
      name: 'studysprint-auth',
      partialize: (state) => ({ user: state.user, token: state.token }),
    },
  ),
);

interface UIState {
  sidebarOpen: boolean;
  mobileSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setMobileSidebarOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  sidebarOpen: true,
  mobileSidebarOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),
}));
