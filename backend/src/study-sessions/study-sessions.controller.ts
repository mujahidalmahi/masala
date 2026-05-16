import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UsePipes,
} from '@nestjs/common';
import { StudySessionsService } from './study-sessions.service';
import { CreateSessionSchema, EndSessionSchema, CreateSessionDto, EndSessionDto } from './dto/create-session.dto';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../common/types';

@Controller('api/study-sessions')
export class StudySessionsController {
  constructor(private sessionsService: StudySessionsService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(CreateSessionSchema))
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateSessionDto) {
    return this.sessionsService.create(user.sub, dto);
  }

  @Patch(':id/end')
  @UsePipes(new ZodValidationPipe(EndSessionSchema))
  endSession(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: EndSessionDto,
  ) {
    return this.sessionsService.endSession(user.sub, id, dto);
  }

  @Get()
  getHistory(
    @CurrentUser() user: JwtPayload,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.sessionsService.getHistory(user.sub, limit || 20, offset || 0);
  }

  @Get('stats')
  getStats(@CurrentUser() user: JwtPayload) {
    return this.sessionsService.getStats(user.sub);
  }
}
