import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UsePipes,
} from '@nestjs/common';
import { QuizService } from './quiz.service';
import {
  CreateQuizSchema,
  AutoGenerateQuizSchema,
  SubmitAnswerSchema,
  StartAttemptSchema,
  CreateQuizDto,
  AutoGenerateQuizDto,
  SubmitAnswerDto,
  StartAttemptDto,
} from './dto/quiz.dto';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../common/types';

@Controller('api/quizzes')
export class QuizController {
  constructor(private quizService: QuizService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(CreateQuizSchema))
  createQuiz(@CurrentUser() user: JwtPayload, @Body() dto: CreateQuizDto) {
    return this.quizService.createQuiz(user.sub, dto);
  }

  @Post('generate')
  @UsePipes(new ZodValidationPipe(AutoGenerateQuizSchema))
  autoGenerate(@CurrentUser() user: JwtPayload, @Body() dto: AutoGenerateQuizDto) {
    return this.quizService.autoGenerateQuiz(user.sub, dto);
  }

  @Get()
  getQuizzes(
    @CurrentUser() user: JwtPayload,
    @Query('subject_id') subjectId?: string,
  ) {
    return this.quizService.getQuizzes(user.sub, subjectId);
  }

  @Get(':id')
  getQuiz(@Param('id') id: string) {
    return this.quizService.getQuiz(id);
  }

  @Post('attempts')
  @UsePipes(new ZodValidationPipe(StartAttemptSchema))
  startAttempt(@CurrentUser() user: JwtPayload, @Body() dto: StartAttemptDto) {
    return this.quizService.startAttempt(user.sub, dto);
  }

  @Post('attempts/:id/answer')
  @UsePipes(new ZodValidationPipe(SubmitAnswerSchema))
  submitAnswer(
    @CurrentUser() user: JwtPayload,
    @Param('id') attemptId: string,
    @Body() dto: SubmitAnswerDto,
  ) {
    return this.quizService.submitAnswer(user.sub, attemptId, dto);
  }

  @Post('attempts/:id/submit')
  submitAttempt(@CurrentUser() user: JwtPayload, @Param('id') attemptId: string) {
    return this.quizService.submitAttempt(user.sub, attemptId);
  }

  @Get('attempts')
  getAttemptHistory(@CurrentUser() user: JwtPayload) {
    return this.quizService.getAttemptHistory(user.sub);
  }

  @Get('attempts/:id')
  getAttempt(@CurrentUser() user: JwtPayload, @Param('id') attemptId: string) {
    return this.quizService.getAttempt(attemptId, user.sub);
  }
}
