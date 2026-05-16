import { Controller, Get, Post, Param, Body, Query } from '@nestjs/common';
import { RoutineService } from './routine.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../common/types';

@Controller('api/routines')
export class RoutineController {
  constructor(private routineService: RoutineService) {}

  @Post('generate')
  generateDailyRoutine(
    @CurrentUser() user: JwtPayload,
    @Body() body: { available_minutes?: number },
  ) {
    return this.routineService.generateDailyRoutine(user.sub, body.available_minutes || 60);
  }

  @Get('today')
  getTodayRoutine(@CurrentUser() user: JwtPayload) {
    return this.routineService.getTodayRoutine(user.sub);
  }

  @Post('slots/:id/complete')
  markSlotComplete(@CurrentUser() user: JwtPayload, @Param('id') slotId: string) {
    return this.routineService.markSlotComplete(user.sub, slotId);
  }

  @Get('history')
  getHistory(@CurrentUser() user: JwtPayload, @Query('limit') limit?: number) {
    return this.routineService.getRoutineHistory(user.sub, limit || 14);
  }

  @Get('weekly')
  getWeeklyPlan(@CurrentUser() user: JwtPayload) {
    return this.routineService.getWeeklyPlan(user.sub);
  }
}
