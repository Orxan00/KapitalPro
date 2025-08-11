import { Module } from '@nestjs/common';
import { ConfigService } from './config/config.service';
import { HealthController } from './health.controller';
import { UsersModule } from './modules/users/users.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { NetworksModule } from './modules/networks/networks.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';

@Module({
  imports: [
    UsersModule,
    TransactionsModule,
    NetworksModule,
    SubscriptionsModule,
  ],
  controllers: [HealthController],
  providers: [ConfigService],
})
export class AppModule {}
