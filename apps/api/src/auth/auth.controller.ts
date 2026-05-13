import { Controller, Post, Body, Get, Req, BadRequestException, ApiTags } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

import { AuthService } from './auth.service';

interface VerifyTokenRequest {
  token: string;
}

interface VerifyTokenResponse {
  success: boolean;
  userId: string;
  email: string;
}

/**
 * Authentication Controller
 * Handles token verification and authentication operations
 */
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('verify')
  @ApiOperation({ summary: 'Verify Clerk token' })
  @ApiResponse({ status: 200, description: 'Token verified successfully' })
  async verify(@Body() body: VerifyTokenRequest): Promise<VerifyTokenResponse> {
    if (!body.token) {
      throw new BadRequestException('Token is required');
    }

    try {
      const clerkUser = await this.authService.verifyClerkToken(body.token);
      const email = clerkUser.emailAddresses?.[0]?.emailAddress;

      return {
        success: true,
        userId: clerkUser.id,
        email: email || 'unknown',
      };
    } catch (error) {
      throw new BadRequestException('Invalid token');
    }
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh JWT token' })
  async refresh(@Body('token') token: string): Promise<{ token: string }> {
    if (!token) {
      throw new BadRequestException('Token is required');
    }

    try {
      const newToken = this.authService.refreshJwtToken(token);
      return { token: newToken };
    } catch (error) {
      throw new BadRequestException('Invalid token');
    }
  }
}
