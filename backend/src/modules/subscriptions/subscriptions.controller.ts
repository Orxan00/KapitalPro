import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  async createSubscription(@Body() createSubscriptionDto: CreateSubscriptionDto) {
    try {

      const result = await this.subscriptionsService.createSubscription(createSubscriptionDto);
      
      if (result.success) {
        return {
          success: true,
          message: result.message,
          subscription_id: result.subscription_id
        };
      } else {
        return {
          success: false,
          message: result.message,
          currentBalance: result.currentBalance,
          requiredAmount: result.requiredAmount
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Internal server error',
        error: error.message
      };
    }
  }

  @Get('user/:userId')
  async getUserSubscriptions(@Param('userId') userId: string) {
    try {
      
      const subscriptions = await this.subscriptionsService.getUserSubscriptions(userId);
      
      return {
        success: true,
        data: subscriptions,
        count: subscriptions.length
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error fetching subscriptions',
        error: error.message
      };
    }
  }

  @Get(':subscriptionId')
  async getSubscriptionById(@Param('subscriptionId') subscriptionId: string) {
    try {
      
      const subscription = await this.subscriptionsService.getSubscriptionById(subscriptionId);
      
      if (subscription) {
        return {
          success: true,
          data: subscription
        };
      } else {
        return {
          success: false,
          message: 'Subscription not found'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Error fetching subscription',
        error: error.message
      };
    }
  }
} 