import { Controller, Post, Body } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './user.entity';

@Controller('users')
export class UsersController {
  constructor(
    @InjectRepository(UserEntity) private users: Repository<UserEntity>,
  ) {}

  // Called by the login page (fire-and-forget) to ensure the user exists in our DB
  @Post('ensure')
  async ensureUser(@Body() body: { email?: string; firstName?: string; lastName?: string }) {
    if (!body.email) return { ok: false };
    let user = await this.users.findOne({ where: { email: body.email } });
    if (!user) {
      user = this.users.create({
        email: body.email,
        firstName: body.firstName,
        lastName: body.lastName,
        status: 'active',
        role: 'member',
      });
    }
    user.lastLoginAt = new Date();
    if (body.firstName && !user.firstName) user.firstName = body.firstName;
    if (body.lastName && !user.lastName) user.lastName = body.lastName;
    await this.users.save(user);
    return { ok: true, id: user.id };
  }
}
