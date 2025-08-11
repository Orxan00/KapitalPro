import { Module } from '@nestjs/common';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { ConfigService } from '../../config/config.service';
import { TelegramNotificationService } from '../../lib/telegram-notification.service';

@Module({
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService, ConfigService, TelegramNotificationService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {} 