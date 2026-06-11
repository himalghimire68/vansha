import { Module, Get, Controller } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { join } from 'path';

import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { FamiliesModule } from './families/families.module';
import { PeopleModule } from './people/people.module';
import { ApprovalsModule } from './approvals/approvals.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SearchModule } from './search/search.module';
import { RelationshipsModule } from './people/relationships.module';
import { VanshaConfigModule } from './config/config.module';
import { UsersModule } from './users/users.module';
import { UploadModule } from './upload/upload.module';
import { HealthController } from './common/health.controller';

import { FamilyEntity } from './family.entity';
import { PersonEntity } from './person.entity';
import { FamilyMemberEntity } from './family-member.entity';
import { CrossFamilyLinkEntity } from './cross-family-link.entity';
import { ApprovalRequestEntity } from './approval-request.entity';
import { NotificationEntity } from './notification.entity';
import { GotraConfigEntity } from './config/gotra-config.entity';
import { SiteConfigEntity } from './config/site-config.entity';
import { UserEntity } from './users/user.entity';

const ALL_ENTITIES = [
  FamilyEntity, PersonEntity, FamilyMemberEntity, CrossFamilyLinkEntity,
  ApprovalRequestEntity, NotificationEntity, GotraConfigEntity, SiteConfigEntity, UserEntity,
];

@Controller()
export class AppController {
  @Get()
  getHello() {
    return {
      status: 'Vansha API is running',
      docs: '/api/docs',
      health: '/health',
    };
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'production'
          ? [join(process.cwd(), '.env.production'), '.env']
          : [
              join(process.cwd(), '../../.env.local'),
              join(process.cwd(), '.env.local'),
              '.env.local',
              '.env',
            ],
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const dbType = config.get('DATABASE_TYPE') || 'sqlite';

        if (dbType === 'sqlite') {
          return {
            type: 'better-sqlite3' as const,
            database: (config.get<string>('DATABASE_PATH') || './vansha-dev.db') as string,
            entities: ALL_ENTITIES,
            synchronize: true,
            logging: false,
          };
        }

        return {
          type: 'postgres' as const,
          host: config.get('DATABASE_HOST'),
          port: parseInt(config.get('DATABASE_PORT') || '5432'),
          username: config.get('DATABASE_USER'),
          password: config.get('DATABASE_PASSWORD'),
          database: config.get('DATABASE_NAME'),
          ssl: config.get('DATABASE_SSL') === 'true' ? { rejectUnauthorized: false } : false,
          entities: ALL_ENTITIES,
          migrations: [`${__dirname}/migrations/*{.ts,.js}`],
          synchronize: config.get('NODE_ENV') !== 'production',
          logging: config.get('NODE_ENV') === 'development',
          poolSize: 20,
        };
      },
    }),

    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET') || 'dev_secret',
        signOptions: {
          expiresIn: config.get('JWT_EXPIRATION') || '7d',
        },
      }),
    }),

    AdminModule,
    AuthModule,
    FamiliesModule,
    PeopleModule,
    ApprovalsModule,
    NotificationsModule,
    SearchModule,
    RelationshipsModule,
    VanshaConfigModule,
    UsersModule,
    UploadModule,
  ],
  controllers: [AppController, HealthController],
})
export class AppModule {}
