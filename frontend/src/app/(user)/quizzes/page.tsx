'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FileQuestion, Play, Clock, CheckCircle, XCircle, BarChart3, TrendingUp } from 'lucide-react';
import { quizzesApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getDifficultyLabel, formatDate, formatPercentage } from '@/lib/utils';
import { toast } from 'sonner';
import { Quiz, QuizAttempt } from '@/types';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export default function QuizzesPage() {
  const queryClient = useQueryClient();

  const { data: quizzes, isLoading: quizzesLoading, error: quizzesError } = useQuery({
    queryKey: ['quizzes'],
    queryFn: async () => {
      const res = await quizzesApi.getAll();
      return (res.data.data || res.data) as Quiz[];
    },
  });

  const { data: attempts, isLoading: attemptsLoading } = useQuery({
    queryKey: ['quiz-attempts'],
    queryFn: async () => {
      const res = await quizzesApi.getAttempts();
      return (res.data.data || res.data) as QuizAttempt[];
    },
  });

  const startMutation = useMutation({
    mutationFn: (quizId: string) => quizzesApi.startAttempt({ quiz_id: quizId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-attempts'] });
      toast.success('Quiz started!');
    },
    onError: () => toast.error('Failed to start quiz'),
  });

  if (quizzesLoading || attemptsLoading) return <QuizzesSkeleton />;
  if (quizzesError) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <TrendingUp className="h-10 w-10" />
          <p>Failed to load quizzes. Please try again later.</p>
        </div>
      </div>
    );
  }

  const completedAttempts = attempts?.filter((a) => a.status === 'completed') ?? [];
  const avgScore = completedAttempts.length > 0
    ? completedAttempts.reduce((sum, a) => sum + (a.percentage ?? 0), 0) / completedAttempts.length
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Quizzes</h1>
        <p className="text-muted-foreground mt-1">Test your knowledge and track your progress.</p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Available</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <FileQuestion className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-foreground">{quizzes?.length ?? 0}</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-foreground">{completedAttempts.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Score</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-foreground">{formatPercentage(avgScore)}</div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-foreground mb-3">Available Quizzes</h2>
        {quizzes && quizzes.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
          >
            {quizzes.map((quiz) => (
              <motion.div key={quiz.id} variants={itemVariants}>
                <Card className="bg-card border-border h-full flex flex-col">
                  <CardHeader>
                    <CardTitle className="text-base text-foreground">{quiz.title}</CardTitle>
                    {quiz.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{quiz.description}</p>
                    )}
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-between">
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="info" className="capitalize text-xs">{quiz.quiz_type}</Badge>
                      {quiz.difficulty && (
                        <Badge variant={quiz.difficulty >= 4 ? 'warning' : quiz.difficulty >= 3 ? 'default' : 'secondary'} className="text-xs">
                          {getDifficultyLabel(quiz.difficulty)}
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs gap-1">
                        <FileQuestion className="h-3 w-3" /> {quiz.total_questions}
                      </Badge>
                      {quiz.time_limit_minutes && (
                        <Badge variant="outline" className="text-xs gap-1">
                          <Clock className="h-3 w-3" /> {quiz.time_limit_minutes}m
                        </Badge>
                      )}
                    </div>
                    <Button
                      className="w-full gap-2"
                      size="sm"
                      onClick={() => startMutation.mutate(quiz.id)}
                      disabled={startMutation.isPending}
                    >
                      <Play className="h-4 w-4" />
                      Start Quiz
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <Card className="bg-card border-border">
            <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <FileQuestion className="h-10 w-10 mb-3" />
              <p className="text-lg font-medium">No quizzes available</p>
              <p className="text-sm mt-1">Generate or create a quiz to get started.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {attempts && attempts.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-3">Past Attempts</h2>
          <Card className="bg-card border-border">
            <CardContent className="p-0">
              {attempts.map((attempt, i) => (
                <div
                  key={attempt.id}
                  className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 p-4 ${i < attempts.length - 1 ? 'border-b border-border' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    {attempt.status === 'completed' ? (
                      attempt.percentage && attempt.percentage >= 60
                        ? <CheckCircle className="h-5 w-5 text-emerald-500" />
                        : <XCircle className="h-5 w-5 text-destructive" />
                    ) : (
                      <Clock className="h-5 w-5 text-yellow-500" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-foreground">{attempt.quizzes?.title || 'Quiz'}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(attempt.started_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={attempt.status === 'completed' ? 'success' : 'warning'} className="capitalize text-xs">
                      {attempt.status}
                    </Badge>
                    {attempt.percentage != null && (
                      <span className="text-sm font-medium text-foreground">{formatPercentage(attempt.percentage)}</span>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function QuizzesSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-5 w-48 mt-2" />
      </div>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="bg-card border-border">
            <CardHeader className="pb-2"><Skeleton className="h-4 w-20" /></CardHeader>
            <CardContent><Skeleton className="h-8 w-12" /></CardContent>
          </Card>
        ))}
      </div>
      <Skeleton className="h-6 w-36" />
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="bg-card border-border">
            <CardHeader><Skeleton className="h-5 w-32" /></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Skeleton className="h-5 w-14 rounded-full" />
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
              <Skeleton className="h-9 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
