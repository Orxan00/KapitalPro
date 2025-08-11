import { Controller, Post, Body } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateDepositDto, CreateWithdrawalDto } from './dto';

@Controller()
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('deposits')
  async createDeposit(@Body() depositData: CreateDepositDto) {
    console.log('📥 Received deposit request:', depositData);
    const result = await this.transactionsService.createDeposit(depositData);
    console.log('📤 Deposit result:', result);
    return result;
  }

  @Post('withdrawals')
  async createWithdrawal(@Body() withdrawalData: CreateWithdrawalDto) {
    return await this.transactionsService.createWithdrawal(withdrawalData);
  }
} 