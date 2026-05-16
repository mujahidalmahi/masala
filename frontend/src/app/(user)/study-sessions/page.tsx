'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Play, Clock, BookOpen, Brain, Pencil, ListChecks, BarChart3, TrendingUp } from 'lucide-react';
import { sessionsApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatTime, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import { StudySession } from '@/types';

const sessionTypeIcon: Record<string, React.ReactNode> = {
  focus: <Brain className="h-4 w-4" />,
  revision: <BookOpen className="h-4 w-4" />,
  practice: <Pencil className="h-4 w-4" />,
  quiz: <ListChecks className="h-4 w-4" />,
  reading: <BookOpen className="h-4 w-4" />,
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export default function StudySessionsPage() {
  const queryClient = useQueryClient();
  const [creating, setCreating] = useState(false);

  const { data: sessions, isLoading: sessionsLoading, error: sessionsError } = useQuery({
    queryKey: ['study-sessions'],
    queryFn: async () => {
      const res = await sessionsApi.getHistory({ limit: 50 });
      return res.data as StudySession[];
    },
  });

  const { data: stats } = useQuery({
    queryKey: ['study-sessions-stats'],
    queryFn: async () => {
      const res = await sessionsApi.getStats();
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: () => sessionsApi.create({ session_type: 'focus', duration_minutes: 25 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['study-sessions-stats'] });
      toast.success('Study session started!');
      setCreating(false);
    },
    onError: () => {
      toast.error('Failed to start session');
      setCreating(false);
    },
  });

  const endMutation = useMutation({
    mutationFn: (id: string) => sessionsApi.endSession(id, { ended_at: new Date().toISOString() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['study-sessions-stats'] });
      toast.success('Session ended');
    },
    onError: () => toast.error('Failed to end session'),
  });

  if (sessionsLoading) return <SessionsSkeleton />;
  if (sessionsError) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <TrendingUp className="h-10 w-10" />
          <p>Failed to load sessions. Please try again later.</p>
        </div>
      </div>
    );
  }

  const totalMinutes = sessions?.reduce((sum, s) => sum + s.duration_minutes, 0) ?? 0;
  const totalXp = sessions?.reduce((sum, s) => sum + (s.xp_earned ?? 0), 0) ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Study Sessions</h1>
          <p className="text-muted-foreground mt-1">Track and manage your study time.</p>
        </div>
        <Button
          onClick={() => { setCreating(true); createMutation.mutate(); }}
          disabled={createMutation.isPending}
          className="gap-2 w-full sm:w-auto"
        >
          <Play className="h-4 w-4" />
          {createMutation.isPending ? 'Starting...' : 'Start Session'}
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Time</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Clock className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-foreground">{formatTime(totalMinutes)}</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Sessions</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-foreground">{sessions?.length ?? 0}</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">XP Earned</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-yellow-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-foreground">{totalXp}</div>
          </CardContent>
        </Card>
      </div>

      {sessions && sessions.length > 0 ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-2"
        >
          {sessions.map((session) => (
            <motion.div key={session.id} variants={itemVariants}>
              <Card className="bg-card border-border transition-colors">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
                        {sessionTypeIcon[session.session_type] || <Brain className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{session.subjects?.name || 'General'}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="secondary" className="text-[10px] capitalize">
                            {session.session_type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{formatDate(session.started_at)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">{formatTime(session.duration_minutes)}</span>
                      {session.xp_earned > 0 && (
                        <Badge variant="info" className="text-xs">+{session.xp_earned} XP</Badge>
                      )}
                      {!session.ended_at && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => endMutation.mutate(session.id)}
                          disabled={endMutation.isPending}
                        >
                          End
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <Card className="bg-card border-border">
          <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Play className="h-10 w-10 mb-3" />
            <p className="text-lg font-medium">No sessions yet</p>
            <p className="text-sm mt-1">Start your first study session to see it here.</p>
            <Button
              className="mt-4 gap-2"
              onClick={() => { setCreating(true); createMutation.mutate(); }}
              disabled={createMutation.isPending}
            >
              <Play className="h-4 w-4" />
              Start Studying
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function SessionsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <div>
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-64 mt-2" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="bg-card border-border">
            <CardHeader className="pb-2"><Skeleton className="h-4 w-20" /></CardHeader>
            <CardContent><Skeleton className="h-8 w-16" /></CardContent>
          </Card>
        ))}
      </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-lg" />
                <div>
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-36 mt-1" />
                </div>
              </div>
              <Skeleton className="h-4 w-12" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
