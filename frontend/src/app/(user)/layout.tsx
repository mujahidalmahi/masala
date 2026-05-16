'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useAuthStore, useUIStore } from '@/store';
import { DashboardSidebar } from '@/components/shared/dashboard-sidebar';
import { DashboardNavbar } from '@/components/shared/dashboard-navbar';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const { sidebarOpen, mobileSidebarOpen, setSidebarOpen, setMobileSidebarOpen } = useUIStore();
  const isMobile = useMediaQuery('(max-width: 767px)');

  useEffect(() => {
    if (!token || !user) {
      router.push('/login');
    }
  }, [token, user, router]);

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile, setSidebarOpen]);

  const handleMenuClick = () => {
    if (isMobile) {
      setMobileSidebarOpen(true);
    } else {
      useUIStore.getState().toggleSidebar();
    }
  };

  if (!token || !user) return null;

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
      </div>
    </div>
  );
}
