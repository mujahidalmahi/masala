import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RoomsService } from './rooms.service';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim())
      : ['http://localhost:3000'],
    credentials: true,
  },
  namespace: '/ws/rooms',
})
export class RoomsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RoomsGateway.name);
  private userSocketMap = new Map<string, Set<string>>();
  private roomUserMap = new Map<string, Set<string>>();

  constructor(
    private jwtService: JwtService,
    private roomsService: RoomsService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.query?.token;
      if (!token) {
        client.emit('error', { message: 'Authentication required' });
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token as string);
      client.data.userId = payload.sub;

      if (!this.userSocketMap.has(payload.sub)) {
        this.userSocketMap.set(payload.sub, new Set());
      }
      this.userSocketMap.get(payload.sub)!.add(client.id);

      client.emit('connected', { userId: payload.sub });
    } catch {
      client.emit('error', { message: 'Invalid token' });
      client.disconnect();
    }
  }
async handleDisconnect(client: Socket) {
  const userId = client.data.userId;
  if (!userId) return;

  // Remove this socket first. If the user still has other active sockets
  // (e.g., reconnecting after page refresh), don't leave rooms — the new
  // socket is already there. This prevents a race where the old disconnect
  // handler leaves a room that the new socket just joined.
  const sockets = this.userSocketMap.get(userId);
  if (sockets) {
    sockets.delete(client.id);
    if (sockets.size > 0) return;
    this.userSocketMap.delete(userId);
  }

  // No more sockets for this user — leave all rooms
  const roomsToLeave: string[] = [];
  this.roomUserMap.forEach((users, roomId) => {
    if (users.has(userId)) roomsToLeave.push(roomId);
  });

  for (const roomId of roomsToLeave) {
    const users = this.roomUserMap.get(roomId);
    if (!users) continue;

    users.delete(userId);
    if (users.size === 0) this.roomUserMap.delete(roomId);

    try {
      await this.roomsService.leaveRoom(userId, roomId);
    } catch (err) {
      this.logger.error(`Failed to leave room ${roomId} on disconnect`, err);
    }

    this.server.to(roomId).emit('participant_left', { userId });
    this.server.to(roomId).emit('participant_count', { count: users.size });
  }
}

  @SubscribeMessage('join_room')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room_id: string },
  ) {
    const userId = client.data.userId;
    const roomId = data.room_id;

    try {
      await this.roomsService.joinRoom(userId, roomId);
    } catch (error) {
      client.emit('error', { message: (error as Error).message });
      return;
    }

    client.join(roomId);

    if (!this.roomUserMap.has(roomId)) {
      this.roomUserMap.set(roomId, new Set());
    }
    this.roomUserMap.get(roomId)!.add(userId);

    client.to(roomId).emit('user_joined', { userId });
    this.server.to(roomId).emit('participant_count', {
      count: this.roomUserMap.get(roomId)!.size,
    });
  }

  @SubscribeMessage('leave_room')
  async handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room_id: string },
  ) {
    const userId = client.data.userId;
    const roomId = data.room_id;

    try {
      await this.roomsService.leaveRoom(userId, roomId);
    } catch (error) {
      client.emit('error', { message: (error as Error).message });
      return;
    }

    client.leave(roomId);

    const users = this.roomUserMap.get(roomId);
    if (users) {
      users.delete(userId);
      if (users.size === 0) this.roomUserMap.delete(roomId);
    }

    client.to(roomId).emit('user_left', { userId });
    this.server.to(roomId).emit('participant_count', {
      count: users?.size || 0,
    });
  }

  @SubscribeMessage('send_message')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room_id: string; message: string },
  ) {
    const userId = client.data.userId;

    const saved = await this.roomsService.saveMessage(userId, data.room_id, data.message);

    this.server.to(data.room_id).emit('new_message', saved);
  }

  @SubscribeMessage('focus_update')
  async handleFocusUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room_id: string; focus_minutes: number },
  ) {
    const userId = client.data.userId;

    try {
      await this.roomsService.updateFocusMinutes(userId, data.room_id, data.focus_minutes);
    } catch (error) {
      client.emit('error', { message: (error as Error).message });
      return;
    }

    this.server.to(data.room_id).emit('focus_updated', {
      userId,
      focus_minutes: data.focus_minutes,
    });
  }

  @SubscribeMessage('focus_tick')
  handleFocusTick(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room_id: string; focus_minutes: number },
  ) {
    // Lightweight broadcast — no DB write
    this.server.to(data.room_id).emit('focus_tick_updated', {
      userId: client.data.userId,
      focus_minutes: data.focus_minutes,
    });
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room_id: string; is_typing: boolean },
  ) {
    client.to(data.room_id).emit('user_typing', {
      userId: client.data.userId,
      is_typing: data.is_typing,
    });
  }
}
