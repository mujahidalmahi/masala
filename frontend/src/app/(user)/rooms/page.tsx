'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, Plus, LogIn, DoorOpen, Globe, Lock, TrendingUp, Settings, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/store';
import { roomsApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { FocusRoom } from '@/types';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export default function RoomsPage() {
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editRoom, setEditRoom] = useState<FocusRoom | null>(null);
  const [roomName, setRoomName] = useState('');
  const [roomType, setRoomType] = useState('silent_focus');
  const [maxParticipants, setMaxParticipants] = useState(5);
  const [isPrivate, setIsPrivate] = useState(false);

  const { data: rooms, isLoading, error } = useQuery({
    queryKey: ['rooms'],
    queryFn: async () => {
      const res = await roomsApi.getActive();
      return (res.data.data || res.data) as FocusRoom[];
    },
  });

  const createMutation = useMutation({
    mutationFn: () =>
      roomsApi.create({
        name: roomName,
        room_type: roomType,
        max_participants: maxParticipants,
        is_private: isPrivate,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast.success('Room created!');
      setCreateOpen(false);
      setRoomName('');
    },
    onError: () => toast.error('Failed to create room'),
  });

  const joinMutation = useMutation({
    mutationFn: async (roomId: string) => {
      await roomsApi.join(roomId);
      return roomId;
    },
    onSuccess: (roomId) => {
      toast.success('Joining room...');
      router.push(`/rooms/${roomId}`);
    },
    onError: () => toast.error('Failed to join room'),
  });

  const deleteMutation = useMutation({
    mutationFn: (roomId: string) => roomsApi.delete(roomId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast.success('Room deleted');
    },
    onError: () => toast.error('Failed to delete room'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => roomsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast.success('Room updated!');
      setEditOpen(false);
      setEditRoom(null);
    },
    onError: () => toast.error('Failed to update room'),
  });

  const openEdit = (room: FocusRoom) => {
    setEditRoom(room);
    setRoomName(room.name);
    setRoomType(room.room_type);
    setMaxParticipants(room.max_participants);
    setIsPrivate(room.is_private);
    setEditOpen(true);
  };

  if (isLoading) return <RoomsSkeleton />;
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <TrendingUp className="h-10 w-10" />
          <p>Failed to load rooms. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Focus Rooms</h1>
          <p className="text-muted-foreground mt-1">Study together in virtual focus rooms.</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              Create Room
            </Button>
          </DialogTrigger>
          <DialogContent className="p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle>Create a Focus Room</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="room-name">Room Name</Label>
                <Input id="room-name" placeholder="e.g. Math Study Group" value={roomName} onChange={(e) => setRoomName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="room-type">Type</Label>
                <Select value={roomType} onValueChange={setRoomType}>
                  <SelectTrigger id="room-type"><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="silent_focus">Silent Focus</SelectItem>
                    <SelectItem value="pomodoro">Pomodoro</SelectItem>
                    <SelectItem value="group_study">Group Study</SelectItem>
                    <SelectItem value="exam_prep">Exam Prep</SelectItem>
                    <SelectItem value="night_study">Night Study</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-people">Max Participants</Label>
                <Input id="max-people" type="number" min={2} max={200} value={maxParticipants} onChange={(e) => setMaxParticipants(Number(e.target.value))} />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="is-private" checked={isPrivate} onCheckedChange={(checked) => setIsPrivate(checked === true)} />
                <Label htmlFor="is-private">Private room</Label>
              </div>
              <Button className="w-full" onClick={() => createMutation.mutate()} disabled={!roomName.trim() || createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create Room'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {rooms && rooms.length > 0 ? (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
          {rooms.map((room) => {
            const isCreator = currentUser?.id === room.created_by;
            return (
              <motion.div key={room.id} variants={itemVariants}>
                <Card className="bg-card border-border h-full flex flex-col">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base text-foreground flex items-center gap-2">
                        <DoorOpen className="h-4 w-4 text-blue-500" />
                        {room.name}
                      </CardTitle>
                      {room.is_private ? <Lock className="h-3.5 w-3.5 text-muted-foreground" /> : <Globe className="h-3.5 w-3.5 text-muted-foreground" />}
                    </div>
                    <CardDescription className="text-xs capitalize">{room.room_type?.replace(/_/g, ' ')}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <Users className="h-4 w-4" />
                      <span>{room.current_count} / {room.max_participants} participants</span>
                      {room.subjects?.name && <><span className="text-muted-foreground">|</span><span>{room.subjects.name}</span></>}
                    </div>
                    {isCreator && (
                      <div className="flex gap-2 mb-2">
                        <Button variant="outline" size="sm" className="flex-1 gap-1 text-xs h-7" onClick={() => openEdit(room)}>
                          <Settings className="h-3 w-3" /> Edit
                        </Button>
                        <Button variant="destructive" size="sm" className="flex-1 gap-1 text-xs h-7" onClick={() => { if (confirm('Delete this room?')) deleteMutation.mutate(room.id); }} disabled={deleteMutation.isPending}>
                          <Trash2 className="h-3 w-3" /> Delete
                        </Button>
                      </div>
                    )}
                    <Button variant="outline" className="w-full gap-2" onClick={() => joinMutation.mutate(room.id)} disabled={joinMutation.isPending || room.current_count >= room.max_participants}>
                      <LogIn className="h-4 w-4" />
                      {room.current_count >= room.max_participants ? 'Full' : 'Join Room'}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        <Card className="bg-card border-border">
          <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Users className="h-10 w-10 mb-3" />
            <p className="text-lg font-medium">No active rooms</p>
            <p className="text-sm mt-1">Create a room or check back later.</p>
            <Button className="mt-4 gap-2" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              Create Room
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={(o) => { if (!o) { setEditOpen(false); setEditRoom(null); } }}>
        <DialogContent className="p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Edit Room</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Room Name</Label>
              <Input id="edit-name" placeholder="Room name" value={roomName} onChange={(e) => setRoomName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-type">Type</Label>
              <Select value={roomType} onValueChange={setRoomType}>
                <SelectTrigger id="edit-type"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="silent_focus">Silent Focus</SelectItem>
                  <SelectItem value="pomodoro">Pomodoro</SelectItem>
                  <SelectItem value="group_study">Group Study</SelectItem>
                  <SelectItem value="exam_prep">Exam Prep</SelectItem>
                  <SelectItem value="night_study">Night Study</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-people">Max Participants</Label>
              <Input id="edit-people" type="number" min={2} max={200} value={maxParticipants} onChange={(e) => setMaxParticipants(Number(e.target.value))} />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="edit-private" checked={isPrivate} onCheckedChange={(checked) => setIsPrivate(checked === true)} />
              <Label htmlFor="edit-private">Private room</Label>
            </div>
            <Button className="w-full" onClick={() => {
              if (!editRoom) return;
              updateMutation.mutate({
                id: editRoom.id,
                data: { name: roomName, room_type: roomType, max_participants: maxParticipants, is_private: isPrivate },
              });
            }} disabled={!roomName.trim() || updateMutation.isPending}>
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RoomsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <div>
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-5 w-56 mt-2" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="bg-card border-border">
            <CardHeader>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3 w-20 mt-1" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-9 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
