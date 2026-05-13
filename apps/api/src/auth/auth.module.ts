import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ClerkStrategy } from './strategies/clerk.strategy';

/**
 * Authentication Module
 * Handles user authentication via Clerk and JWT token management
 */
@Module({
  controllers: [AuthController],
  providers: [AuthService, ClerkStrategy, JwtService, ConfigService],
  exports: [AuthService],
})
export class AuthModule {}
