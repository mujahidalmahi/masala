'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, Activity, ClipboardList, Clock, ArrowRight, BookOpen, FileQuestion, Award, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { adminApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const statCards = [
  { label: 'Total Users', key: 'total_users', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { label: 'Active Today', key: 'active_today', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { label: 'Total Quizzes', key: 'total_quizzes', icon: ClipboardList, color: 'text-violet-500', bg: 'bg-violet-500/10' },
  { label: 'Total Sessions', key: 'total_sessions', icon: Clock, color: 'text-orange-500', bg: 'bg-orange-500/10' },
];

const quickLinks = [
  { label: 'Manage Users', href: '/users', icon: Users },
  { label: 'Curriculum', href: '/curriculum', icon: BookOpen },
  { label: 'Questions Bank', href: '/questions', icon: FileQuestion },
  { label: 'Badges', href: '/badges', icon: Award },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.getStats().then((r) => r.data),
  });

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      <motion.div variants={item}>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your StudySprint platform</p>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          const value = stats?.[stat.key];
          return (
            <Card key={stat.key} className="bg-card border-border">
              <CardContent className="p-4 sm:p-6">
                {isLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-10 w-10 rounded-lg bg-muted" />
                    <Skeleton className="h-8 w-20 bg-muted" />
                    <Skeleton className="h-4 w-24 bg-muted" />
                  </div>
                ) : (
                  <>
                    <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
                      <Icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-foreground">{value ?? '—'}</p>
                    <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={item}>
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground text-lg">Recent Activity</CardTitle>
              <CardDescription>Latest actions on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full bg-muted" />
                  ))}
                </div>
              ) : stats?.recent_activity?.length > 0 ? (
                <div className="space-y-3">
                  {stats.recent_activity.slice(0, 5).map((activity: any) => (
                    <div key={activity.id} className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="text-foreground flex-1">{activity.message}</span>
                      <span className="text-muted-foreground text-xs">{formatDate(activity.created_at)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm py-8 text-center">No recent activity</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground text-lg">Quick Links</CardTitle>
              <CardDescription>Navigate to management sections</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {quickLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link key={link.href} href={link.href}>
                      <Button variant="outline" className="w-full justify-start gap-3 h-auto py-4">
                        <Icon className="w-4 h-4" />
                        {link.label}
                        <ArrowRight className="w-3 h-3 ml-auto text-muted-foreground" />
                      </Button>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
