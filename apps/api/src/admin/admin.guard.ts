import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const provided = req.headers['x-admin-key'];
    const secret = this.config.get<string>('ADMIN_SECRET');
    if (!secret || provided !== secret) {
      throw new UnauthorizedException('Admin access denied');
    }
    return true;
  }
}
