import { Controller, Get, Param, Query } from '@nestjs/common';
import { PredictionService } from './prediction.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../common/types';

@Controller('api/predictions')
export class PredictionController {
  constructor(private predictionService: PredictionService) {}

  @Get('performance')
  getPrediction(
    @CurrentUser() user: JwtPayload,
    @Query('subject_id') subjectId?: string,
  ) {
    return this.predictionService.getPerformancePrediction(user.sub, subjectId);
  }

  @Get()
  getPredictions(
    @CurrentUser() user: JwtPayload,
    @Query('type') type?: string,
  ) {
    return this.predictionService.getPredictions(user.sub, type);
  }

  @Get('mastery')
  getMastery(
    @CurrentUser() user: JwtPayload,
    @Query('topic_id') topicId?: string,
  ) {
    return this.predictionService.getMasterySnapshots(user.sub, topicId);
  }

  @Get('weak-areas')
  getWeakAreas(@CurrentUser() user: JwtPayload) {
    return this.predictionService.getWeakAreas(user.sub);
  }

  @Get('exam-readiness/:subjectId')
  getExamReadiness(
    @CurrentUser() user: JwtPayload,
    @Param('subjectId') subjectId: string,
  ) {
    return this.predictionService.getExamReadiness(user.sub, subjectId);
  }
}
