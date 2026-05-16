import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateRoomDto } from './dto/rooms.dto';

@Injectable()
export class RoomsService {
  constructor(private supabase: SupabaseService) {}

  async createRoom(userId: string, dto: CreateRoomDto) {
    const { data, error } = await this.supabase
      .from('focus_rooms')
      .insert({
        name: dto.name,
        description: dto.description || null,
        room_type: dto.room_type,
        subject_id: dto.subject_id || null,
        is_private: dto.is_private || false,
        max_participants: dto.max_participants || 50,
        created_by: userId,
      })
      .select()
      .single();

    if (error) throw new BadRequestException('Failed to create room');
    return data;
  }

  async getActiveRooms(type?: string) {
    let query = this.supabase
      .from('focus_rooms')
      .select('*, subjects(name), profiles:created_by(username, display_name, avatar_url)')
      .eq('is_active', true);

    if (type) query = query.eq('room_type', type);
    const { data } = await query.order('current_count', { ascending: false });
    return data || [];
  }

  async getRoom(roomId: string) {
    const { data, error } = await this.supabase
      .from('focus_rooms')
      .select('*, subjects(name), profiles:created_by(username, display_name, avatar_url)')
      .eq('id', roomId)
      .single();

    if (error || !data) throw new NotFoundException('Room not found');
    return data;
  }

  async joinRoom(userId: string, roomId: string) {
    const { data: room, error: roomError } = await this.supabase
      .from('focus_rooms')
      .select('*')
      .eq('id', roomId)
      .eq('is_active', true)
      .single();

    if (roomError || !room) throw new NotFoundException('Room not found or inactive');

    if (room.current_count >= room.max_participants) {
      throw new BadRequestException('Room is full');
    }

    const { data: existing } = await this.supabase
      .from('room_participants')
      .select('*')
      .eq('room_id', roomId)
      .eq('user_id', userId)
      .is('left_at', null)
      .maybeSingle();

    if (existing) return existing;

    const { data, error } = await this.supabase
      .from('room_participants')
      .insert({ room_id: roomId, user_id: userId, is_focusing: true })
      .select()
      .single();

    if (error) throw new BadRequestException('Failed to join room');

    await this.supabase
      .from('focus_rooms')
      .update({ current_count: room.current_count + 1 })
      .eq('id', roomId);

    await this.supabase.from('room_messages').insert({
      room_id: roomId,
      user_id: userId,
      message: 'joined the room',
      message_type: 'system',
    });

    return data;
  }

  async leaveRoom(userId: string, roomId: string) {
    const { data: participant } = await this.supabase
      .from('room_participants')
      .select('*')
      .eq('room_id', roomId)
      .eq('user_id', userId)
      .is('left_at', null)
      .single();

    if (!participant) throw new NotFoundException('Not in this room');

    const focusMinutes = participant.focus_minutes || 0;

    await this.supabase
      .from('room_participants')
      .update({ left_at: new Date().toISOString(), is_focusing: false })
      .eq('id', participant.id);

    const { data: room } = await this.supabase
      .from('focus_rooms')
      .select('current_count, total_focus_minutes')
      .eq('id', roomId)
      .single();

    if (room) {
      await this.supabase
        .from('focus_rooms')
        .update({
          current_count: Math.max(0, room.current_count - 1),
          total_focus_minutes: room.total_focus_minutes + focusMinutes,
        })
        .eq('id', roomId);
    }

    await this.supabase.from('room_messages').insert({
      room_id: roomId,
      user_id: userId,
      message: 'left the room',
      message_type: 'system',
    });

    return { message: 'Left room' };
  }

  async getParticipants(roomId: string) {
    const { data } = await this.supabase
      .from('room_participants')
      .select('*, profiles(username, display_name, avatar_url, xp_total, level_id, current_streak)')
      .eq('room_id', roomId)
      .is('left_at', null)
      .order('joined_at');

    return data || [];
  }

  async getMessages(roomId: string, limit = 50) {
    const { data } = await this.supabase
      .from('room_messages')
      .select('*, profiles(username, display_name, avatar_url)')
      .eq('room_id', roomId)
      .order('created_at', { ascending: false })
      .limit(limit);

    return (data || []).reverse();
  }

  async updateFocusMinutes(userId: string, roomId: string, minutes: number) {
    const { error } = await this.supabase
      .from('room_participants')
      .update({ focus_minutes: minutes })
      .eq('room_id', roomId)
      .eq('user_id', userId)
      .is('left_at', null);

    if (error) throw new BadRequestException('Failed to update focus minutes');
  }
}
