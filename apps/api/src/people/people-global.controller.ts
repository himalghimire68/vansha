import { Controller, Post, Body } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PersonEntity } from '../person.entity';

@ApiTags('People')
@Controller('people')
export class PeopleGlobalController {
  constructor(
    @InjectRepository(PersonEntity)
    private readonly repo: Repository<PersonEntity>,
  ) {}

  @Post('resolve')
  @ApiOperation({ summary: 'Fetch multiple people by ID across all families' })
  async resolve(@Body() body: { ids: string[] }): Promise<PersonEntity[]> {
    if (!body?.ids?.length) return [];
    return this.repo.find({ where: { id: In(body.ids) } });
  }
}
