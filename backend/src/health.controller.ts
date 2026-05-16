import { Controller, Get } from '@nestjs/common';
import { Public } from './common/decorators/public.decorator';

@Controller('api')
export class HealthController {
  @Public()
  @Get('health')
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'studysprint-os-backend',
      version: '1.0.0',
    };
  }
}
