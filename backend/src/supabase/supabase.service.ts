import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private readonly logger = new Logger(SupabaseService.name);
  private supabase: SupabaseClient;
  private serviceClient: SupabaseClient;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const url = this.configService.get<string>('supabase.url');
    const anonKey = this.configService.get<string>('supabase.anonKey');
    const serviceRoleKey = this.configService.get<string>('supabase.serviceRoleKey');

    if (!url || !anonKey) {
      this.logger.warn('Supabase credentials not configured');
      return;
    }

    this.supabase = createClient(url, anonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    this.serviceClient = createClient(url, serviceRoleKey!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    this.logger.log('Supabase clients initialized');
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }

  getServiceClient(): SupabaseClient {
    return this.serviceClient;
  }

  get auth() {
    return this.supabase.auth as any;
  }

  get serviceAuth() {
    return this.serviceClient.auth as any;
  }

  from(table: string) {
    return this.serviceClient.from(table);
  }

  rpc(fn: string, params?: Record<string, unknown>) {
    return this.serviceClient.rpc(fn, params);
  }

  storage() {
    return this.serviceClient.storage;
  }
}
