import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

/**
 * Clerk JWT Strategy
 * Validates Bearer tokens from Clerk. Falls back gracefully when
 * CLERK_SECRET_KEY is a placeholder — controllers use x-user-id header instead.
 */
@Injectable()
export class ClerkStrategy extends PassportStrategy(Strategy, 'clerk') {
  constructor(configService: ConfigService) {
    const secret = configService.get<string>('CLERK_SECRET_KEY') || 'dev_placeholder_not_real';

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secret,
      passReqToCallback: true,
      ignoreExpiration: false,
    });
  }

  async validate(_req: any, payload: any) {
    return {
      userId: payload.sub,
      email: payload.email,
    };
  }
}
