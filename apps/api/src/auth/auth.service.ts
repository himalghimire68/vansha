import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { verifyToken } from '@clerk/backend';
import { User } from '@vansha/shared-types';

interface ClerkUser {
  id: string;
  emailAddresses: Array<{ emailAddress: string }>;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
}

/**
 * Authentication Service
 * Integrates with Clerk for user authentication
 */
@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * Verify Clerk token and extract user information
   */
  async verifyClerkToken(token: string): Promise<ClerkUser> {
    try {
      const secretKey = this.configService.get('CLERK_SECRET_KEY');
      if (!secretKey) {
        throw new Error('CLERK_SECRET_KEY not configured');
      }

      const decoded = await verifyToken(token, {
        secretKey,
      });

      if (!decoded) {
        throw new UnauthorizedException('Invalid token');
      }

      return decoded as ClerkUser;
    } catch (error) {
      throw new UnauthorizedException('Failed to verify token');
    }
  }

  /**
   * Generate JWT token for internal use
   */
  generateJwtToken(userId: string, data?: Record<string, unknown>): string {
    return this.jwtService.sign(
      {
        sub: userId,
        ...data,
      },
      {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_EXPIRATION'),
      },
    );
  }

  /**
   * Verify JWT token
   */
  verifyJwtToken(token: string): any {
    try {
      return this.jwtService.verify(token, {
        secret: this.configService.get('JWT_SECRET'),
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  /**
   * Refresh JWT token
   */
  refreshJwtToken(token: string): string {
    const decoded = this.verifyJwtToken(token);
    return this.generateJwtToken(decoded.sub, decoded);
  }
}
