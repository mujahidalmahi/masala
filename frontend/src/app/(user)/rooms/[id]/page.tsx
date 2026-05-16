'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, ArrowLeft, Play, Pause, RotateCcw } from 'lucide-react';
import { useRoomSocket } from '@/hooks/use-room-socket';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function RoomInteriorPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.id as string;

  const { connected, participants, sendFocusUpdate } = useRoomSocket(roomId);

  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  // Push focus minutes to backend every 30 seconds while running.
  useEffect(() => {
    if (!running) return;
    const id = setInterval(
      () => sendFocusUpdate(Math.floor(seconds / 60)),
      30000,
    );
    return () => clearInterval(id);
  }, [running, seconds, sendFocusUpdate]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => router.push('/rooms')} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Leave Room
      </Button>

      <Card className="bg-card border-border">
        <CardContent className="py-12 flex flex-col items-center gap-6">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div
              className={`h-2 w-2 rounded-full ${
                connected ? 'bg-green-500' : 'bg-yellow-500'
              } animate-pulse`}
            />
            {connected ? 'Connected' : 'Connecting…'}
            <span className="mx-1">·</span>
            <Users className="h-4 w-4" />
            <span>{participants} studying now</span>
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
            <Button
              size="lg"
              onClick={() => setRunning((r) => !r)}
              className="gap-2 min-w-[140px]"
            >
              {running ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              {running ? 'Pause' : 'Start Focus'}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                setRunning(false);
                setSeconds(0);
              }}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>

          {seconds >= 60 && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-muted-foreground"
            >
              +{Math.floor(seconds / 60)} min focused · earning XP
            </motion.p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}