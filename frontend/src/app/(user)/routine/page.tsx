'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ListChecks, Clock, CheckCircle2, Circle, Sparkles,
  BookOpen, Brain, Pencil, Loader2, TrendingUp,
} from 'lucide-react';
import { routinesApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { formatTime } from '@/lib/utils';
import { toast } from 'sonner';
import { Routine, RoutineSlot } from '@/types';

const slotIcons: Record<string, React.ReactNode> = {
  focus: <Brain className="h-4 w-4" />,
  revision: <BookOpen className="h-4 w-4" />,
  practice: <Pencil className="h-4 w-4" />,
  quiz: <ListChecks className="h-4 w-4" />,
  reading: <BookOpen className="h-4 w-4" />,
  break: <Clock className="h-4 w-4" />,
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export default function RoutinePage() {
  const queryClient = useQueryClient();
  const [generateOpen, setGenerateOpen] = useState(false);
  const [availableMinutes, setAvailableMinutes] = useState(120);

  const { data: routine, isLoading, error } = useQuery({
    queryKey: ['routine-today'],
    queryFn: async () => {
      const res = await routinesApi.getToday();
      return res.data as Routine;
    },
  });

  const generateMutation = useMutation({
    mutationFn: () => routinesApi.generate(availableMinutes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routine-today'] });
      toast.success('Routine generated!');
      setGenerateOpen(false);
    },
    onError: () => toast.error('Failed to generate routine'),
  });

  const completeMutation = useMutation({
    mutationFn: (slotId: string) => routinesApi.markSlotComplete(slotId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routine-today'] });
      toast.success('Slot marked complete!');
    },
    onError: () => toast.error('Failed to mark slot complete'),
  });

  if (isLoading) return <RoutineSkeleton />;
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <TrendingUp className="h-10 w-10" />
          <p>Failed to load routine. Please try again later.</p>
        </div>
      </div>
    );
  }

  const completedSlots = routine?.slots?.filter((s) => s.is_completed).length ?? 0;
  const totalSlots = routine?.slots?.length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Daily Routine</h1>
          <p className="text-muted-foreground mt-1">
            {routine
              ? `${completedSlots} of ${totalSlots} slots completed`
              : 'Plan your study day with a smart routine.'}
          </p>
        </div>
        <Dialog open={generateOpen} onOpenChange={setGenerateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 w-full sm:w-auto">
              <Sparkles className="h-4 w-4" />
              Generate Routine
            </Button>
          </DialogTrigger>
          <DialogContent className="p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle>Generate Study Routine</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="minutes">Available Minutes</Label>
                <Input
                  id="minutes"
                  type="number"
                  min={15}
                  max={600}
                  value={availableMinutes}
                  onChange={(e) => setAvailableMinutes(Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">
                  How much time do you have to study today?
                </p>
              </div>
              <Button
                className="w-full gap-2"
                onClick={() => generateMutation.mutate()}
                disabled={generateMutation.isPending || availableMinutes < 15}
              >
                {generateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {generateMutation.isPending ? 'Generating...' : 'Generate'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {routine && routine.slots && routine.slots.length > 0 ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative"
        >
          <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-border" />
          <div className="space-y-3">
            {routine.slots
              .sort((a, b) => a.display_order - b.display_order)
              .map((slot) => (
                <motion.div key={slot.id} variants={itemVariants}>
                  <Card
                    className={`border-border transition-all duration-200 ${
                      slot.is_completed
                        ? 'bg-primary/10 border-primary/20'
                        : 'bg-card hover:border-border'
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <button
                          onClick={() => {
                            if (!slot.is_completed) {
                              completeMutation.mutate(slot.id);
                            }
                          }}
                          disabled={completeMutation.isPending || slot.is_completed}
                          className="mt-0.5 shrink-0"
                        >
                          {slot.is_completed ? (
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-foreground">
                              {slot.subjects?.name || 'Study'}
                            </span>
                            <Badge variant="secondary" className="text-[10px] capitalize gap-1">
                              {slotIcons[slot.slot_type] || <BookOpen className="h-3 w-3" />}
                              {slot.slot_type}
                            </Badge>
                          </div>
                          {slot.topics?.name && (
                            <p className="text-xs text-muted-foreground mt-0.5">{slot.topics.name}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground shrink-0">
                          <Clock className="h-3.5 w-3.5" />
                          {formatTime(slot.duration_minutes)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
          </div>
        </motion.div>
      ) : (
        <Card className="bg-card border-border">
          <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <ListChecks className="h-10 w-10 mb-3" />
            <p className="text-lg font-medium">No routine for today</p>
            <p className="text-sm mt-1">Generate a smart study routine to make the most of your day.</p>
            <Button className="mt-4 gap-2" onClick={() => setGenerateOpen(true)}>
              <Sparkles className="h-4 w-4" />
              Generate Routine
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function RoutineSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <div>
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-5 w-48 mt-2" />
        </div>
        <Skeleton className="h-10 w-44" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <Skeleton className="h-5 w-5 rounded-full shrink-0" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-36 mt-1" />
                </div>
                <Skeleton className="h-4 w-12 shrink-0" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
