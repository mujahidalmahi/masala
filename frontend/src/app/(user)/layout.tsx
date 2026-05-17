'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useAuthStore, useUIStore, useHydrated } from '@/store';
import { usersApi } from '@/lib/api';
import { DashboardSidebar } from '@/components/shared/dashboard-sidebar';
import { DashboardNavbar } from '@/components/shared/dashboard-navbar';
import { FloatingTimer } from '@/components/shared/floating-timer';
import { Loader2 } from 'lucide-react';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const hydrated = useHydrated();
  const { user, token, updateUser } = useAuthStore();
  const { sidebarOpen, mobileSidebarOpen, setSidebarOpen, setMobileSidebarOpen } = useUIStore();
  const isMobile = useMediaQuery('(max-width: 767px)');

  useEffect(() => {
    if (!hydrated) return;
    if (!token || !user) {
      router.push('/login');
    } else if (user.role === 'admin') {
      router.push('/admin/dashboard');
    }
  }, [hydrated, token, user, router]);

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile, setSidebarOpen]);

  // Refresh profile from server so navbar XP stays in sync
  const refreshProfile = useCallback(async () => {
    try {
      const res = await usersApi.getProfile();
      const profile = res.data?.data || res.data;
      if (profile?.xp_total != null) updateUser({ xp_total: profile.xp_total });
    } catch {}
  }, [updateUser]);

  useEffect(() => {
    refreshProfile();
    const onFocus = () => refreshProfile();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [refreshProfile]);

  const handleMenuClick = () => {
    if (isMobile) {
      setMobileSidebarOpen(true);
    } else {
      useUIStore.getState().toggleSidebar();
    }
  };

  if (!hydrated || !token || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar
        isCollapsed={!sidebarOpen}
        isMobile={isMobile}
        open={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />
      <div className={`transition-all duration-300 ${isMobile ? 'ml-0' : sidebarOpen ? 'ml-60' : 'ml-16'}`}>
        <DashboardNavbar onMenuClick={handleMenuClick} />
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
        <FloatingTimer />
      </div>
    </div>
  );
}
