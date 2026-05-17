'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Play, Pause, Clock, BookOpen, Brain, Pencil, ListChecks, BarChart3, Timer, Coffee, Plus, Minus, Square } from 'lucide-react';
import { sessionsApi, curriculumApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatTime, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import { StudySession } from '@/types';

const sessionTypes = [
  { value: 'focus', label: 'Focus', icon: Brain, color: 'text-blue-500' },
  { value: 'revision', label: 'Revision', icon: BookOpen, color: 'text-emerald-500' },
  { value: 'practice', label: 'Practice', icon: Pencil, color: 'text-orange-500' },
  { value: 'quiz', label: 'Quiz', icon: ListChecks, color: 'text-purple-500' },
  { value: 'reading', label: 'Reading', icon: BookOpen, color: 'text-rose-500' },
];

const focusPresets = [15, 25, 30, 45, 60];
const breakPresets = [5, 10, 15, 20];

type Phase = 'idle' | 'focus' | 'break';

export default function StudySessionsPage() {
  const queryClient = useQueryClient();
  const [sessionType, setSessionType] = useState('focus');
  const [focusDuration, setFocusDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [sets, setSets] = useState(1);
  const [subjectId, setSubjectId] = useState('');
  const [chapterId, setChapterId] = useState('');
  const [topicId, setTopicId] = useState('');
  const [statRange, setStatRange] = useState<'today' | 'week' | 'month' | 'year' | 'all'>('all');

  const [phase, setPhase] = useState<Phase>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);

  const currentSetRef = useRef(0);
  const sessionIdRef = useRef<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef = useRef(0);
  const phaseRef = useRef<Phase>('idle');
  const focusDurationRef = useRef(focusDuration);
  const breakDurationRef = useRef(breakDuration);
  const setsRef = useRef(sets);

  useEffect(() => { focusDurationRef.current = focusDuration; }, [focusDuration]);
  useEffect(() => { breakDurationRef.current = breakDuration; }, [breakDuration]);
  useEffect(() => { setsRef.current = sets; }, [sets]);
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  const { data: sessions, isLoading: sessionsLoading, error: sessionsError } = useQuery({
    queryKey: ['study-sessions'],
    queryFn: async () => {
      const res = await sessionsApi.getHistory({ limit: 50 });
      const payload = res.data.data || res.data;
      return (payload.data || payload) as StudySession[];
    },
  });

  const { data: statsData } = useQuery({
    queryKey: ['study-sessions-stats'],
    queryFn: async () => { const r = await sessionsApi.getStats(); return r.data.data || r.data; },
  });

  const { data: subjects } = useQuery({
    queryKey: ['study-sessions-subjects'],
    queryFn: async () => { const r = await curriculumApi.getSubjects(); return r.data.data || r.data; },
  });
  const subjectList: any[] = Array.isArray(subjects) ? subjects : [];

  const { data: chapters } = useQuery({
    queryKey: ['study-sessions-chapters', subjectId],
    queryFn: async () => { const r = await curriculumApi.getChapters(subjectId); return r.data.data || r.data; },
    enabled: !!subjectId,
  });
  const chapterList: any[] = Array.isArray(chapters) ? chapters : [];

  const { data: topics } = useQuery({
    queryKey: ['study-sessions-topics', chapterId],
    queryFn: async () => { const r = await curriculumApi.getTopics(chapterId); return r.data.data || r.data; },
    enabled: !!chapterId,
  });
  const topicList: any[] = Array.isArray(topics) ? topics : [];

  const endMutation = useMutation({
    mutationFn: ({ id }: { id: string }) =>
      sessionsApi.endSession(id, {
        ended_at: new Date().toISOString(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['study-sessions-stats'] });
      window.dispatchEvent(new Event('focus'));
    },
    onError: () => toast.error('Failed to end session'),
  });

  const clearTimer = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  }, []);

  const endActiveSession = useCallback(() => {
    const sid = sessionIdRef.current;
    sessionIdRef.current = null;
    if (sid) endMutation.mutate({ id: sid });
  }, [endMutation]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      const sid = sessionIdRef.current;
      if (sid && phaseRef.current === 'focus') {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const token = localStorage.getItem('access_token');
        fetch(`${apiBase}/api/study-sessions/${sid}/end`, {
          method: 'PATCH',
          keepalive: true,
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ ended_at: new Date().toISOString() }),
        });
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  useEffect(() => () => clearTimer(), [clearTimer]);

  const tick = useCallback(() => {
    const isFocus = phaseRef.current === 'focus';
    const maxSecs = isFocus ? focusDurationRef.current * 60 : breakDurationRef.current * 60;
    const next = elapsedRef.current + 1;
    elapsedRef.current = next;
    setElapsed(next);

    if (next >= maxSecs) {
      clearTimer();
      if (isFocus) {
        endActiveSession();
        toast.success(`Focus complete! (${focusDurationRef.current} min)`);
        if (currentSetRef.current < setsRef.current) {
          currentSetRef.current += 1;
          setPhase('break');
          setElapsed(0);
          elapsedRef.current = 0;
          setTimeout(() => {
            if (phaseRef.current === 'break') {
              intervalRef.current = setInterval(tick, 1000);
            }
          }, 500);
        } else {
          currentSetRef.current = 0;
          setPhase('idle');
          setElapsed(0);
          elapsedRef.current = 0;
          toast.success('All sets complete! Great work!');
        }
      } else {
        toast.success('Break over! Start next focus when ready.');
        setPhase('idle');
        setElapsed(0);
        elapsedRef.current = 0;
      }
    }
  }, [clearTimer, endActiveSession]);

  const startFocus = async () => {
    if (phase !== 'idle') return;
    const now = new Date().toISOString();
    sessionIdRef.current = null;
    setElapsed(0);
    elapsedRef.current = 0;
    currentSetRef.current = 1;
    setPaused(false);

    try {
      const res = await sessionsApi.create({
        session_type: sessionType,
        duration_minutes: focusDuration,
        subject_id: subjectId || null,
        chapter_id: chapterId || null,
        topic_id: topicId || null,
        started_at: now,
      });
      const d = res.data?.data || res.data;
      sessionIdRef.current = d?.id || null;
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to start');
      return;
    }

    if (!sessionIdRef.current) return;
    setPhase('focus');
    intervalRef.current = setInterval(tick, 1000);
  };

  const pause = () => { clearTimer(); setPaused(true); };

  const resume = () => {
    if (phase === 'idle') return;
    setPaused(false);
    intervalRef.current = setInterval(tick, 1000);
  };

  const endEarly = () => {
    clearTimer();
    endActiveSession();
    currentSetRef.current = 0;
    setPhase('idle');
    setElapsed(0);
    elapsedRef.current = 0;
    setPaused(false);
    toast.success('Session saved');
  };

  const skipBreak = () => {
    clearTimer();
    setPhase('idle');
    setElapsed(0);
    elapsedRef.current = 0;
    setPaused(false);
    toast.success('Break skipped');
  };

  const currentTypeLabel = sessionTypes.find(t => t.value === sessionType)?.label || 'Focus';
  const displayLabel = phase === 'idle' ? 'Ready' : phase === 'break' ? 'Break' : sessionType === 'revision' ? 'Focus' : currentTypeLabel;

  const displaySecondsLeft = phase === 'focus'
    ? Math.max(0, focusDuration * 60 - elapsed)
    : phase === 'break'
      ? Math.max(0, breakDuration * 60 - elapsed)
      : focusDuration * 60;

  const totalForProgress = phase === 'focus' ? focusDuration * 60 : phase === 'break' ? breakDuration * 60 : focusDuration * 60;
  const progress = totalForProgress > 0 ? (elapsed / totalForProgress) * 100 : 0;
  const mins = Math.floor(displaySecondsLeft / 60);
  const secs = displaySecondsLeft % 60;
  const r = 96;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (progress / 100) * circumference;

  if (sessionsLoading) return <SessionsSkeleton />;
  if (sessionsError) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <BarChart3 className="h-10 w-10" />
          <p>Failed to load. Try again later.</p>
        </div>
      </div>
    );
  }

  const statRanges: { key: typeof statRange; label: string }[] = [
    { key: 'today', label: 'Today' },
    { key: 'week', label: 'Week' },
    { key: 'month', label: 'Month' },
    { key: 'year', label: 'Year' },
    { key: 'all', label: 'All' },
  ];

  const currentStats = statsData?.[statRange] || { total_minutes: 0, session_count: 0, total_xp: 0 };

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Study Timer</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Focus sessions with auto break cycles</p>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">

        {/* Timer Card */}
        <Card className="bg-card border-border overflow-hidden">
          <CardContent className="p-0">
            <div className="flex flex-col items-center py-6 sm:py-8 bg-gradient-to-b from-accent/30 to-transparent">
              <div className="relative flex items-center justify-center">
                <svg width="240" height="240" viewBox="0 0 240 240" className="sm:w-[260px] sm:h-[260px]">
                  <circle cx="120" cy="120" r={r} fill="none" className="stroke-muted/60" strokeWidth="8" />
                  <circle
                    cx="120" cy="120" r={r} fill="none"
                    className={`transition-all duration-700 ease-linear ${phase === 'break' ? 'stroke-emerald-500' : 'stroke-primary'}`}
                    strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    transform="rotate(-90 120 120)"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <div className="flex items-center gap-1.5 mb-1">
                    {phase === 'break' ? (
                      <Coffee className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <div className={`w-2 h-2 rounded-full ${phase === 'idle' ? 'bg-muted-foreground' : 'bg-primary'}`} />
                    )}
                    <span className={`text-xs font-semibold uppercase tracking-widest ${phase === 'break' ? 'text-emerald-500' : 'text-primary'}`}>
                      {displayLabel}
                    </span>
                  </div>
                  <motion.span
                    key={`${mins}:${secs}`}
                    initial={{ opacity: 0.3 }}
                    animate={{ opacity: 1 }}
                    className="text-5xl sm:text-6xl font-bold tabular-nums text-foreground tracking-tight"
                  >
                    {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
                  </motion.span>
                  <span className="text-xs text-muted-foreground mt-1">
                    {phase === 'idle' ? `${focusDuration} min` : paused ? 'Paused' : `${phase === 'focus' ? focusDuration : breakDuration} min`}
                  </span>
                  {phase === 'focus' && (
                    <span className="text-[10px] text-muted-foreground/60 mt-0.5">Set {currentSetRef.current}/{sets}</span>
                  )}
                  {phase === 'break' && (
                    <span className="text-[10px] text-muted-foreground/60 mt-0.5">Break · {currentSetRef.current}/{sets} sets</span>
                  )}
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-3 mt-5">
                {phase === 'idle' ? (
                  <Button size="lg" onClick={startFocus}
                    className="gap-2 px-8 rounded-full h-11 text-sm font-semibold shadow-lg shadow-primary/20">
                    <Play className="h-5 w-5 fill-current" />
                    Start Focus
                  </Button>
                ) : phase === 'break' ? (
                  <>
                    {paused ? (
                      <Button size="lg" onClick={resume} className="gap-2 px-6 rounded-full h-11 text-sm font-semibold">
                        <Play className="h-5 w-5 fill-current" /> Resume
                      </Button>
                    ) : (
                      <Button size="lg" variant="secondary" onClick={pause} className="gap-2 px-6 rounded-full h-11 text-sm font-semibold">
                        <Pause className="h-5 w-5 fill-current" /> Pause
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={skipBreak} className="text-xs text-muted-foreground">Skip</Button>
                  </>
                ) : (
                  <>
                    {paused ? (
                      <Button size="lg" onClick={resume} className="gap-2 px-6 rounded-full h-11 text-sm font-semibold">
                        <Play className="h-5 w-5 fill-current" /> Resume
                      </Button>
                    ) : (
                      <Button size="lg" variant="secondary" onClick={pause} className="gap-2 px-6 rounded-full h-11 text-sm font-semibold">
                        <Pause className="h-5 w-5 fill-current" /> Pause
                      </Button>
                    )}
                    <Button size="lg" variant="outline" onClick={endEarly} className="gap-2 px-6 rounded-full h-11 text-sm font-semibold">
                      <Square className="h-4 w-4" /> Stop
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="h-px bg-border" />

            {/* Settings */}
            <div className="p-4 space-y-3">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <Select value={sessionType} onValueChange={(v) => { if (phase === 'idle') setSessionType(v); }}>
                  <SelectTrigger className="h-8 w-28 bg-muted border-border text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-card border-border text-foreground">
                    {sessionTypes.map((t) => (
                      <SelectItem key={t.value} value={t.value} className="text-xs">{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Focus</span>
                  {focusPresets.map((m) => (
                    <button key={m}
                      onClick={() => { if (phase === 'idle') { setFocusDuration(m); } }}
                      className={`px-2 py-1 text-xs rounded-md border transition-all ${focusDuration === m && phase === 'idle'
                          ? 'border-primary/40 bg-primary/10 text-primary font-semibold'
                          : 'border-border text-muted-foreground hover:border-muted-foreground'
                        } ${phase !== 'idle' ? 'opacity-40 cursor-not-allowed' : ''}`}
                    >{m}m</button>
                  ))}
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Break</span>
                  {breakPresets.map((m) => (
                    <button key={m}
                      onClick={() => { if (phase === 'idle') { setBreakDuration(m); } }}
                      className={`px-2 py-1 text-xs rounded-md border transition-all ${breakDuration === m && phase === 'idle'
                          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-500 font-semibold'
                          : 'border-border text-muted-foreground hover:border-muted-foreground'
                        } ${phase !== 'idle' ? 'opacity-40 cursor-not-allowed' : ''}`}
                    >{m}m</button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 ml-auto">
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Sets</span>
                  <button onClick={() => { if (phase === 'idle' && sets > 1) setSets(sets - 1); }}
                    className={`h-6 w-6 rounded flex items-center justify-center border border-border text-muted-foreground hover:text-foreground text-xs ${phase !== 'idle' ? 'opacity-40 cursor-not-allowed' : ''}`}>
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="text-sm font-bold text-foreground tabular-nums w-5 text-center">{sets}</span>
                  <button onClick={() => { if (phase === 'idle') setSets(sets + 1); }}
                    className={`h-6 w-6 rounded flex items-center justify-center border border-border text-muted-foreground hover:text-foreground text-xs ${phase !== 'idle' ? 'opacity-40 cursor-not-allowed' : ''}`}>
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Select value={subjectId} onValueChange={(v) => { setSubjectId(v); setChapterId(''); setTopicId(''); }} disabled={phase !== 'idle'}>
                  <SelectTrigger className="h-8 w-36 bg-muted border-border text-xs"><SelectValue placeholder="Subject" /></SelectTrigger>
                  <SelectContent className="bg-card border-border text-foreground">
                    {subjectList.map((s: any) => (<SelectItem key={s.id} value={s.id} className="text-xs">{s.name}</SelectItem>))}
                  </SelectContent>
                </Select>
                <Select value={chapterId} onValueChange={(v) => { setChapterId(v); setTopicId(''); }} disabled={!subjectId || phase !== 'idle'}>
                  <SelectTrigger className="h-8 w-36 bg-muted border-border text-xs"><SelectValue placeholder="Chapter" /></SelectTrigger>
                  <SelectContent className="bg-card border-border text-foreground">
                    {chapterList.map((c: any) => (<SelectItem key={c.id} value={c.id} className="text-xs">{c.name}</SelectItem>))}
                  </SelectContent>
                </Select>
                <Select value={topicId} onValueChange={setTopicId} disabled={!chapterId || phase !== 'idle'}>
                  <SelectTrigger className="h-8 w-36 bg-muted border-border text-xs"><SelectValue placeholder="Topic" /></SelectTrigger>
                  <SelectContent className="bg-card border-border text-foreground">
                    {topicList.map((t: any) => (<SelectItem key={t.id} value={t.id} className="text-xs">{t.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats with time range tabs */}
        <Card className="bg-card border-border">
          <div className="flex items-center gap-1 px-3 pt-3 pb-2 overflow-x-auto">
            {statRanges.map((r) => (
              <button key={r.key} onClick={() => setStatRange(r.key)}
                className={`px-3 py-1 text-xs rounded-md font-medium transition-all whitespace-nowrap ${statRange === r.key ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'
                  }`}
              >{r.label}</button>
            ))}
          </div>
          <CardContent className="p-3 pt-1">
            <div className="grid gap-3 grid-cols-3">
              {[
                { label: 'Time', value: formatTime(currentStats.total_minutes || 0), icon: Clock, color: 'text-blue-500' },
                { label: 'Sessions', value: String(currentStats.session_count ?? 0), icon: BarChart3, color: 'text-purple-500' },
                { label: 'XP', value: String(currentStats.total_xp ?? 0), icon: Timer, color: 'text-yellow-500' },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-2.5">
                  <div className={`h-7 w-7 rounded-lg ${stat.color.replace('text', 'bg')}/10 flex items-center justify-center shrink-0`}>
                    <stat.icon className={`h-3.5 w-3.5 ${stat.color}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                    <p className="text-sm font-bold text-foreground tabular-nums">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* History */}
        {sessions && sessions.length > 0 ? (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-0.5">
              <p className="text-sm font-medium text-muted-foreground">History</p>
              <span className="text-[10px] text-muted-foreground">{sessions.length} sessions</span>
            </div>
            <div className="space-y-1">
              {sessions.map((session) => (
                <Card key={session.id} className="bg-card border-border">
                  <CardContent className="p-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center shrink-0">
                          {(() => {
                            const t = sessionTypes.find((t2) => t2.value === session.session_type);
                            if (!t) return <Brain className="h-3.5 w-3.5" />;
                            const Ic = t.icon;
                            return <Ic className={`h-3.5 w-3.5 ${t.color}`} />;
                          })()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-medium text-foreground truncate">{session.subjects?.name || 'General'}</p>
                            <Badge variant="secondary" className="text-[10px] capitalize shrink-0 px-1.5 py-0 font-normal">{session.session_type}</Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground">{formatDate(session.started_at)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-sm text-muted-foreground tabular-nums">{formatTime(session.duration_minutes)}</span>
                        {session.xp_earned > 0 && <Badge variant="info" className="text-[10px] px-1.5 py-0 font-normal">+{session.xp_earned}</Badge>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <Card className="bg-card border-border">
            <CardContent className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <Play className="h-8 w-8 mb-2" />
              <p className="text-sm font-medium">No sessions yet</p>
              <p className="text-xs mt-0.5">Start your first focus session above.</p>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
}

function SessionsSkeleton() {
  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <Skeleton className="h-8 w-40" /><Skeleton className="h-5 w-56" />
      <Card className="bg-card border-border"><CardContent className="p-6"><Skeleton className="h-[340px] w-full rounded-xl" /></CardContent></Card>
      <div className="grid gap-3 grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="bg-card border-border"><CardContent className="p-3"><Skeleton className="h-10 w-full rounded-lg" /></CardContent></Card>
        ))}
      </div>
    </div>
  );
}
