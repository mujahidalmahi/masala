import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  UsePipes,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TextbooksService } from './textbooks.service';
import { UploadTextbookSchema, UploadFileSchema } from './dto/textbook.dto';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../common/types';

@Controller('api/textbooks')
export class TextbooksController {
  constructor(private textbooksService: TextbooksService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadTextbook(
    @CurrentUser() user: JwtPayload,
    @Body(new ZodValidationPipe(UploadTextbookSchema)) body: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.textbooksService.uploadTextbook(user.sub, body, file);
  }

  @Get()
  getUserTextbooks(@CurrentUser() user: JwtPayload) {
    return this.textbooksService.getUserTextbooks(user.sub);
  }

  @Delete(':id')
  deleteTextbook(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.textbooksService.deleteTextbook(user.sub, id);
  }
}

@Controller('api/files')
export class FilesController {
  constructor(private textbooksService: TextbooksService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @CurrentUser() user: JwtPayload,
    @UploadedFile() file: Express.Multer.File,
    @Body() metadata: any,
  ) {
    const parsed = UploadFileSchema.parse(metadata);
    return this.textbooksService.uploadFile(user.sub, file, parsed);
  }

  @Get()
  getUserFiles(@CurrentUser() user: JwtPayload) {
    return this.textbooksService.getUserFiles(user.sub);
  }

  @Delete(':id')
  deleteFile(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.textbooksService.deleteFile(user.sub, id);
  }
}
