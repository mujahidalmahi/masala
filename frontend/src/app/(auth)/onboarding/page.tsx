'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Zap, Check, Loader2, ChevronRight, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { curriculumApi, usersApi } from '@/lib/api';
import { useAuthStore } from '@/store';

type Step = 'country' | 'board' | 'grade' | 'subjects' | 'done';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, token, updateUser } = useAuthStore();
  const [step, setStep] = useState<Step>('country');
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedBoard, setSelectedBoard] = useState<string | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [error, setError] = useState('');

  const { data: countries } = useQuery({
    queryKey: ['countries'],
    queryFn: async () => {
      const res = await curriculumApi.getCountries();
      return res.data.data || res.data;
    },
  });

  const { data: boards } = useQuery({
    queryKey: ['boards', selectedCountry],
    queryFn: async () => {
      const res = await curriculumApi.getBoards(selectedCountry!);
      return res.data.data || res.data;
    },
    enabled: !!selectedCountry,
  });

  const { data: grades } = useQuery({
    queryKey: ['grades', selectedBoard],
    queryFn: async () => {
      const res = await curriculumApi.getGrades(selectedBoard!);
      return res.data.data || res.data;
    },
    enabled: !!selectedBoard,
  });

  const { data: subjects } = useQuery({
    queryKey: ['subjects', selectedGrade],
    queryFn: async () => {
      const res = await curriculumApi.getSubjects(selectedGrade!);
      return res.data.data || res.data;
    },
    enabled: !!selectedGrade,
  });

  const completeMutation = useMutation({
    mutationFn: async () => {
      await usersApi.onboard({
        country_id: selectedCountry!,
        board_id: selectedBoard!,
        grade_id: selectedGrade!,
        subject_ids: selectedSubjects,
      });
    },
    onSuccess: () => {
      updateUser({ is_onboarded: true, grade_id: selectedGrade, board_id: selectedBoard, country_id: selectedCountry });
      setStep('done');
      setTimeout(() => router.push('/dashboard'), 1500);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to save preferences');
    },
  });

  if (!token || !user) {
    router.push('/login');
    return null;
  }

  const toggleSubject = (id: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-gradient-to-b from-violet-600/10 via-transparent to-blue-600/10" />
      <div className="fixed top-1/4 right-1/3 w-64 h-64 bg-violet-500/10 rounded-full blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl relative"
      >
        <div className="flex items-center justify-center gap-2 mb-6 sm:mb-8">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <span className="font-bold text-lg sm:text-xl text-foreground">StudySprint OS</span>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 sm:p-8 shadow-xl">
          <div className="flex justify-between mb-6">
            {['country', 'board', 'grade', 'subjects'].map((s, i) => (
              <div key={s} className="flex items-center gap-1 sm:gap-2">
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  step === s ? 'bg-primary text-primary-foreground' :
                  ['done', 'subjects', 'grade', 'board', 'country'].indexOf(step) > ['country', 'board', 'grade', 'subjects'].indexOf(s) ? 'bg-green-500 text-white' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {['country', 'board', 'grade', 'subjects'].indexOf(step) > i ? <Check className="w-3 h-3 sm:w-4 sm:h-4" /> : i + 1}
                </div>
                <span className="hidden sm:block text-xs text-muted-foreground capitalize">{s}</span>
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 'country' && (
              <motion.div key="country" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-lg sm:text-xl font-bold text-foreground mb-1">Select your country</h2>
                <p className="text-sm text-muted-foreground mb-4">Choose your educational jurisdiction</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Array.isArray(countries) && countries.map((c: any) => (
                    <Card key={c.id} className={`bg-card border-border cursor-pointer transition-all hover:border-primary ${selectedCountry === c.id ? 'border-primary ring-1 ring-primary' : ''}`} onClick={() => { setSelectedCountry(c.id); setStep('board'); }}>
                      <CardContent className="p-4 flex items-center gap-3">
                        <span className="text-xl">{c.code?.slice(0, 2).toUpperCase()}</span>
                        <span className="text-sm font-medium text-foreground">{c.name}</span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 'board' && (
              <motion.div key="board" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-lg sm:text-xl font-bold text-foreground mb-1">Select your board</h2>
                <p className="text-sm text-muted-foreground mb-4">Choose your education board</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Array.isArray(boards) && boards.map((b: any) => (
                    <Card key={b.id} className={`bg-card border-border cursor-pointer transition-all hover:border-primary ${selectedBoard === b.id ? 'border-primary ring-1 ring-primary' : ''}`} onClick={() => { setSelectedBoard(b.id); setStep('grade'); }}>
                      <CardContent className="p-4">
                        <p className="text-sm font-medium text-foreground">{b.name}</p>
                        {b.description && <p className="text-xs text-muted-foreground mt-1">{b.description}</p>}
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <Button variant="ghost" size="sm" className="mt-3 text-muted-foreground" onClick={() => { setSelectedCountry(null); setStep('country'); }}>
                  Back
                </Button>
              </motion.div>
            )}

            {step === 'grade' && (
              <motion.div key="grade" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-lg sm:text-xl font-bold text-foreground mb-1">Select your grade</h2>
                <p className="text-sm text-muted-foreground mb-4">Choose your current grade or year</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {Array.isArray(grades) && grades.map((g: any) => (
                    <Card key={g.id} className={`bg-card border-border cursor-pointer transition-all hover:border-primary ${selectedGrade === g.id ? 'border-primary ring-1 ring-primary' : ''}`} onClick={() => { setSelectedGrade(g.id); setStep('subjects'); }}>
                      <CardContent className="p-4 text-center">
                        <p className="text-sm font-medium text-foreground">{g.name}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <Button variant="ghost" size="sm" className="mt-3 text-muted-foreground" onClick={() => { setSelectedBoard(null); setStep('board'); }}>
                  Back
                </Button>
              </motion.div>
            )}

            {step === 'subjects' && (
              <motion.div key="subjects" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-lg sm:text-xl font-bold text-foreground mb-1">Select your subjects</h2>
                <p className="text-sm text-muted-foreground mb-4">Choose the subjects you are studying this year</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Array.isArray(subjects) && subjects.map((s: any) => (
                    <Card key={s.id} className={`bg-card border-border cursor-pointer transition-all hover:border-primary ${selectedSubjects.includes(s.id) ? 'border-primary ring-1 ring-primary' : ''}`} onClick={() => toggleSubject(s.id)}>
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedSubjects.includes(s.id) ? 'bg-primary border-primary' : 'border-border'}`}>
                          {selectedSubjects.includes(s.id) && <Check className="w-3 h-3 text-primary-foreground" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{s.name}</p>
                          {s.description && <p className="text-xs text-muted-foreground">{s.description}</p>}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {error && <p className="text-destructive text-sm mt-2">{error}</p>}
                <div className="flex gap-2 mt-4">
                  <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => { setSelectedGrade(null); setStep('grade'); }}>
                    Back
                  </Button>
                  <Button onClick={() => completeMutation.mutate()} disabled={selectedSubjects.length === 0 || completeMutation.isPending} className="gap-2">
                    {completeMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    {completeMutation.isPending ? 'Saving...' : 'Complete Setup'}
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 'done' && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-green-500" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">All set!</h2>
                <p className="text-muted-foreground">Taking you to your dashboard...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
