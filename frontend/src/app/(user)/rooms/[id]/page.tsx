'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, ArrowLeft, Play, Pause, RotateCcw, Clock, DoorOpen, Settings, Trash2, AlertTriangle, LayoutDashboard } from 'lucide-react';
import { useRoomSocket } from '@/hooks/use-room-socket';
import { useAuthStore } from '@/store';
import { roomsApi, sessionsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { FocusRoom } from '@/types';
import { toast } from 'sonner';

const STORAGE_KEY = (roomId: string) => `room_timer_${roomId}`;

type TimerSnapshot = {
  startedAt: string;
  sessionId: string;
};

export default function RoomInteriorPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.id as string;
  const currentUser = useAuthStore((s) => s.user);

  const { data: room, isLoading: roomLoading } = useQuery({
    queryKey: ['room', roomId],
    queryFn: async () => {
      const res = await roomsApi.getOne(roomId);
      return (res.data.data || res.data) as FocusRoom;
    },
  });

  const { connected, participantList, sendFocusUpdate } = useRoomSocket(roomId);

  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [recovery, setRecovery] = useState<TimerSnapshot | null>(null);
  const secondsRef = useRef(seconds);
  secondsRef.current = seconds;
  const sessionIdRef = useRef<string | null>(null);
  const runningRef = useRef(running);
  runningRef.current = running;

  // Restore interrupted timer from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY(roomId));
      if (!raw) return;
      const saved: TimerSnapshot = JSON.parse(raw);
      const elapsed = Math.floor((Date.now() - new Date(saved.startedAt).getTime()) / 1000);
      // Only restore if less than 8 hours old (stale otherwise)
      if (elapsed > 0 && elapsed < 28800) {
        setSeconds(elapsed);
        sessionIdRef.current = saved.sessionId;
        setRecovery(saved);
      } else {
        localStorage.removeItem(STORAGE_KEY(roomId));
      }
    } catch {}
  }, [roomId]);

  const persistTimer = (snapshot: TimerSnapshot) => {
    localStorage.setItem(STORAGE_KEY(roomId), JSON.stringify(snapshot));
  };

  const clearPersistedTimer = () => {
    localStorage.removeItem(STORAGE_KEY(roomId));
  };

  const startSession = async () => {
    try {
      const now = new Date().toISOString();
      const res = await sessionsApi.create({
        session_type: 'focus',
        duration_minutes: 1,
        started_at: now,
      });
      const d = res.data?.data || res.data;
      const sessionId = d?.id || null;
      sessionIdRef.current = sessionId;
      if (sessionId) persistTimer({ startedAt: now, sessionId });
    } catch {}
  };

  const endSession = async (elapsedSecs: number) => {
    const sid = sessionIdRef.current;
    if (!sid) return;
    sessionIdRef.current = null;
    clearPersistedTimer();
    try {
      await sessionsApi.endSession(sid, {
        ended_at: new Date().toISOString(),
      });
    } catch {}
  };

  const endSessionFetch = () => {
    const sid = sessionIdRef.current;
    if (!sid) return;
    sessionIdRef.current = null;
    clearPersistedTimer();
    fetch(`/api/study-sessions/${sid}/end`, {
      method: 'POST',
      keepalive: true,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
      body: JSON.stringify({ ended_at: new Date().toISOString() }),
    });
  };

  // End session on unmount if running
  useEffect(() => () => {
    if (runningRef.current) endSessionFetch();
  }, []);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(
      () => sendFocusUpdate(Math.floor(secondsRef.current / 60)),
      30000,
    );
    return () => clearInterval(id);
  }, [running, sendFocusUpdate]);

  const deleteMutation = useMutation({
    mutationFn: () => roomsApi.delete(roomId),
    onSuccess: () => {
      toast.success('Room deleted');
      router.push('/rooms');
    },
    onError: () => toast.error('Failed to delete room'),
  });

  const isCreator = currentUser?.id === room?.created_by;

  const handleStart = () => {
    setRecovery(null);
    setRunning(true);
    startSession();
  };

  const handleResume = () => {
    setRecovery(null);
    persistTimer({ startedAt: new Date().toISOString(), sessionId: sessionIdRef.current! });
    setRunning(true);
  };

  const handleRecoveryEnd = async () => {
    const sid = sessionIdRef.current;
    if (sid) {
      try {
        await sessionsApi.endSession(sid, { ended_at: new Date().toISOString() });
      } catch {}
    }
    sessionIdRef.current = null;
    clearPersistedTimer();
    setRecovery(null);
    setSeconds(0);
    toast.success('Session ended');
  };

  const handleRecoveryDiscard = () => {
    sessionIdRef.current = null;
    clearPersistedTimer();
    setRecovery(null);
    setSeconds(0);
  };

  const handlePause = () => {
    setRunning(false);
    endSession(secondsRef.current);
  };

  const handleReset = () => {
    setRunning(false);
    endSession(secondsRef.current);
    setSeconds(0);
  };

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  if (roomLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-32" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2"><Skeleton className="h-[400px] rounded-xl" /></div>
          <Skeleton className="h-[400px] rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => router.push('/dashboard')} className="gap-1.5 text-xs">
            <LayoutDashboard className="h-4 w-4" /> Dashboard
          </Button>
          <Button variant="ghost" onClick={() => router.push('/rooms')} className="gap-1.5 text-xs">
            <ArrowLeft className="h-4 w-4" /> Rooms
          </Button>
        </div>
        <div className="flex items-center gap-2">
          {isCreator && (
            <>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => router.push(`/rooms/${roomId}/edit`)}>
                <Settings className="h-4 w-4" /> Edit
              </Button>
              <Button variant="destructive" size="sm" className="gap-2" onClick={() => { if (confirm('Delete this room?')) deleteMutation.mutate(); }} disabled={deleteMutation.isPending}>
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Room title */}
      <div className="flex items-center gap-3">
        <DoorOpen className="h-5 w-5 text-primary" />
        <div>
          <h1 className="text-xl font-bold text-foreground">{room?.name || 'Focus Room'}</h1>
          <p className="text-xs text-muted-foreground capitalize">{room?.room_type?.replace('_', ' ')}</p>
        </div>
      </div>

      {/* Recovery banner */}
      {recovery && (
        <Card className="border-amber-500/50 bg-amber-500/5">
          <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Focus session interrupted</p>
              <p className="text-xs text-muted-foreground">You had studied for {mm}:{ss}. Resume where you left off?</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button size="sm" onClick={handleResume} className="gap-1.5">
                <Play className="h-3.5 w-3.5" /> Resume
              </Button>
              <Button size="sm" variant="outline" onClick={handleRecoveryEnd} className="gap-1.5">
                End Session
              </Button>
              <Button size="sm" variant="ghost" onClick={handleRecoveryDiscard} className="text-muted-foreground">
                Discard
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Timer Card */}
        <div className="lg:col-span-2">
          <Card className="bg-card border-border">
            <CardContent className="py-10 flex flex-col items-center gap-6">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className={`h-2 w-2 rounded-full ${connected ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`} />
                {connected ? 'Connected' : 'Connecting\u2026'}
                <span className="mx-1">{'\u00B7'}</span>
                <Users className="h-4 w-4" />
                <span>{participantList.length} studying now</span>
              </div>

              <motion.div
                animate={{
                  scale: running ? [1, 1.02, 1] : 1,
                  filter: running ? 'brightness(1.1)' : 'brightness(1)',
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-7xl sm:text-9xl font-bold tabular-nums tracking-tight bg-gradient-to-br from-blue-400 via-violet-400 to-pink-400 bg-clip-text text-transparent select-none"
              >
                {mm}:{ss}
              </motion.div>

              <div className="flex gap-3">
                {running ? (
                  <Button size="lg" onClick={handlePause} className="gap-2 min-w-[140px]">
                    <Pause className="h-5 w-5" /> Pause
                  </Button>
                ) : (
                  <Button size="lg" onClick={handleStart} className="gap-2 min-w-[140px]" disabled={!!recovery}>
                    <Play className="h-5 w-5" /> Start Focus
                  </Button>
                )}
                <Button size="lg" variant="outline" onClick={handleReset} className="gap-2" disabled={seconds === 0 && !running}>
                  <RotateCcw className="h-4 w-4" /> Reset
                </Button>
              </div>

              {seconds >= 60 && (
                <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-muted-foreground">
                  +{Math.floor(seconds / 60)} min focused {'\u00B7'} earning XP
                </motion.p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Participant Roster */}
        <div>
          <Card className="bg-card border-border h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Studying Now ({participantList.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-0.5">
              {participantList.length === 0 ? (
                <p className="text-xs text-muted-foreground py-8 text-center">No one here yet</p>
              ) : (
                participantList.map((p) => {
                  const profile = p.profiles;
                  const initials = (profile?.display_name || profile?.username || '?').slice(0, 2).toUpperCase();
                  const mins = p.focus_minutes || 0;
                  return (
                    <div key={p.id} className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-accent/50 transition-colors">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage src={profile?.avatar_url || undefined} />
                        <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {profile?.display_name || profile?.username || 'Anonymous'}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {profile?.xp_total?.toLocaleString() || '0'} XP
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm font-semibold tabular-nums text-foreground">{mins}m</span>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}