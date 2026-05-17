import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TextbooksService } from './textbooks.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../common/types';

const MAX_FILE_SIZE = 50 * 1024 * 1024;

const textbookFileFilter = (_req: any, file: Express.Multer.File, cb: (error: Error | null, acceptFile: boolean) => void) => {
  const allowed = [
    'application/pdf',
    'application/epub+zip',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/png',
    'image/jpeg',
    'image/webp',
  ];
  if (allowed.includes(file.mimetype)) return cb(null, true);
  cb(new BadRequestException(`Unsupported file type: ${file.mimetype}`), false);
};

const uploadFileFilter = (_req: any, file: Express.Multer.File, cb: (error: Error | null, acceptFile: boolean) => void) => {
  const allowed = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp', 'text/plain'];
  if (allowed.includes(file.mimetype)) return cb(null, true);
  cb(new BadRequestException(`Unsupported file type: ${file.mimetype}`), false);
};

@Controller('api/textbooks')
export class TextbooksController {
  constructor(private textbooksService: TextbooksService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_FILE_SIZE }, fileFilter: textbookFileFilter }))
  async uploadTextbook(
    @CurrentUser() user: JwtPayload,
    @Body() body: any,
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
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_FILE_SIZE }, fileFilter: uploadFileFilter }))
  async uploadFile(
    @CurrentUser() user: JwtPayload,
    @UploadedFile() file: Express.Multer.File,
    @Body() metadata: any,
  ) {
    return this.textbooksService.uploadFile(user.sub, file, metadata);
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
