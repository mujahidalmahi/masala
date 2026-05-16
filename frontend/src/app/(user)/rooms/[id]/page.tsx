'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, ArrowLeft, Play, Pause, RotateCcw, Clock, DoorOpen, Settings, Trash2, AlertTriangle, LayoutDashboard } from 'lucide-react';
import { useRoomSocket } from '@/hooks/use-room-socket';
import { useAuthStore, useTimerStore } from '@/store';
import { roomsApi, sessionsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FocusRoom } from '@/types';
import { toast } from 'sonner';

const STORAGE_KEY = (roomId: string) => `room_timer_${roomId}`;

type TimerSnapshot = {
  startedAt: string;
  sessionId: string;
  elapsed?: number; // set on client-nav unmount to avoid counting away-time
};

export default function RoomInteriorPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const roomId = params.id as string;
  const currentUser = useAuthStore((s) => s.user);

  const { data: room, isLoading: roomLoading } = useQuery({
    queryKey: ['room', roomId],
    queryFn: async () => {
      const res = await roomsApi.getOne(roomId);
      return (res.data.data || res.data) as FocusRoom;
    },
  });

  const { connected, participantList, sendFocusUpdate, sendFocusTick } = useRoomSocket(roomId);

  const seconds = useTimerStore((s) => s.seconds);
  const running = useTimerStore((s) => s.running);
  const timerVisible = useTimerStore((s) => s.visible);
  const setTimer = useTimerStore((s) => s.setTimer);
  const [recovery, setRecovery] = useState<TimerSnapshot | null>(null);
  const secondsRef = useRef(seconds);
  secondsRef.current = seconds;
  const sessionIdRef = useRef<string | null>(null);
  const runningRef = useRef(running);
  runningRef.current = running;

  // On client nav back, restore session from store
  useEffect(() => {
    if (timerVisible && useTimerStore.getState().roomId === roomId) {
      sessionIdRef.current = useTimerStore.getState().sessionId;
      return;
    }
  }, [roomId, timerVisible]);

  // Restore interrupted timer from localStorage on page refresh
  useEffect(() => {
    // If store already has a live session (set above), skip recovery
    if (sessionIdRef.current) return;

    try {
      const raw = localStorage.getItem(STORAGE_KEY(roomId));
      if (!raw) return;
      const saved: TimerSnapshot = JSON.parse(raw);
      const elapsed = saved.elapsed != null
        ? saved.elapsed
        : Math.floor((Date.now() - new Date(saved.startedAt).getTime()) / 1000);
      if (elapsed > 0 && elapsed < 28800) {
        setTimer({ seconds: elapsed, running: false });
        sessionIdRef.current = saved.sessionId;
        syncStore();
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

  const syncStore = () => {
    setTimer({
      visible: sessionIdRef.current != null,
      sessionId: sessionIdRef.current,
      roomId,
    });
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
      syncStore();
      if (sessionId) persistTimer({ startedAt: now, sessionId });
    } catch {}
  };

  const endSession = async (elapsedSecs: number) => {
    const sid = sessionIdRef.current;
    if (!sid) return;
    sessionIdRef.current = null;
    syncStore();
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
    syncStore();
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

  // Save timer on beforeunload (page refresh) so we can recover
  useEffect(() => {
    const handleBeforeUnload = () => {
      const sid = sessionIdRef.current;
      if (sid) persistTimer({ startedAt: new Date().toISOString(), sessionId: sid });
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // On client-nav unmount, save with elapsed to avoid counting away-time on recovery
  useEffect(() => () => {
    const sid = sessionIdRef.current;
    if (sid && runningRef.current) {
      persistTimer({
        startedAt: new Date().toISOString(),
        sessionId: sid,
        elapsed: secondsRef.current,
      });
    }
  }, []);

  // Live focus tick every 2s (lightweight broadcast, no DB write)
  useEffect(() => {
    if (!running) return;
    const id = setInterval(
      () => sendFocusTick(Math.floor(secondsRef.current / 60)),
      2000,
    );
    return () => clearInterval(id);
  }, [running, sendFocusTick]);

  // Persist focus minutes to DB every 10s
  useEffect(() => {
    if (!running) return;
    const id = setInterval(
      () => sendFocusUpdate(Math.floor(secondsRef.current / 60)),
      10000,
    );
    return () => clearInterval(id);
  }, [running, sendFocusUpdate]);

  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState('silent_focus');
  const [editMax, setEditMax] = useState(5);
  const [editPrivate, setEditPrivate] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: () => roomsApi.delete(roomId),
    onSuccess: () => {
      toast.success('Room deleted');
      router.push('/rooms');
    },
    onError: () => toast.error('Failed to delete room'),
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => roomsApi.update(roomId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['room', roomId] });
      toast.success('Room updated!');
      setEditOpen(false);
    },
    onError: () => toast.error('Failed to update room'),
  });

  const isCreator = currentUser?.id === room?.created_by;

  const openEdit = () => {
    if (!room) return;
    setEditName(room.name);
    setEditType(room.room_type);
    setEditMax(room.max_participants);
    setEditPrivate(room.is_private);
    setEditOpen(true);
  };

  const handleStart = () => {
    setRecovery(null);
    setTimer({ running: true, seconds: 0 });
    startSession();
  };

  const handleResume = () => {
    setRecovery(null);
    persistTimer({ startedAt: new Date().toISOString(), sessionId: sessionIdRef.current! });
    setTimer({ running: true });
  };

  const handleRecoveryEnd = async () => {
    const sid = sessionIdRef.current;
    if (sid) {
      try {
        await sessionsApi.endSession(sid, { ended_at: new Date().toISOString() });
      } catch {}
    }
    sessionIdRef.current = null;
    syncStore();
    clearPersistedTimer();
    setRecovery(null);
    setTimer({ seconds: 0 });
    toast.success('Session ended');
  };

  const handleRecoveryDiscard = () => {
    sessionIdRef.current = null;
    syncStore();
    clearPersistedTimer();
    setRecovery(null);
    setTimer({ seconds: 0 });
  };

  const handlePause = () => {
    setTimer({ running: false });
    endSession(secondsRef.current);
  };

  const handleReset = () => {
    setTimer({ running: false, seconds: 0 });
    endSession(secondsRef.current);
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
    <><div className="space-y-4">
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
              <Button variant="outline" size="sm" className="gap-2" onClick={openEdit}>
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

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Room</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); updateMutation.mutate({ name: editName, room_type: editType, max_participants: editMax, is_private: editPrivate }); }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Room Name</Label>
              <Input id="name" value={editName} onChange={(e) => setEditName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={editType} onValueChange={setEditType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="silent_focus">Silent Focus</SelectItem>
                  <SelectItem value="study_group">Study Group</SelectItem>
                  <SelectItem value="pomodoro">Pomodoro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="max">Max Participants</Label>
              <Input id="max" type="number" min={2} max={50} value={editMax} onChange={(e) => setEditMax(Number(e.target.value))} />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="private" checked={editPrivate} onCheckedChange={(v) => setEditPrivate(v === true)} />
              <Label htmlFor="private">Private room</Label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={updateMutation.isPending || !editName.trim()}>
                {updateMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}