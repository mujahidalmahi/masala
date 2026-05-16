'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from '@/components/ui/table';
import { adminApi } from '@/lib/api';
import { Question } from '@/types';
import { getDifficultyLabel } from '@/lib/utils';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const questionTypes: { value: Question['question_type']; label: string }[] = [
  { value: 'mcq', label: 'MCQ' },
  { value: 'short', label: 'Short Answer' },
  { value: 'long', label: 'Long Answer' },
  { value: 'board', label: 'Board' },
  { value: 'true_false', label: 'True/False' },
];

function QuestionForm({ form, setForm, options, setOptions }: {
  form: any; setForm: (f: any) => void;
  options: { option_text: string; is_correct: boolean }[];
  setOptions: (o: { option_text: string; is_correct: boolean }[]) => void;
}) {
  return (
    <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
      <div className="space-y-2">
        <Label>Question Text</Label>
        <textarea
          value={form.question_text}
          onChange={(e) => setForm((f: any) => ({ ...f, question_text: e.target.value }))}
          className="flex h-24 w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="space-y-2">
          <Label>Type</Label>
          <Select value={form.question_type} onValueChange={(v) => setForm((f: any) => ({ ...f, question_type: v }))}>
            <SelectTrigger className="bg-muted border-border text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border text-foreground">
              {questionTypes.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Difficulty</Label>
          <Select value={String(form.difficulty)} onValueChange={(v) => setForm((f: any) => ({ ...f, difficulty: parseInt(v) }))}>
            <SelectTrigger className="bg-muted border-border text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border text-foreground">
              {[1, 2, 3, 4, 5].map((d) => (
                <SelectItem key={d} value={String(d)}>{getDifficultyLabel(d)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="space-y-2">
          <Label>Points</Label>
          <Input type="number" value={form.points} onChange={(e) => setForm((f: any) => ({ ...f, points: parseInt(e.target.value) || 0 }))} className="bg-muted border-border text-foreground placeholder:text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <Label>Topic ID</Label>
          <Input value={form.topic_id} onChange={(e) => setForm((f: any) => ({ ...f, topic_id: e.target.value }))} className="bg-muted border-border text-foreground placeholder:text-muted-foreground" placeholder="topic_id" />
        </div>
      </div>
      {form.question_type === 'mcq' && (
        <div className="space-y-3">
          <Label>Options</Label>
          {options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={opt.is_correct}
                onChange={() => setOptions(options.map((o, j) => j === i ? { ...o, is_correct: !o.is_correct } : o))}
                className="accent-primary"
              />
              <Input
                value={opt.option_text}
                onChange={(e) => setOptions(options.map((o, j) => j === i ? { ...o, option_text: e.target.value } : o))}
                className="bg-muted border-border text-foreground flex-1 placeholder:text-muted-foreground"
                placeholder={`Option ${i + 1}`}
              />
              {options.length > 2 && (
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setOptions(options.filter((_, j) => j !== i))}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              )}
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => setOptions([...options, { option_text: '', is_correct: false }])}>
            + Add Option
          </Button>
        </div>
      )}
    </div>
  );
}

export default function AdminQuestions() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [dialog, setDialog] = useState<{ open: boolean; edit?: Question }>({ open: false });
  const [form, setForm] = useState({ question_text: '', question_type: 'mcq' as Question['question_type'], difficulty: 1, points: 10, topic_id: '' });
  const [options, setOptions] = useState<{ option_text: string; is_correct: boolean }[]>([{ option_text: '', is_correct: false }, { option_text: '', is_correct: false }]);

  const { data: questionsData, isLoading } = useQuery({
    queryKey: ['admin-questions'],
    queryFn: () => adminApi.getQuestions().then((r) => r.data),
  });

  const questions: Question[] = Array.isArray(questionsData) ? questionsData : (questionsData?.questions ?? []);

  const createMutation = useMutation({
    mutationFn: () => adminApi.createQuestion({ ...form, options: form.question_type === 'mcq' ? options : undefined }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-questions'] }); toast.success('Question created'); setDialog({ open: false }); },
    onError: () => toast.error('Failed to create question'),
  });

  const updateMutation = useMutation({
    mutationFn: () => adminApi.updateQuestion(dialog.edit!.id, { ...form, options: form.question_type === 'mcq' ? options : undefined }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-questions'] }); toast.success('Question updated'); setDialog({ open: false }); },
    onError: () => toast.error('Failed to update question'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteQuestion(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-questions'] }); toast.success('Question deleted'); },
    onError: () => toast.error('Failed to delete question'),
  });

  const openDialog = (question?: Question) => {
    if (question) {
      setForm({ question_text: question.question_text, question_type: question.question_type, difficulty: question.difficulty, points: question.points, topic_id: question.topic_id });
      setOptions(question.options?.map((o) => ({ option_text: o.option_text, is_correct: o.is_correct })) || []);
      setDialog({ open: true, edit: question });
    } else {
      setForm({ question_text: '', question_type: 'mcq', difficulty: 1, points: 10, topic_id: '' });
      setOptions([{ option_text: '', is_correct: false }, { option_text: '', is_correct: false }]);
      setDialog({ open: true });
    }
  };

  const filtered = questions.filter(
    (q) => q.question_text.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={{ hidden: {}, show: {} }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Questions Bank</h1>
          <p className="text-muted-foreground mt-1">Manage quiz questions across topics</p>
        </div>
        <Button onClick={() => openDialog()} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-1" /> Add Question
        </Button>
      </motion.div>

      <motion.div variants={{ hidden: {}, show: {} }}>
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <CardTitle className="text-foreground text-lg">All Questions ({questions.length})</CardTitle>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search questions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-muted border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-14 w-full bg-muted" />)}</div>
            ) : filtered.length === 0 ? (
              <p className="text-muted-foreground text-sm py-12 text-center">
                {search ? 'No questions match your search' : 'No questions yet'}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead className="text-muted-foreground">Question</TableHead>
                      <TableHead className="text-muted-foreground">Type</TableHead>
                      <TableHead className="text-muted-foreground">Difficulty</TableHead>
                      <TableHead className="text-muted-foreground">Points</TableHead>
                      <TableHead className="text-muted-foreground">Topic</TableHead>
                      <TableHead className="text-muted-foreground text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((question) => {
                      const qType = questionTypes.find((t) => t.value === question.question_type);
                      const typeVariantMap: Record<string, 'info' | 'success' | 'warning' | 'default' | 'destructive'> = {
                        mcq: 'info',
                        short: 'success',
                        long: 'default',
                        board: 'warning',
                        true_false: 'destructive',
                      };
                      return (
                        <TableRow key={question.id} className="border-border hover:bg-accent">
                          <TableCell className="text-foreground max-w-xs truncate">{question.question_text}</TableCell>
                          <TableCell>
                            <Badge variant={typeVariantMap[question.question_type] || 'outline'} className="text-xs">
                              {qType?.label || question.question_type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={question.difficulty <= 2 ? 'success' : question.difficulty <= 3 ? 'warning' : 'destructive'}>
                              {getDifficultyLabel(question.difficulty)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{question.points}</TableCell>
                          <TableCell className="text-muted-foreground text-sm max-w-[120px] truncate">{question.topic_id}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => openDialog(question)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => deleteMutation.mutate(question.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              )}
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={dialog.open} onOpenChange={(o) => !o && setDialog({ open: false })}>
        <DialogContent className="bg-card border-border text-foreground max-w-lg p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>{dialog.edit ? 'Edit Question' : 'Add Question'}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {dialog.edit ? 'Update question details and options' : 'Create a new question for the question bank'}
            </DialogDescription>
          </DialogHeader>
          <QuestionForm form={form} setForm={setForm} options={options} setOptions={setOptions} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog({ open: false })}>Cancel</Button>
            <Button onClick={() => (dialog.edit ? updateMutation : createMutation).mutate()} disabled={createMutation.isPending || updateMutation.isPending}>
              {dialog.edit ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
