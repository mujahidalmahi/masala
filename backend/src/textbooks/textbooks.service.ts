import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class TextbooksService {
  constructor(private supabase: SupabaseService) {}

  async uploadTextbook(userId: string, body: any, file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file provided');

    const allowedMimes = [
      'application/pdf',
      'application/epub+zip',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/png',
      'image/jpeg',
      'image/webp',
    ];

    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException(`Unsupported file type: ${file.mimetype}`);
    }

    if (file.size > 50 * 1024 * 1024) {
      throw new BadRequestException('File size exceeds 50MB limit');
    }

    const title = body.title || file.originalname.replace(/\.[^/.]+$/, '') || 'Untitled';
    const author = body.author || null;
    let subjectId = body.subject_id || null;

    if (!subjectId) {
      const { data: defaultSubject } = await this.supabase
        .from('subjects')
        .select('id')
        .limit(1)
        .single();
      subjectId = defaultSubject?.id || null;
    }

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
    const fileType = mimeMap[file.mimetype] || 'pdf';

    const fileName = `${userId}/${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;

    const { error: uploadError } = await this.supabase
      .storage()
      .from('textbooks')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (uploadError) throw new BadRequestException(`Upload failed: ${uploadError.message}`);

    const { data, error } = await this.supabase
      .from('textbooks')
      .insert({
        user_id: userId,
        subject_id: subjectId,
        title,
        author,
        file_url: fileName,
        file_type: fileType,
        status: 'ready',
        extracted_data: { file_size: file.size, original_name: file.originalname },
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

    const textbooks = data || [];

    const withUrls = await Promise.all(
      textbooks.map(async (book) => {
        const filePath = book.file_url;
        if (filePath && !filePath.startsWith('http')) {
          const { data: signedUrlData } = await this.supabase
            .storage()
            .from('textbooks')
            .createSignedUrl(filePath, 60 * 60 * 24);
          return {
            ...book,
            file_url: signedUrlData?.signedUrl || null,
            file_size: book.extracted_data?.file_size || 0,
          };
        }
        return {
          ...book,
          file_url: filePath || null,
          file_size: book.extracted_data?.file_size || 0,
        };
      }),
    );

    return withUrls;
  }

  async deleteTextbook(userId: string, textbookId: string) {
    const { data: textbook } = await this.supabase
      .from('textbooks')
      .select('*')
      .eq('id', textbookId)
      .eq('user_id', userId)
      .single();

    if (!textbook) throw new NotFoundException('Textbook not found');

    const filePath = textbook.file_url;
    if (filePath && !filePath.startsWith('http')) {
      await this.supabase.storage().from('textbooks').remove([filePath]);
    } else if (filePath && filePath.startsWith('http')) {
      const parts = filePath.split('/');
      const objectPath = parts.slice(parts.indexOf('object') + 2).join('/').split('?')[0];
      if (objectPath) {
        await this.supabase.storage().from('textbooks').remove([decodeURIComponent(objectPath)]);
      }
    }

    const { error } = await this.supabase
      .from('textbooks')
      .delete()
      .eq('id', textbookId);

    if (error) throw new NotFoundException('Failed to delete textbook');
    return { message: 'Textbook deleted' };
  }

  async uploadFile(userId: string, file: Express.Multer.File, metadata: Record<string, any>) {
    const fileName = `${userId}/uploads/${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;

    const { error: uploadError } = await this.supabase
      .storage()
      .from('uploads')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (uploadError) throw new BadRequestException(`Upload failed: ${uploadError.message}`);

    const { data, error } = await this.supabase
      .from('uploaded_files')
      .insert({
        user_id: userId,
        subject_id: metadata.subject_id || null,
        chapter_id: metadata.chapter_id || null,
        topic_id: metadata.topic_id || null,
        file_name: file.originalname,
        file_url: fileName,
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

    const files = data || [];

    const withUrls = await Promise.all(
      files.map(async (file) => {
        const filePath = file.file_url;
        if (filePath && !filePath.startsWith('http')) {
          const { data: signedUrlData } = await this.supabase
            .storage()
            .from('uploads')
            .createSignedUrl(filePath, 60 * 60 * 24);
          return { ...file, file_url: signedUrlData?.signedUrl || null };
        }
        return { ...file, file_url: filePath || null };
      }),
    );

    return withUrls;
  }

  async deleteFile(userId: string, fileId: string) {
    const { data: file } = await this.supabase
      .from('uploaded_files')
      .select('*')
      .eq('id', fileId)
      .eq('user_id', userId)
      .single();

    if (!file) throw new NotFoundException('File not found');

    const filePath = file.file_url;
    if (filePath && !filePath.startsWith('http')) {
      await this.supabase.storage().from('uploads').remove([filePath]);
    }

    await this.supabase.from('uploaded_files').delete().eq('id', fileId);
    return { message: 'File deleted' };
  }
}
