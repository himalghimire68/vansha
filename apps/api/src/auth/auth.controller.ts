import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Log in with email and password, receive JWT' })
  async login(@Body() body: { email?: string; password?: string }) {
    if (!body.email || !body.password) {
      throw new BadRequestException('Email and password are required');
    }
    return this.authService.login(body.email, body.password);
  }

  @Post('register')
  @ApiOperation({ summary: 'Create account, receive JWT' })
  async register(
    @Body() body: { email?: string; password?: string; firstName?: string; lastName?: string },
  ) {
    if (!body.email || !body.password) {
      throw new BadRequestException('Email and password are required');
    }
    return this.authService.register(body.email, body.password, body.firstName, body.lastName);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Verify a JWT and return a fresh one' })
  async refresh(@Body('token') token: string) {
    if (!token) throw new BadRequestException('Token is required');
    const payload = this.authService.verifyJwtToken(token);
    return { token: this.authService.generateJwtToken(payload.sub, { email: payload.email }) };
  }
}
