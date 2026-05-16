import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../../supabase/supabase.service';
import { JwtPayload } from '../../common/types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,
    private supabase: SupabaseService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret')!,
    });
  }

  async validate(payload: JwtPayload) {
    const { data: profile, error } = await this.supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url, xp_total, level_id, current_streak')
      .eq('id', payload.sub)
      .single();

    if (error || !profile) {
      throw new UnauthorizedException('User not found');
    }

    return {
      sub: profile.id,
      email: payload.email,
      username: profile.username,
      display_name: profile.display_name,
      avatar_url: profile.avatar_url,
      xp_total: profile.xp_total,
      level_id: profile.level_id,
      current_streak: profile.current_streak,
    };
  }
}
