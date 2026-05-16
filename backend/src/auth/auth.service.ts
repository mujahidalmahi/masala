import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SupabaseService } from '../supabase/supabase.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponse } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private supabase: SupabaseService,
    private jwtService: JwtService,
  ) {}

  async signup(dto: SignupDto): Promise<AuthResponse> {
    if (dto.username) {
      const { data: usernameTaken } = await this.supabase
        .from('profiles')
        .select('id')
        .eq('username', dto.username)
        .maybeSingle();

      if (usernameTaken) {
        throw new ConflictException('Username already taken');
      }
    }

    const { data: authUser, error: authError } = await this.supabase.auth.signUp({
      email: dto.email,
      password: dto.password,
      options: {
        data: {
          display_name: dto.display_name || dto.email.split('@')[0],
        },
      },
    });

    if (authError) {
      if (authError.message?.includes('already registered')) {
        throw new ConflictException('Email already registered');
      }
      throw new UnauthorizedException(authError.message);
    }
    if (!authUser.user) throw new UnauthorizedException('Signup failed');

    const userId = authUser.user.id;
    const displayName = dto.display_name || dto.email.split('@')[0];
    const username = dto.username || dto.email.split('@')[0].toLowerCase();

    const { error: profileError } = await this.supabase.from('profiles').update({
      username,
      display_name: displayName,
      grade_id: dto.grade_id || null,
      board_id: dto.board_id || null,
      country_id: dto.country_id || null,
      is_onboarded: false,
    }).eq('id', userId);

    if (profileError) {
      this.logger.error(`Profile update failed: ${profileError.message}`);
    }

    const token = this.generateToken(userId, dto.email);

    return {
      user: {
        id: userId,
        email: dto.email,
        username,
        display_name: displayName,
        avatar_url: null,
        xp_total: 0,
        level_id: 1,
        current_streak: 0,
        role: 'user',
      },
      access_token: token,
    };
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const { data: authData, error: authError } = await this.supabase.auth.signInWithPassword({
      email: dto.email,
      password: dto.password,
    });

    if (authError) {
      throw new UnauthorizedException(authError.message);
    }

    const userId = authData.user.id;

    const { data: profile } = await this.supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url, xp_total, level_id, current_streak, role')
      .eq('id', userId)
      .single();

    const token = this.generateToken(userId, dto.email);

    return {
      user: {
        id: userId,
        email: dto.email,
        username: profile?.username || null,
        display_name: profile?.display_name || null,
        avatar_url: profile?.avatar_url || null,
        xp_total: profile?.xp_total || 0,
        level_id: profile?.level_id || 1,
        current_streak: profile?.current_streak || 0,
        role: profile?.role || 'user',
      },
      access_token: token,
    };
  }

  private generateToken(userId: string, email: string): string {
    return this.jwtService.sign({ sub: userId, email });
  }
}
