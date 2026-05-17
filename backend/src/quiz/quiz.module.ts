import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';

import { SupabaseService } from '../supabase/supabase.service';
import { IBMBoBService } from './ibm-bob.service';

@Module({
  imports: [ConfigModule],

  controllers: [QuizController],

  providers: [
    QuizService,
    SupabaseService,
    IBMBoBService,
  ],

  exports: [QuizService],
})
export class QuizModule { }