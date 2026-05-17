import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
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
  constructor(private quizService: QuizService) { }

  @Post()
  createQuiz(@CurrentUser() user: JwtPayload, @Body(new ZodValidationPipe(CreateQuizSchema)) dto: CreateQuizDto) {
    return this.quizService.createQuiz(user.sub, dto);
  }

  @Post('generate')
  autoGenerate(@CurrentUser() user: JwtPayload, @Body(new ZodValidationPipe(AutoGenerateQuizSchema)) dto: AutoGenerateQuizDto) {
    return this.quizService.autoGenerateQuiz(user.sub, dto);
  }

  @Get()
  getQuizzes(
    @CurrentUser() user: JwtPayload,
    @Query('subject_id') subjectId?: string,
  ) {
    return this.quizService.getQuizzes(user.sub, subjectId);
  }

  // Static routes MUST come before @Get(':id') to avoid NestJS matching 'attempts' as :id
  @Get('attempts')
  getAttemptHistory(@CurrentUser() user: JwtPayload) {
    return this.quizService.getAttemptHistory(user.sub);
  }

  @Get('attempts/:id')
  getAttempt(@CurrentUser() user: JwtPayload, @Param('id') attemptId: string) {
    return this.quizService.getAttempt(attemptId, user.sub);
  }

  @Get(':id')
  getQuiz(@Param('id') id: string) {
    return this.quizService.getQuiz(id);
  }

  @Post('attempts')
  startAttempt(@CurrentUser() user: JwtPayload, @Body(new ZodValidationPipe(StartAttemptSchema)) dto: StartAttemptDto) {
    return this.quizService.startAttempt(user.sub, dto);
  }

  @Post('attempts/:id/answer')
  submitAnswer(
    @CurrentUser() user: JwtPayload,
    @Param('id') attemptId: string,
    @Body(new ZodValidationPipe(SubmitAnswerSchema)) dto: SubmitAnswerDto,
  ) {
    return this.quizService.submitAnswer(user.sub, attemptId, dto);
  }

  @Post('attempts/:id/submit')
  submitAttempt(@CurrentUser() user: JwtPayload, @Param('id') attemptId: string) {
    return this.quizService.submitAttempt(user.sub, attemptId);
  }
}