import { Controller, Get, Param, Query } from '@nestjs/common';
import { GamificationService } from './gamification.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../common/types';
import { Public } from '../common/decorators/public.decorator';

@Controller('api/gamification')
export class GamificationController {
  constructor(private gamificationService: GamificationService) {}

  @Get('profile')
  getProfile(@CurrentUser() user: JwtPayload) {
    return this.gamificationService.getProfile(user.sub);
  }

  @Get('streak')
  getStreak(@CurrentUser() user: JwtPayload) {
    return this.gamificationService.getStreak(user.sub);
  }

  @Get('badges')
  getBadges(@CurrentUser() user: JwtPayload) {
    return this.gamificationService.getBadges(user.sub);
  }

  @Public()
  @Get('badges/all')
  getAllBadges() {
    return this.gamificationService.getAllBadges();
  }

  @Get('skills')
  getSkills(@CurrentUser() user: JwtPayload) {
    return this.gamificationService.getSkills(user.sub);
  }

  @Public()
  @Get('skill-trees')
  getSkillTrees(@Query('subject_id') subjectId?: string) {
    return this.gamificationService.getSkillTrees(subjectId);
  }

  @Public()
  @Get('leaderboard')
  getLeaderboard(
    @Query('type') type?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.gamificationService.getLeaderboard(
      (type as 'xp' | 'streak') || 'xp',
      limit || 20,
      offset || 0,
    );
  }

  @Get('leaderboard/rank')
  getUserRank(@CurrentUser() user: JwtPayload) {
    return this.gamificationService.getUserRank(user.sub);
  }

  @Get('challenges')
  getDailyChallenges(@CurrentUser() user: JwtPayload) {
    return this.gamificationService.getDailyChallenges(user.sub);
  }

  @Public()
  @Get('levels')
  getLevels() {
    return this.gamificationService.getLevels();
  }
}
