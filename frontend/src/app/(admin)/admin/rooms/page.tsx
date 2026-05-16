'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Users, Radio, DoorOpen } from 'lucide-react';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from '@/components/ui/table';
import { adminApi, roomsApi } from '@/lib/api';
import { FocusRoom } from '@/types';
import { getInitials } from '@/lib/utils';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const roomTypeIcons: Record<string, any> = {
  focus: Radio,
  study: Users,
  social: DoorOpen,
};

const roomTypeColors: Record<string, string> = {
  focus: 'bg-blue-500/10 text-blue-500',
  study: 'bg-emerald-500/10 text-emerald-500',
  social: 'bg-violet-500/10 text-violet-500',
};

export default function AdminRooms() {
  const queryClient = useQueryClient();
  const { data: roomsData, isLoading } = useQuery({
    queryKey: ['admin-rooms'],
    queryFn: async () => { const r = await roomsApi.getActive(); return r.data.data || r.data; },
  });
  const rooms: FocusRoom[] = Array.isArray(roomsData) ? roomsData : [];

  const toggleMutation = useMutation({
    mutationFn: (id: string) => adminApi.toggleRoom(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-rooms'] });
      toast.success('Room status toggled');
    },
    onError: () => toast.error('Failed to toggle room'),
  });

  const handleToggle = (room: FocusRoom) => {
    toggleMutation.mutate(room.id);
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={{ hidden: {}, show: {}}}>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Rooms</h1>
        <p className="text-muted-foreground mt-1">Manage focus and study rooms</p>
      </motion.div>

      <motion.div variants={{ hidden: {}, show: {}}}>
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-foreground text-lg">Active Rooms ({rooms.length})</CardTitle>
            <CardDescription>Monitor and manage all study rooms on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full bg-muted" />)}</div>
            ) : rooms.length === 0 ? (
              <div className="py-12 text-center">
                <DoorOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">No rooms available</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead className="text-muted-foreground">Room</TableHead>
                      <TableHead className="text-muted-foreground">Type</TableHead>
                      <TableHead className="text-muted-foreground">Status</TableHead>
                      <TableHead className="text-muted-foreground">Participants</TableHead>
                      <TableHead className="text-muted-foreground">Creator</TableHead>
                      <TableHead className="text-muted-foreground text-right">Active</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rooms.map((room) => {
                      const Icon = roomTypeIcons[room.room_type] || DoorOpen;
                      const typeColor = roomTypeColors[room.room_type] || 'bg-muted text-muted-foreground';
                      const creator = room.profiles;
                      return (
                        <TableRow key={room.id} className="border-border hover:bg-accent">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg ${typeColor} flex items-center justify-center`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="text-foreground font-medium text-sm">{room.name}</p>
                                {room.description && (
                                  <p className="text-muted-foreground text-xs line-clamp-1">{room.description}</p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize text-xs">
                              {room.room_type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={room.is_active ? 'success' : 'secondary'} className="text-xs">
                              {room.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Users className="w-4 h-4 text-muted-foreground" />
                              {room.current_count}/{room.max_participants}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-7 w-7">
                                <AvatarImage src={creator?.avatar_url ?? undefined} />
                                <AvatarFallback className="bg-muted text-[10px] text-foreground">
                                  {getInitials(creator?.display_name || creator?.username || 'U')}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm text-muted-foreground">
                                {creator?.display_name || creator?.username || 'Unknown'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Switch
                              checked={room.is_active}
                              onCheckedChange={() => handleToggle(room)}
                            />
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
    </motion.div>
  );
}
