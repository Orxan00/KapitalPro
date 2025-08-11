import { Module } from '@nestjs/common';
import { NetworksController } from './networks.controller';
import { NetworksService } from './networks.service';
import { ConfigService } from '../../config/config.service';

@Module({
  controllers: [NetworksController],
  providers: [NetworksService, ConfigService],
  exports: [NetworksService],
})
export class NetworksModule {} 