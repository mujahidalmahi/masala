import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class RoutineService {
  private readonly logger = new Logger(RoutineService.name);

  constructor(private supabase: SupabaseService) {}

  async generateDailyRoutine(userId: string, availableMinutes = 60) {
    const { data, error } = await this.supabase.rpc('generate_daily_routine', {
      p_user_id: userId,
      p_date: new Date().toISOString().split('T')[0],
      p_available_minutes: availableMinutes,
    });

    if (error) {
      this.logger.error(`Failed to generate routine: ${error.message}`);
      throw new Error('Failed to generate routine');
    }

    return data;
  }

  async getTodayRoutine(userId: string) {
    const today = new Date().toISOString().split('T')[0];

    const { data: routine } = await this.supabase
      .from('user_routines')
      .select('*')
      .eq('user_id', userId)
      .eq('routine_date', today)
      .maybeSingle();

    if (!routine) return null;

    const { data: slots } = await this.supabase
      .from('routine_slots')
      .select('*, subjects(name), chapters(name), topics(name)')
      .eq('routine_id', routine.id)
      .order('display_order');

    return { ...routine, slots: slots || [] };
  }

  async markSlotComplete(userId: string, slotId: string) {
    const { data: slot } = await this.supabase
      .from('routine_slots')
      .select('*, routine_id, user_routines!inner(user_id)')
      .eq('id', slotId)
      .single();

    if (!slot || slot.user_routines?.user_id !== userId) {
      throw new Error('Slot not found');
    }

    await this.supabase.from('routine_slots').update({ is_completed: true }).eq('id', slotId);

    const { data: incompleteSlots } = await this.supabase
      .from('routine_slots')
      .select('id')
      .eq('routine_id', slot.routine_id)
      .eq('is_completed', false);

    if (!incompleteSlots || incompleteSlots.length === 0) {
      await this.supabase
        .from('user_routines')
        .update({ is_completed: true, completed_at: new Date().toISOString() })
        .eq('id', slot.routine_id);
    }

    return { message: 'Slot marked complete' };
  }

  async getRoutineHistory(userId: string, limit = 14) {
    const { data } = await this.supabase
      .from('user_routines')
      .select('*, routine_slots(*)')
      .eq('user_id', userId)
      .order('routine_date', { ascending: false })
      .limit(limit);

    return data || [];
  }

  async getWeeklyPlan(userId: string) {
    const today = new Date();
    const weekFromNow = new Date(Date.now() + 7 * 86400000);

    const { data } = await this.supabase
      .from('user_routines')
      .select('*, routine_slots(*, subjects(name), chapters(name), topics(name))')
      .eq('user_id', userId)
      .gte('routine_date', today.toISOString().split('T')[0])
      .lte('routine_date', weekFromNow.toISOString().split('T')[0])
      .order('routine_date');

    return data || [];
  }
}
