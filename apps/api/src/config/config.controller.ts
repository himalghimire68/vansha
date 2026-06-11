import { Controller, Get } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GotraConfigEntity } from './gotra-config.entity';
import { SiteConfigEntity } from './site-config.entity';

@Controller()
export class ConfigController {
  constructor(
    @InjectRepository(GotraConfigEntity) private gotras: Repository<GotraConfigEntity>,
    @InjectRepository(SiteConfigEntity)  private configs: Repository<SiteConfigEntity>,
  ) {}

  @Get('gotras')
  async getGotras() {
    return this.gotras.find({ order: { sortOrder: 'ASC', gotra: 'ASC' } });
  }

  @Get('site-config')
  async getSiteConfig() {
    const rows = await this.configs.find();
    return Object.fromEntries(rows.map(r => [r.key, r.value]));
  }
}
