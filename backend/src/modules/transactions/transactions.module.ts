import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { ConfigService } from '../../config/config.service';
import { TelegramNotificationService } from '../../lib/telegram-notification.service';

@Module({
  controllers: [TransactionsController],
  providers: [TransactionsService, ConfigService, TelegramNotificationService],
  exports: [TransactionsService],
})
export class TransactionsModule {} 