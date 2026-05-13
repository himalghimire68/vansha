import { Module } from '@nestjs/common';

import { PeopleController } from './people.controller';
import { PeopleService } from './people.service';
import { GraphDatabaseService } from '../common/services/graph-database.service';
import { AuditService } from '../common/services/audit.service';

/**
 * People Module
 * Handles genealogical data management
 */
@Module({
  controllers: [PeopleController],
  providers: [PeopleService, GraphDatabaseService, AuditService],
  exports: [PeopleService],
})
export class PeopleModule {}
