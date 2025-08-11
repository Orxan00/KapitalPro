import { IsString, IsNumber, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateSubscriptionDto {
  @IsString()
  @IsNotEmpty()
  user_id: string;

  @IsString()
  @IsOptional()
  user_username?: string;

  @IsString()
  @IsOptional()
  user_first_name?: string;

  @IsString()
  @IsOptional()
  user_last_name?: string;

  @IsString()
  @IsNotEmpty()
  package_name: string;

  @IsNumber()
  @IsNotEmpty()
  package_price: number;

  @IsString()
  @IsNotEmpty()
  daily_return: string;

  @IsNumber()
  @IsNotEmpty()
  duration_days: number;

  @IsNumber()
  @IsNotEmpty()
  total_return: number;
}

export class SubscriptionResponseDto {
  id: string;
  user_id: string;
  package_name: string;
  package_price: number;
  daily_return: string;
  duration_days: number;
  total_return: number;
  start_date: Date;
  end_date: Date;
  status: 'active' | 'completed' | 'pending';
  total_earned: number;
  remaining_days: number;
  last_earnings_update: Date;
  created_at: Date;
  updated_at: Date;
} 