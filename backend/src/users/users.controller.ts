import { Controller, Get, Patch, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateProfileSchema, UpdateProfileDto } from './dto/update-profile.dto';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../common/types';

@Controller('api/users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  getProfile(@CurrentUser() user: JwtPayload) {
    return this.usersService.getProfile(user.sub);
  }

  @Patch('me')
  updateProfile(@CurrentUser() user: JwtPayload, @Body(new ZodValidationPipe(UpdateProfileSchema)) dto: UpdateProfileDto) {
    return this.usersService.updateProfile(user.sub, dto);
  }

  @Get('dashboard')
  getDashboard(@CurrentUser() user: JwtPayload) {
    return this.usersService.getDashboard(user.sub);
  }

  @Post('onboarding')
  async completeOnboarding(
    @CurrentUser() user: JwtPayload,
    @Body() data: { country_id: string; board_id: string; grade_id: string; subject_ids: string[] },
  ) {
    return this.usersService.completeOnboarding(user.sub, data);
  }
}
