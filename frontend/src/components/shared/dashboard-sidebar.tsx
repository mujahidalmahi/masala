'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, BookOpen, Brain, Users, Flame, BarChart3, Clock,
  CalendarDays, FileText, Settings, Zap, GraduationCap, Gamepad2,
  type LucideIcon,
} from 'lucide-react';
import { Sheet, SheetContent } from '@/components/ui/sheet';

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const userNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Study Sessions', href: '/study-sessions', icon: Clock },
  { label: 'Quizzes', href: '/quizzes', icon: Brain },
  { label: 'Focus Rooms', href: '/rooms', icon: Users },
  { label: 'Gamification', href: '/gamification', icon: Gamepad2 },
  { label: 'Reports', href: '/reports', icon: BarChart3 },
  { label: 'Routine', href: '/routine', icon: CalendarDays },
  { label: 'Textbooks', href: '/textbooks', icon: FileText },
  { label: 'Settings', href: '/settings', icon: Settings },
];

const adminNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Curriculum', href: '/admin/curriculum', icon: BookOpen },
  { label: 'Questions', href: '/admin/questions', icon: Brain },
  { label: 'Badges', href: '/admin/badges', icon: Flame },
  { label: 'Rooms', href: '/admin/rooms', icon: GraduationCap },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

interface SidebarProps {
  isAdmin?: boolean;
  isCollapsed?: boolean;
  isMobile?: boolean;
  open?: boolean;
  onClose?: () => void;
}

function SidebarContent({ isAdmin, isCollapsed }: { isAdmin: boolean; isCollapsed?: boolean }) {
  const pathname = usePathname();
  const items = isAdmin ? adminNavItems : userNavItems;

  return (
    <>
      <Link
        href={isAdmin ? '/admin/dashboard' : '/dashboard'}
        className={cn(
          'flex items-center gap-2 border-b border-border px-4 h-16 shrink-0',
          isCollapsed && 'justify-center px-0',
        )}
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shrink-0">
          <Zap className="w-4 h-4 text-white" />
        </div>
        {!isCollapsed && (
          <div className="flex flex-col">
            <span className="font-bold text-sm text-foreground">StudySprint</span>
            <span className="text-[10px] text-muted-foreground">{isAdmin ? 'Admin Panel' : 'OS'}</span>
          </div>
        )}
      </Link>

      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 2 }}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200',
                  isCollapsed && 'justify-center px-0',
                  isActive
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent',
                )}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {!isCollapsed && (
        <div className="border-t border-border p-4">
          <p className="text-[10px] text-muted-foreground/50 text-center">
            StudySprint OS v1.0
          </p>
        </div>
      )}
    </>
  );
}

export function DashboardSidebar({ isAdmin = false, isCollapsed = false, isMobile = false, open = false, onClose }: SidebarProps) {
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent side="left" className="w-60 p-0 bg-background border-r border-border flex flex-col">
          <SidebarContent isAdmin={isAdmin} isCollapsed={false} />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-border bg-background transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-60',
      )}
    >
      <SidebarContent isAdmin={isAdmin} isCollapsed={isCollapsed} />
    </aside>
  );
}
