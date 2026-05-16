import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../supabase/supabase.service';
import { UploadTextbookDto } from './dto/textbook.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class TextbooksService {
  constructor(
    private supabase: SupabaseService,
    private configService: ConfigService,
  ) {}

  async uploadTextbook(userId: string, dto: UploadTextbookDto, file?: Express.Multer.File) {
    let fileUrl: string | null = null;
    const title = dto.title || file?.originalname || 'Untitled';
    const mimeMap: Record<string, string> = {
      'application/pdf': 'pdf',
      'application/epub+zip': 'epub',
      'text/plain': 'txt',
      'application/msword': 'doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'doc',
      'image/png': 'image',
      'image/jpeg': 'image',
      'image/webp': 'image',
    };
    const file_type = dto.file_type || (file ? mimeMap[file.mimetype] : null) || 'pdf';

    if (file) {
      const fileName = `${userId}/${Date.now()}-${file.originalname}`;
      const { data: uploadData, error: uploadError } = await this.supabase
        .storage()
        .from('textbooks')
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (uploadError) throw new BadRequestException(`Upload failed: ${uploadError.message}`);

      const { data: urlData } = await this.supabase
        .storage()
        .from('textbooks')
        .getPublicUrl(fileName);

      fileUrl = urlData?.publicUrl || null;
    }

    const { data, error } = await this.supabase
      .from('textbooks')
      .insert({
        user_id: userId,
        subject_id: dto.subject_id || null,
        title,
        author: dto.author || null,
        file_url: fileUrl,
        file_type,
        status: 'processing',
      })
      .select()
      .single();

    if (error) throw new BadRequestException('Failed to create textbook entry');
    return data;
  }

  async getUserTextbooks(userId: string) {
    const { data } = await this.supabase
      .from('textbooks')
      .select('*, subjects(name)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return data || [];
  }

  async deleteTextbook(userId: string, textbookId: string) {
    const { data: textbook } = await this.supabase
      .from('textbooks')
      .select('*')
      .eq('id', textbookId)
      .eq('user_id', userId)
      .single();

    if (!textbook) throw new NotFoundException('Textbook not found');

    if (textbook.file_url) {
      const filePath = textbook.file_url.split('/').slice(-2).join('/');
      await this.supabase.storage().from('textbooks').remove([filePath]);
    }

    const { error } = await this.supabase.from('textbooks').delete().eq('id', textbookId);

    if (error) throw new NotFoundException('Failed to delete textbook');
    return { message: 'Textbook deleted' };
  }

  async uploadFile(userId: string, file: Express.Multer.File, metadata: Record<string, any>) {
    const fileName = `${userId}/uploads/${Date.now()}-${file.originalname}`;
    const { data: uploadData, error: uploadError } = await this.supabase
      .storage()
      .from('uploads')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (uploadError) throw new BadRequestException(`Upload failed: ${uploadError.message}`);

    const { data: urlData } = await this.supabase.storage().from('uploads').getPublicUrl(fileName);

    const { data, error } = await this.supabase
      .from('uploaded_files')
      .insert({
        user_id: userId,
        subject_id: metadata.subject_id || null,
        chapter_id: metadata.chapter_id || null,
        topic_id: metadata.topic_id || null,
        file_name: file.originalname,
        file_url: urlData?.publicUrl || '',
        file_type: file.mimetype,
        file_size: file.size,
        file_category: metadata.file_category || 'note',
      })
      .select()
      .single();

    if (error) throw new BadRequestException('Failed to save file metadata');
    return data;
  }

  async getUserFiles(userId: string) {
    const { data } = await this.supabase
      .from('uploaded_files')
      .select('*, subjects(name), chapters(name), topics(name)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return data || [];
  }

  async deleteFile(userId: string, fileId: string) {
    const { data: file } = await this.supabase
      .from('uploaded_files')
      .select('*')
      .eq('id', fileId)
      .eq('user_id', userId)
      .single();

    if (!file) throw new NotFoundException('File not found');

    await this.supabase
      .storage()
      .from('uploads')
      .remove([file.file_url.split('/').slice(-2).join('/')]);

    await this.supabase.from('uploaded_files').delete().eq('id', fileId);
    return { message: 'File deleted' };
  }
}
