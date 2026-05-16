import { Module } from '@nestjs/common';
import { TextbooksController, FilesController } from './textbooks.controller';
import { TextbooksService } from './textbooks.service';

@Module({
  controllers: [TextbooksController, FilesController],
  providers: [TextbooksService],
})
export class TextbooksModule {}
