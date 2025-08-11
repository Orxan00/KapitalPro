import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  ping() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: 'Investment Platform Backend is running'
    };
  }
} 