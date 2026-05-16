'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store';

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
  const token = useAuthStore((s) => s.token);
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [participants, setParticipants] = useState<number>(0);
  const [messages, setMessages] = useState<RoomMessage[]>([]);

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
      setParticipants(data.count);
    });

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
    messages,
    sendFocusUpdate: (focus_minutes: number) =>
      socketRef.current?.emit('focus_update', { room_id: roomId, focus_minutes }),
    sendMessage: (message: string) =>
      socketRef.current?.emit('send_message', { room_id: roomId, message }),
  };
}