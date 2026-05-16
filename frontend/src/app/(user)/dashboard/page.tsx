'use client';

import { useQuery } from '@tanstack/react-query';
import { motion, useReducedMotion } from 'framer-motion';
import { useRouter } from 'next/navigation';

import {
  Zap,
  Flame,
  Clock,
  FileQuestion,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';

import { usersApi } from '@/lib/api';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

import {
  formatTime,
  formatDate,
  getXPForNextLevel,
} from '@/lib/utils';

import { DashboardData } from '@/types';

const containerVariants = {
  hidden: { opacity: 0 },

  visible: {
    opacity: 1,

    transition: {
      staggerChildren: 0.06,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },

  visible: {
    opacity: 1,
    y: 0,
  },
};

export default function DashboardPage() {
  const shouldReduceMotion = useReducedMotion();
  const router = useRouter();

  const {
    data,
    isLoading,
    error,
  } = useQuery<DashboardData>({
    queryKey: ['dashboard'],

    queryFn: async () => {
      const res = await usersApi.getDashboard();
      return res.data.data || res.data;
    },

    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 2,
  });

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (!data || error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <TrendingUp className="h-10 w-10 text-muted-foreground" />

        <p className="text-lg font-medium text-muted-foreground text-center">
          {error
            ? 'Failed to load dashboard. Please try again later.'
            : 'No dashboard data available.'}
        </p>

        <Button
          variant="outline"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  const {
    profile,
    today,
    streak,
    recent_sessions,
    next_level,
  } = data;

  const currentLevel =
    next_level?.level ??
    profile?.level_id ??
    1;

  const xp = getXPForNextLevel(
    profile?.xp_total ?? 0,
    currentLevel
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Welcome back,{' '}
          {profile?.display_name ||
            profile?.username ||
            'Student'}
        </h1>

        <p className="text-muted-foreground mt-1">
          Here is your study overview for today.
        </p>
      </div>

      <motion.div
        variants={containerVariants}
        initial={shouldReduceMotion ? false : 'hidden'}
        animate={
          shouldReduceMotion
            ? undefined
            : 'visible'
        }
        className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4"
      >
        <motion.div variants={itemVariants}>
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total XP
              </CardTitle>

              <div className="h-8 w-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <Zap className="h-4 w-4 text-yellow-500" />
              </div>
            </CardHeader>

            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-foreground">
                {(profile?.xp_total ?? 0).toLocaleString()}
              </div>

              <p className="text-xs text-muted-foreground mt-1">
                Level{' '}
                {next_level?.level ??
                  profile?.level_id ??
                  1}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Current Streak
              </CardTitle>

              <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Flame className="h-4 w-4 text-orange-500" />
              </div>
            </CardHeader>

            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-foreground">
                {streak?.current_streak ??
                  profile?.current_streak ??
                  0}{' '}
                days
              </div>

              <p className="text-xs text-muted-foreground mt-1">
                Best:{' '}
                {streak?.longest_streak ??
                  profile?.longest_streak ??
                  0}{' '}
                days
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Study Time Today
              </CardTitle>

              <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Clock className="h-4 w-4 text-blue-500" />
              </div>
            </CardHeader>

            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-foreground">
                {formatTime(
                  today?.actual_minutes ??
                  today?.tracked_minutes ??
                  today?.total_minutes ??
                  0
                )}
              </div>

              <p className="text-xs text-muted-foreground mt-1">
                {today?.session_count ?? 0}{' '}
                session
                {(today?.session_count ?? 0) !== 1
                  ? 's'
                  : ''}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Quizzes Taken
              </CardTitle>

              <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <FileQuestion className="h-4 w-4 text-purple-500" />
              </div>
            </CardHeader>

            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-foreground">
                {today?.quiz_count ?? 0}
              </div>

              <p className="text-xs text-muted-foreground mt-1">
                This week
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg text-foreground">
            Level Progress
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>
              {(xp?.current ?? 0).toLocaleString()} XP
            </span>

            <span>
              {(xp?.needed ?? 0).toLocaleString()} XP
              to next level
            </span>
          </div>

          <Progress
            value={xp?.percentage ?? 0}
            className="h-2"
          />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg text-foreground">
              Recent Sessions
            </CardTitle>

            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => router.push('/sessions')}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardHeader>

          <CardContent>
            {Array.isArray(recent_sessions) &&
              recent_sessions.length > 0 ? (
              <div className="space-y-3">
                {recent_sessions
                  .slice(0, 5)
                  .map((session: any) => (
                    <div
                      key={session.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-primary" />

                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {session.subjects?.name ||
                              'Study Session'}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            {session.started_at
                              ? formatDate(
                                session.started_at
                              )
                              : 'Unknown date'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className="text-xs"
                        >
                          {session.session_type ||
                            'General'}
                        </Badge>

                        <span className="text-sm text-muted-foreground">
                          {formatTime(
                            session.actual_duration_minutes ??
                            session.actual_minutes ??
                            session.duration_minutes ??
                            0
                          )}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <TrendingUp className="h-8 w-8 mb-2" />

                <p className="text-sm">
                  No sessions yet. Start studying!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">
              Weak Areas
            </CardTitle>
          </CardHeader>

          <CardContent>
            {Array.isArray(data?.weak_areas) &&
              data.weak_areas.length > 0 ? (
              <div className="space-y-3">
                {data.weak_areas
                  .slice(0, 5)
                  .map((area: any, i: number) => (
                    <div
                      key={area.id || i}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm text-foreground">
                        {area.topic ||
                          area.name ||
                          'Unknown Area'}
                      </span>

                      <Progress
                        value={
                          area.mastery ??
                          area.score ??
                          0
                        }
                        className="h-2 w-24"
                      />
                    </div>
                  ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <p className="text-sm">
                  No weak areas identified yet.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-9 w-72" />
        <Skeleton className="h-5 w-48 mt-2" />
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
        {Array.from({ length: 4 }).map(
          (_, i) => (
            <Card
              key={i}
              className="bg-card border-border"
            >
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-20" />
              </CardHeader>

              <CardContent>
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-24 mt-2" />
              </CardContent>
            </Card>
          )
        )}
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>

        <CardContent className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-2 w-full" />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="bg-card border-border">
          <CardHeader>
            <Skeleton className="h-6 w-36" />
          </CardHeader>

          <CardContent className="space-y-3">
            {Array.from({ length: 3 }).map(
              (_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between"
                >
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-16" />
                </div>
              )
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <Skeleton className="h-6 w-28" />
          </CardHeader>

          <CardContent className="space-y-3">
            {Array.from({ length: 3 }).map(
              (_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between"
                >
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-2 w-24" />
                </div>
              )
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
