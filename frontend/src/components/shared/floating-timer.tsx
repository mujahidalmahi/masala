'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { X, Pause, Play, Square, Clock } from 'lucide-react';
import { useTimerStore } from '@/store';
import { sessionsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function FloatingTimer() {
  const router = useRouter();
  const { visible, seconds, running, sessionId, roomId, setTimer, tick, clearTimer } = useTimerStore();
  const runningRef = useRef(running);
  runningRef.current = running;

  // Tick while running (survives page changes)
  useEffect(() => {
    if (!running) return;
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [running, tick]);

  if (!visible || !sessionId) return null;

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  const handlePause = async () => {
    if (!sessionId) return;
    try {
      await sessionsApi.endSession(sessionId, { ended_at: new Date().toISOString() });
      // Save elapsed to localStorage so the room page can recover it
      if (roomId) {
        localStorage.setItem(
          `room_timer_${roomId}`,
          JSON.stringify({ startedAt: new Date().toISOString(), sessionId, elapsed: seconds }),
        );
      }
    } catch {}
    setTimer({ running: false, visible: false });
    if (roomId) router.push(`/rooms/${roomId}`);
  };

  const handleEnd = async () => {
    if (!sessionId) return;
    try {
      await sessionsApi.endSession(sessionId, { ended_at: new Date().toISOString() });
      toast.success('Focus session ended');
    } catch {
      toast.error('Failed to end session');
    }
    if (roomId) localStorage.removeItem(`room_timer_${roomId}`);
    clearTimer();
  };

  const handleNavigate = () => {
    if (roomId) router.push(`/rooms/${roomId}`);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full border bg-background px-4 py-2 shadow-lg">
      <button
        onClick={handleNavigate}
        className="flex items-center gap-1.5 text-sm font-medium tabular-nums hover:text-primary transition-colors"
      >
        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
        <span>{mm}:{ss}</span>
        {running && <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />}
      </button>

      <div className="flex items-center gap-1">
        {running ? (
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handlePause} title="Pause">
            <Pause className="h-3.5 w-3.5" />
          </Button>
        ) : (
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleNavigate} title="Resume">
            <Play className="h-3.5 w-3.5" />
          </Button>
        )}

        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={handleEnd} title="End session">
          <Square className="h-3.5 w-3.5" />
        </Button>

        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={() => setTimer({ visible: false })} title="Dismiss">
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
