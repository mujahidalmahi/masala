'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store';
import { roomsApi } from '@/lib/api';
import { RoomParticipant } from '@/types';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000';

type RoomMessage = {
  id?: string;
  user_id: string;
  message: string;
  message_type?: string;
  created_at: string;
  profiles?: {
    username?: string;
    display_name?: string;
    avatar_url?: string;
  };
};

export function useRoomSocket(roomId: string | null) {
  const [presenceVersion, setPresenceVersion] = useState(0);
  const token = useAuthStore((s) => s.token);
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [participantList, setParticipantList] = useState<RoomParticipant[]>([]);
  const [messages, setMessages] = useState<RoomMessage[]>([]);

  const participants = participantList.length;

  // Fetch participant list via REST
  const fetchParticipants = useCallback(async () => {
    if (!roomId) return;
    try {
      const res = await roomsApi.getParticipants(roomId);
      const list = (res.data.data || res.data) as RoomParticipant[];
      setParticipantList(list);
    } catch {}
  }, [roomId]);

  // Initial fetch + periodic refresh every 60s (syncs XP, focus_minutes, etc.)
  useEffect(() => {
    fetchParticipants();
    const id = setInterval(fetchParticipants, 60000);
    return () => clearInterval(id);
  }, [fetchParticipants]);

  useEffect(() => {
    if (!roomId || !token) return;

    const socket = io(`${WS_URL}/ws/rooms`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.on('connected', () => {
      socket.emit('join_room', { room_id: roomId });
    });

    socket.on('participant_count', (data: { count: number }) => {
      setParticipantList((prev) => {
        if (prev.length === data.count) return prev;
        fetchParticipants();
        return prev;
      });
    });

    socket.on('user_joined', () => {
      fetchParticipants();
    });

    socket.on('user_left', (data: { userId: string }) => {
      setParticipantList((prev) => prev.filter((p) => p.user_id !== data.userId));
    });

    const handleFocusUpdated = (data: { userId: string; focus_minutes: number }) => {
      setParticipantList((prev) =>
        prev.map((p) =>
          p.user_id === data.userId ? { ...p, focus_minutes: data.focus_minutes } : p,
        ),
      );
    };

    socket.on('focus_updated', handleFocusUpdated);
    socket.on('focus_tick_updated', handleFocusUpdated);

    socket.on('new_message', (msg: RoomMessage) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on('error', (e) => console.error('socket error', e));

    return () => {
      socket.emit('leave_room', { room_id: roomId });
      socket.disconnect();
      socketRef.current = null;
    };
  }, [roomId, token]);

  return {
    socket: socketRef.current,
    connected,
    participants,
    participantList,
    messages,
    sendFocusUpdate: (focus_minutes: number) =>
      socketRef.current?.emit('focus_update', { room_id: roomId, focus_minutes }),
    sendFocusTick: (focus_minutes: number) =>
      socketRef.current?.emit('focus_tick', { room_id: roomId, focus_minutes }),
    sendMessage: (message: string) =>
      socketRef.current?.emit('send_message', { room_id: roomId, message }),
  };
}