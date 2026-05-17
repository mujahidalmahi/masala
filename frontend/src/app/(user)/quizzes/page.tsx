'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Plus, Play, Clock, CheckCircle, XCircle, BarChart3, TrendingUp, Sparkles, Loader2, FileQuestion } from 'lucide-react';
import { quizzesApi, curriculumApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { getDifficultyLabel, formatDate, formatPercentage } from '@/lib/utils';
import { toast } from 'sonner';
import { Quiz, QuizAttempt, Subject, Chapter, Topic } from '@/types';

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
  const [genOpen, setGenOpen] = useState(false);
  const [genForm, setGenForm] = useState({ subject_id: '', chapter_id: '', topic_id: '', quiz_type: 'practice', question_count: 10 });

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

  const { data: subjectsData } = useQuery({
    queryKey: ['user-subjects'],
    queryFn: async () => {
      const res = await curriculumApi.getSubjects();
      return (res.data.data || res.data) as Subject[];
    },
  });
  const subjects: Subject[] = Array.isArray(subjectsData) ? subjectsData : [];

  const { data: chaptersData } = useQuery({
    queryKey: ['gen-chapters', genForm.subject_id],
    queryFn: async () => {
      const res = await curriculumApi.getChapters(genForm.subject_id);
      return (res.data.data || res.data) as Chapter[];
    },
    enabled: !!genForm.subject_id,
  });
  const chapters: Chapter[] = Array.isArray(chaptersData) ? chaptersData : [];

  const { data: topicsData } = useQuery({
    queryKey: ['gen-topics', genForm.chapter_id],
    queryFn: async () => {
      const res = await curriculumApi.getTopics(genForm.chapter_id);
      return (res.data.data || res.data) as Topic[];
    },
    enabled: !!genForm.chapter_id,
  });
  const topics: Topic[] = Array.isArray(topicsData) ? topicsData : [];

  const startMutation = useMutation({
    mutationFn: (quizId: string) => quizzesApi.startAttempt({ quiz_id: quizId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-attempts'] });
      toast.success('Quiz started!');
    },
    onError: () => toast.error('Failed to start quiz'),
  });

  const generateMutation = useMutation({
    mutationFn: () => quizzesApi.generate({
      topic_id: genForm.topic_id,
      question_count: genForm.question_count,
      quiz_type: genForm.quiz_type,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      toast.success('Quiz generated!');
      setGenOpen(false);
    },
    onError: () => toast.error('Failed to generate quiz'),
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Quizzes</h1>
          <p className="text-muted-foreground mt-1">Test your knowledge and track your progress.</p>
        </div>
        <Button onClick={() => setGenOpen(true)} className="gap-2 w-full sm:w-auto">
          <Sparkles className="h-4 w-4" />
          Generate Quiz
        </Button>
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
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold text-foreground">Available Quizzes</h2>
        </div>
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
              <p className="text-sm mt-1">Generate a quiz from your curriculum to get started.</p>
              <Button className="mt-4 gap-2" onClick={() => setGenOpen(true)}>
                <Sparkles className="h-4 w-4" />
                Generate Quiz
              </Button>
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

      <Dialog open={genOpen} onOpenChange={(o) => !o && setGenOpen(false)}>
        <DialogContent className="bg-card border-border text-foreground max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Quiz</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Pick a topic and we will pull questions from the bank automatically.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Select value={genForm.subject_id} onValueChange={(v) => setGenForm({ ...genForm, subject_id: v, chapter_id: '', topic_id: '' })}>
                <SelectTrigger className="bg-muted border-border text-foreground">
                  <SelectValue placeholder="Select subject..." />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground">
                  {subjects.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Chapter</Label>
              <Select value={genForm.chapter_id} onValueChange={(v) => setGenForm({ ...genForm, chapter_id: v, topic_id: '' })} disabled={!genForm.subject_id}>
                <SelectTrigger className="bg-muted border-border text-foreground">
                  <SelectValue placeholder={genForm.subject_id ? 'Select chapter...' : 'Pick a subject first'} />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground">
                  {chapters.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Topic</Label>
              <Select value={genForm.topic_id} onValueChange={(v) => setGenForm({ ...genForm, topic_id: v })} disabled={!genForm.chapter_id}>
                <SelectTrigger className="bg-muted border-border text-foreground">
                  <SelectValue placeholder={genForm.chapter_id ? 'Select topic...' : 'Pick a chapter first'} />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground">
                  {topics.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quiz Type</Label>
                <Select value={genForm.quiz_type} onValueChange={(v) => setGenForm({ ...genForm, quiz_type: v })}>
                  <SelectTrigger className="bg-muted border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border text-foreground">
                    <SelectItem value="practice">Practice</SelectItem>
                    <SelectItem value="revision">Revision</SelectItem>
                    <SelectItem value="topic_wise">Topic Wise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Questions</Label>
                <Input type="number" min={1} max={50} value={genForm.question_count} onChange={(e) => setGenForm({ ...genForm, question_count: parseInt(e.target.value) || 10 })} className="bg-muted border-border text-foreground" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGenOpen(false)}>Cancel</Button>
            <Button onClick={() => generateMutation.mutate()} disabled={!genForm.topic_id || generateMutation.isPending}>
              {generateMutation.isPending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Sparkles className="w-4 h-4 mr-1" />}
              Generate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
