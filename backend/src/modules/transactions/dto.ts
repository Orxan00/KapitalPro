import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateDepositDto {
  @IsString()
  user_id: string;

  @IsString()
  network: string;

  @IsString()
  network_name: string;

  @IsNumber()
  amount: number;

  @IsString()
  transaction_ref: string;

  @IsOptional()
  @IsString()
  user_first_name?: string;

  @IsOptional()
  @IsString()
  user_last_name?: string;

  @IsOptional()
  @IsString()
  user_username?: string;
}

export class CreateWithdrawalDto {
  @IsString()
  user_id: string;

  @IsString()
  network: string;

  @IsString()
  network_name: string;

  @IsNumber()
  amount: number;

  @IsString()
  withdrawal_address: string;

  @IsOptional()
  @IsString()
  user_first_name?: string;

  @IsOptional()
  @IsString()
  user_last_name?: string;

  @IsOptional()
  @IsString()
  user_username?: string;
} 