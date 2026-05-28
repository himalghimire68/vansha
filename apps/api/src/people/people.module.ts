import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PeopleController } from './people.controller';
import { PeopleGlobalController } from './people-global.controller';
import { PeopleService } from './people.service';
import { PersonEntity } from '../person.entity';
import { GraphDatabaseService } from '../common/services/graph-database.service';
import { AuditService } from '../common/services/audit.service';

@Module({
  imports: [TypeOrmModule.forFeature([PersonEntity])],
  controllers: [PeopleController, PeopleGlobalController],
  providers: [PeopleService, GraphDatabaseService, AuditService],
  exports: [PeopleService],
})
export class PeopleModule {}
