'use client';

import { useAuthStore } from '@/store';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { authApi } from '@/lib/api';

export function useAuth() {
  const { user, token, setAuth, logout, isAdmin, isAuthenticated } = useAuthStore();
  const router = useRouter();

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    const data = res.data.data || res.data;
    setAuth(data.user, data.access_token);
    return data;
  }, [setAuth]);

  const signup = useCallback(async (data: { email: string; password: string; display_name: string; username?: string }) => {
    const res = await authApi.signup(data);
    const result = res.data.data || res.data;
    setAuth(result.user, result.access_token);
    return result;
  }, [setAuth]);

  const handleLogout = useCallback(() => {
    logout();
    router.push('/login');
  }, [logout, router]);

  return {
    user,
    token,
    login,
    signup,
    logout: handleLogout,
    isAdmin: isAdmin(),
    isAuthenticated: isAuthenticated(),
  };
}
