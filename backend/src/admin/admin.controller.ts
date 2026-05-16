import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UsePipes } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../common/types';

@Controller('api/admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('stats')
  getStats(@CurrentUser() user: JwtPayload) {
    return this.adminService.getStats(user.sub);
  }

  @Get('users')
  getUsers(@Query() query: { page?: string; limit?: string; search?: string }) {
    return this.adminService.getUsers({
      page: parseInt(query.page || '1'),
      limit: parseInt(query.limit || '20'),
      search: query.search,
    });
  }

  @Get('users/:id')
  getUser(@Param('id') id: string) {
    return this.adminService.getUser(id);
  }

  @Patch('users/:id')
  updateUser(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updateUser(id, data);
  }

  @Delete('users/:id')
  deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  @Post('curriculum/subjects')
  createSubject(@Body() data: any) {
    return this.adminService.createSubject(data);
  }

  @Patch('curriculum/subjects/:id')
  updateSubject(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updateSubject(id, data);
  }

  @Delete('curriculum/subjects/:id')
  deleteSubject(@Param('id') id: string) {
    return this.adminService.deleteSubject(id);
  }

  @Post('curriculum/chapters')
  createChapter(@Body() data: any) {
    return this.adminService.createChapter(data);
  }

  @Patch('curriculum/chapters/:id')
  updateChapter(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updateChapter(id, data);
  }

  @Post('curriculum/topics')
  createTopic(@Body() data: any) {
    return this.adminService.createTopic(data);
  }

  @Patch('curriculum/topics/:id')
  updateTopic(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updateTopic(id, data);
  }

  @Get('questions')
  getQuestions(@Query() query: { page?: string; limit?: string; subject_id?: string }) {
    return this.adminService.getQuestions({
      page: parseInt(query.page || '1'),
      limit: parseInt(query.limit || '20'),
      subject_id: query.subject_id,
    });
  }

  @Post('questions')
  createQuestion(@Body() data: any) {
    return this.adminService.createQuestion(data);
  }

  @Patch('questions/:id')
  updateQuestion(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updateQuestion(id, data);
  }

  @Delete('questions/:id')
  deleteQuestion(@Param('id') id: string) {
    return this.adminService.deleteQuestion(id);
  }

  @Post('badges')
  createBadge(@Body() data: any) {
    return this.adminService.createBadge(data);
  }

  @Patch('badges/:id')
  updateBadge(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updateBadge(id, data);
  }

  @Delete('badges/:id')
  deleteBadge(@Param('id') id: string) {
    return this.adminService.deleteBadge(id);
  }
}
