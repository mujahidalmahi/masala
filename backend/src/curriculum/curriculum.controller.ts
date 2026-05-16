import { Controller, Get, Param, Query } from '@nestjs/common';
import { CurriculumService } from './curriculum.service';

@Controller('api/curriculum')
export class CurriculumController {
  constructor(private curriculumService: CurriculumService) {}

  @Get('countries')
  getCountries() {
    return this.curriculumService.getCountries();
  }

  @Get('boards')
  getBoards(@Query('country_id') countryId?: string) {
    return this.curriculumService.getBoards(countryId);
  }

  @Get('grades')
  getGrades(@Query('board_id') boardId?: string) {
    return this.curriculumService.getGrades(boardId);
  }

  @Get('subjects')
  getSubjects(@Query('grade_id') gradeId?: string) {
    return this.curriculumService.getSubjects(gradeId);
  }

  @Get('chapters')
  getChapters(@Query('subject_id') subjectId: string, @Query('grade_id') gradeId?: string) {
    return this.curriculumService.getChapters(subjectId, gradeId);
  }

  @Get('topics/:chapterId')
  getTopics(@Param('chapterId') chapterId: string) {
    return this.curriculumService.getTopics(chapterId);
  }

  @Get('outcomes/:topicId')
  getLearningOutcomes(@Param('topicId') topicId: string) {
    return this.curriculumService.getLearningOutcomes(topicId);
  }

  @Get('tree/:subjectId/:gradeId')
  getFullTree(@Param('subjectId') subjectId: string, @Param('gradeId') gradeId: string) {
    return this.curriculumService.getFullSubjectTree(subjectId, gradeId);
  }
}
