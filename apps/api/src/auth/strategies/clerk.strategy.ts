import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';

/**
 * Clerk JWT Strategy
 * Extracts and validates JWT tokens from Bearer headers
 */
@Injectable()
export class ClerkStrategy extends PassportStrategy(Strategy, 'clerk') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: (req: any) => {
        if (req.headers.authorization) {
          return req.headers.authorization.replace('Bearer ', '');
        }
        return null;
      },
      secretOrKey: configService.get('CLERK_SECRET_KEY'),
      passReqToCallback: true,
    });
  }

  async validate(req: any, payload: any) {
    return {
      userId: payload.sub,
      email: payload.email,
    };
  }
}
