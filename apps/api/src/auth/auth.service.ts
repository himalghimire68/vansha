import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { pbkdf2Sync, randomBytes, timingSafeEqual } from 'crypto';
import { UserEntity } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async login(email: string, password: string): Promise<{ userId: string; token: string }> {
    const user = await this.userRepository
      .createQueryBuilder('u')
      .addSelect('u.passwordHash')
      .addSelect('u.passwordSalt')
      .where('u.email = :email', { email })
      .getOne();

    if (!user) throw new UnauthorizedException('Invalid credentials');

    if (!user.passwordHash || !user.passwordSalt) {
      // First-time login: set the password and proceed
      const { salt, hash } = this.hashPassword(password);
      user.passwordSalt = salt;
      user.passwordHash = hash;
    } else {
      const candidate = pbkdf2Sync(password, user.passwordSalt, 100000, 64, 'sha512').toString('hex');
      if (!timingSafeEqual(Buffer.from(candidate), Buffer.from(user.passwordHash))) {
        throw new UnauthorizedException('Invalid credentials');
      }
    }

    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    return { userId: user.id, token: this.generateJwtToken(user.id, { email: user.email }) };
  }

  async register(
    email: string,
    password: string,
    firstName?: string,
    lastName?: string,
  ): Promise<{ userId: string; token: string }> {
    const existing = await this.userRepository.findOne({ where: { email } });
    if (existing) return this.login(email, password);

    const { salt, hash } = this.hashPassword(password);
    const user = this.userRepository.create({
      email,
      firstName,
      lastName,
      passwordSalt: salt,
      passwordHash: hash,
      role: 'member',
      status: 'active',
      lastLoginAt: new Date(),
    });
    const saved = await this.userRepository.save(user);

    return { userId: saved.id, token: this.generateJwtToken(saved.id, { email: saved.email }) };
  }

  generateJwtToken(userId: string, data?: Record<string, unknown>): string {
    return this.jwtService.sign(
      { sub: userId, ...data },
      {
        secret: this.configService.get('JWT_SECRET') || 'dev_secret',
        expiresIn: this.configService.get('JWT_EXPIRATION') || '7d',
      },
    );
  }

  verifyJwtToken(token: string): { sub: string; email?: string } {
    try {
      return this.jwtService.verify(token, {
        secret: this.configService.get('JWT_SECRET') || 'dev_secret',
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private hashPassword(password: string): { salt: string; hash: string } {
    const salt = randomBytes(16).toString('hex');
    const hash = pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return { salt, hash };
  }
}
