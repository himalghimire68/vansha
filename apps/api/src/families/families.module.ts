import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FamiliesController } from './families.controller';
import { FamiliesService } from './families.service';
import { FamilyEntity } from '../family.entity';
import { FamilyMemberEntity } from '../family-member.entity';
import { GraphDatabaseService } from '../common/services/graph-database.service';
import { AuditService } from '../common/services/audit.service';

@Module({
  imports: [TypeOrmModule.forFeature([FamilyEntity, FamilyMemberEntity])],
  controllers: [FamiliesController],
  providers: [FamiliesService, GraphDatabaseService, AuditService],
  exports: [FamiliesService],
})
export class FamiliesModule {}
