import { Controller, Get, Param, Put, Body } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':userId')
  async getUser(@Param('userId') userId: string) {
    return await this.usersService.getUser(userId);
  }

  @Get(':userId/balance')
  async getUserBalance(@Param('userId') userId: string) {
    return await this.usersService.getUserBalance(userId);
  }

  @Put(':userId/balance')
  async updateUserBalance(
    @Param('userId') userId: string,
    @Body() body: { balance: number }
  ) {
    return await this.usersService.updateUserBalance(userId, body.balance);
  }

  @Get(':userId/deposits')
  async getUserDeposits(@Param('userId') userId: string) {
    return await this.usersService.getUserDeposits(userId);
  }

  @Get(':userId/withdrawals')
  async getUserWithdrawals(@Param('userId') userId: string) {
    return await this.usersService.getUserWithdrawals(userId);
  }
} 