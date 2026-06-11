import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminGuard } from './admin.guard';
import { FamilyEntity } from '../family.entity';
import { PersonEntity } from '../person.entity';
import { ApprovalRequestEntity } from '../approval-request.entity';
import { VanshaConfigModule } from '../config/config.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FamilyEntity, PersonEntity, ApprovalRequestEntity]),
    VanshaConfigModule,
    UsersModule,
  ],
  controllers: [AdminController],
  providers: [AdminGuard],
})
export class AdminModule {}
