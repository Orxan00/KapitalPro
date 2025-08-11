import { Injectable } from '@nestjs/common';
import { ConfigService } from '../config/config.service';

@Injectable()
export class TelegramNotificationService {
  private botToken: string;
  private adminId: string;

  constructor(private configService: ConfigService) {
    this.botToken = this.configService.telegramBotToken;
    this.adminId = this.configService.telegramAdminId;
  }

  async sendDepositNotification(depositData: any,depositId:string) {
    if (!this.botToken || !this.adminId) {
      console.warn('⚠️ Telegram notification not configured. Missing BOT_TOKEN or ADMIN_ID');
      return false;
    }

    try {
      const message = this.formatDepositMessage(depositData, depositId);
      const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: this.adminId,
          text: message,
          parse_mode: 'HTML',
        }),
      });

      if (response.ok) {
        console.log('✅ Admin notification sent successfully');
        return true;
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to send admin notification:', errorData);
        return false;
      }
    } catch (error) {
      console.error('❌ Error sending admin notification:', error);
      return false;
    }
  }

  async sendWithdrawalNotification(withdrawalData: any, withdrawalId: string) {
    if (!this.botToken || !this.adminId) {
      console.warn('⚠️ Telegram notification not configured. Missing BOT_TOKEN or ADMIN_ID');
      return false;
    }

    try {
      const message = this.formatWithdrawalMessage(withdrawalData, withdrawalId);
      const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: this.adminId,
          text: message,
          parse_mode: 'HTML',
        }),
      });

      if (response.ok) {
        console.log('✅ Withdrawal notification sent successfully');
        return true;
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to send withdrawal notification:', errorData);
        return false;
      }
    } catch (error) {
      console.error('❌ Error sending withdrawal notification:', error);
      return false;
    }
  }

  async sendSubscriptionNotification(subscriptionData: any, subscriptionId: string) {
    if (!this.botToken || !this.adminId) {
      console.warn('⚠️ Telegram notification not configured. Missing BOT_TOKEN or ADMIN_ID');
      return false;
    }

    try {
      const message = this.formatSubscriptionMessage(subscriptionData, subscriptionId);
      const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: this.adminId,
          text: message,
          parse_mode: 'HTML',
        }),
      });

      if (response.ok) {
        console.log('✅ Subscription notification sent successfully');
        return true;
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to send subscription notification:', errorData);
        return false;
      }
    } catch (error) {
      console.error('❌ Error sending subscription notification:', error);
      return false;
    }
  }

  async sendAutomaticEarningsNotification(userId: string, totalEarnings: number) {
    if (!this.botToken || !this.adminId) {
      console.warn('⚠️ Telegram notification not configured. Missing BOT_TOKEN or ADMIN_ID');
      return false;
    }

    try {
      const message = this.formatAutomaticEarningsMessage(userId, totalEarnings);
      const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: this.adminId,
          text: message,
          parse_mode: 'HTML',
        }),
      });

      if (response.ok) {
        console.log('✅ Automatic earnings notification sent successfully');
        return true;
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to send automatic earnings notification:', errorData);
        return false;
      }
    } catch (error) {
      console.error('❌ Error sending automatic earnings notification:', error);
      return false;
    }
  }

  private formatDepositMessage(depositData: any, depositId: string): string {
    const amount = depositData.amount;
    const network = depositData.network_name || depositData.network;
    const user = depositData.user_username || `${depositData.user_first_name} ${depositData.user_last_name}`.trim();
    const firstName = depositData.user_first_name || '';
    const lastName = depositData.user_last_name || '';
    const transactionRef = depositData.transaction_ref;
    const userId = depositData.user_id;

    return `
💰 <b>New Deposit Received!</b>

👤 <b>User:</b> @${user}
📝 <b>Name:</b> ${firstName} ${lastName}
💵 <b>Amount:</b> ${amount} ${network}
🌐 <b>Network:</b> ${network}
🔗 <b>Transaction ID:</b> <code>${transactionRef}</code>
🔗 <b>Deposit Request ID:</b> <code>${depositId}</code>

📊 <b>Status:</b> <code>PENDING</code>
    `.trim();
  }

  private formatWithdrawalMessage(withdrawalData: any, withdrawalId: string): string {
    const amount = withdrawalData.amount;
    const network = withdrawalData.network_name || withdrawalData.network;
    const user = withdrawalData.user_username || `${withdrawalData.user_first_name} ${withdrawalData.user_last_name}`.trim();
    const firstName = withdrawalData.user_first_name || '';
    const lastName = withdrawalData.user_last_name || '';
    const withdrawalAddress = withdrawalData.withdrawal_address;
    const userId = withdrawalData.user_id;

    return `
💸 <b>New Withdrawal Request!</b>

👤 <b>User:</b> @${user}
📝 <b>Name:</b> ${firstName} ${lastName}
💵 <b>Amount:</b> ${amount} ${network}
🌐 <b>Network:</b> ${network}
📍 <b>Withdrawal Address:</b> <code>${withdrawalAddress}</code>
📊 <b>Status:</b> <code>PENDING</code>
🔗 <b>Withdrawal Request ID:</b> <code>${withdrawalId}</code>
    `.trim();
  }

  private formatSubscriptionMessage(subscriptionData: any, subscriptionId: string): string {
    const packageName = subscriptionData.package_name;
    const packagePrice = subscriptionData.package_price;
    const dailyReturn = subscriptionData.daily_return;
    const durationDays = subscriptionData.duration_days;
    const totalReturn = subscriptionData.total_return;
    const user = subscriptionData.user_username || `${subscriptionData.user_first_name} ${subscriptionData.user_last_name}`.trim();
    const firstName = subscriptionData.user_first_name || '';
    const lastName = subscriptionData.user_last_name || '';
    const userId = subscriptionData.user_id;

    return `
📦 <b>New Subscription Created!</b>

👤 <b>User:</b> @${user}
📝 <b>Name:</b> ${firstName} ${lastName}
📦 <b>Package:</b> ${packageName}
💵 <b>Investment:</b> $${packagePrice}
📈 <b>Daily Return:</b> ${dailyReturn}
⏱️ <b>Duration:</b> ${durationDays} days
💰 <b>Total Return:</b> $${totalReturn}

📊 <b>Status:</b> <code>ACTIVE</code>
    `.trim();
  }

  private formatAutomaticEarningsMessage(userId: string, totalEarnings: number): string {
    return `
💰 <b>Subscription Earnings Added!</b>

👤 <b>User ID:</b> <code>${userId}</code>
💵 <b>Total Earnings:</b> $${totalEarnings.toFixed(2)}
🤖 <b>Processed:</b> Automatically

✅ <b>Status:</b> <code>COMPLETED</code>
    `.trim();
  }
} 