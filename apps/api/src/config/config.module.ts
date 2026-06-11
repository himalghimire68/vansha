import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigController } from './config.controller';
import { ConfigSeedService } from './config-seed.service';
import { GotraConfigEntity } from './gotra-config.entity';
import { SiteConfigEntity } from './site-config.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GotraConfigEntity, SiteConfigEntity])],
  controllers: [ConfigController],
  providers: [ConfigSeedService],
  exports: [TypeOrmModule],
})
export class VanshaConfigModule {}
