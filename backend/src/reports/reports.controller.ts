import { Controller, Get, Post, Param, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../common/types';

@Controller('api/reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('weekly')
  async getWeeklyReport(@CurrentUser() user: JwtPayload) {
    const data = await this.reportsService.generateWeeklyReport(user.sub);
    await this.reportsService.saveReport(user.sub, 'weekly', data);
    return data;
  }

  @Get('monthly')
  async getMonthlyReport(@CurrentUser() user: JwtPayload) {
    const data = await this.reportsService.generateMonthlyReport(user.sub);
    await this.reportsService.saveReport(user.sub, 'monthly', data);
    return data;
  }

  @Get('custom')
  async getCustomReport(
    @CurrentUser() user: JwtPayload,
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    const data = await this.reportsService.generateCustomReport(user.sub, start, end);
    await this.reportsService.saveReport(user.sub, 'custom', data);
    return data;
  }

  @Get('history')
  getHistory(@CurrentUser() user: JwtPayload) {
    return this.reportsService.getReportHistory(user.sub);
  }
}
