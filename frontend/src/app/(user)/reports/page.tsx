'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { CalendarDays, TrendingUp, Clock, Zap, BookOpen, BarChart3, Search } from 'lucide-react';
import { reportsApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatTime, formatPercentage } from '@/lib/utils';
import { toast } from 'sonner';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export default function ReportsPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { data: weekly, isLoading: weeklyLoading, error: weeklyError } = useQuery({
    queryKey: ['reports-weekly'],
    queryFn: async () => {
      const res = await reportsApi.getWeekly();
      return res.data.data || res.data;
    },
  });

  const { data: monthly, isLoading: monthlyLoading, error: monthlyError } = useQuery({
    queryKey: ['reports-monthly'],
    queryFn: async () => {
      const res = await reportsApi.getMonthly();
      return res.data.data || res.data;
    },
  });

  const { data: custom, isLoading: customLoading, refetch: refetchCustom } = useQuery({
    queryKey: ['reports-custom', startDate, endDate],
    queryFn: async () => {
      const res = await reportsApi.getCustom(startDate, endDate);
      return res.data.data || res.data;
    },
    enabled: false,
  });

  function handleCustomReport() {
    if (!startDate || !endDate) {
      toast.error('Please select both start and end dates');
      return;
    }
    refetchCustom();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Reports</h1>
        <p className="text-muted-foreground mt-1">Review your study performance and progress.</p>
      </div>

      <Tabs defaultValue="weekly" className="space-y-4">
        <TabsList>
          <TabsTrigger value="weekly" className="gap-2">
            <CalendarDays className="h-4 w-4" /> Weekly
          </TabsTrigger>
          <TabsTrigger value="monthly" className="gap-2">
            <CalendarDays className="h-4 w-4" /> Monthly
          </TabsTrigger>
          <TabsTrigger value="custom" className="gap-2">
            <Search className="h-4 w-4" /> Custom
          </TabsTrigger>
        </TabsList>

        <TabsContent value="weekly">
          <ReportStats data={weekly} loading={weeklyLoading} error={weeklyError} />
        </TabsContent>

        <TabsContent value="monthly">
          <ReportStats data={monthly} loading={monthlyLoading} error={monthlyError} />
        </TabsContent>

        <TabsContent value="custom">
          <Card className="bg-card border-border mb-4">
            <CardHeader>
              <CardTitle className="text-lg text-foreground">Custom Date Range</CardTitle>
              <CardDescription>Select a date range to generate a report.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-3 items-end">
                <div className="space-y-1.5 flex-1">
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5 flex-1">
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
                <Button onClick={handleCustomReport} disabled={customLoading} className="gap-2">
                  <Search className="h-4 w-4" />
                  {customLoading ? 'Loading...' : 'Generate'}
                </Button>
              </div>
            </CardContent>
          </Card>
          {custom && (
            <ReportStats data={custom} loading={false} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ReportStats({
  data,
  loading,
  error,
}: {
  data: any;
  loading: boolean;
  error?: Error | null;
}) {
  if (loading) return <ReportStatsSkeleton />;
  if (error) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <TrendingUp className="h-10 w-10 mb-3" />
          <p className="text-lg font-medium">Failed to load report</p>
        </CardContent>
      </Card>
    );
  }
  if (!data) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <TrendingUp className="h-10 w-10 mb-3" />
          <p className="text-lg font-medium">No data available</p>
          <p className="text-sm mt-1">Complete some study sessions to see your report.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        <motion.div variants={itemVariants}>
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Time</CardTitle>
              <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Clock className="h-4 w-4 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-foreground">
                {formatTime(data.total_minutes ?? data.total_time ?? 0)}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Sessions</CardTitle>
              <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-purple-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-foreground">
                {data.session_count ?? data.total_sessions ?? 0}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">XP Earned</CardTitle>
              <div className="h-8 w-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <Zap className="h-4 w-4 text-yellow-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-foreground">
                {data.xp_earned ?? data.total_xp ?? 0}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Score</CardTitle>
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-emerald-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-foreground">
                {formatPercentage(data.avg_score ?? data.average_score ?? 0)}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {data.subjects && data.subjects.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">Subjects Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.subjects.map((subject: any, i: number) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{subject.name || subject.subject}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      {formatTime(subject.minutes ?? subject.total_minutes ?? 0)}
                    </span>
                    <Progress value={subject.percentage ?? 0} className="h-2 w-20" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {data.quizzes && data.quizzes.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">Quizzes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.quizzes.map((q: any, i: number) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{q.title || q.name}</span>
                  <Badge variant={q.score >= 60 ? 'success' : 'destructive'} className="text-xs">
                    {formatPercentage(q.score ?? q.percentage ?? 0)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}

function ReportStatsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="bg-card border-border">
            <CardHeader className="pb-2"><Skeleton className="h-4 w-20" /></CardHeader>
            <CardContent><Skeleton className="h-8 w-16" /></CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ReportsSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-5 w-48 mt-2" />
      </div>
      <Skeleton className="h-10 w-64" />
      <ReportStatsSkeleton />
    </div>
  );
}
