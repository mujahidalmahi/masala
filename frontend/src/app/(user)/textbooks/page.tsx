'use client';

import { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { BookOpen, Upload, Trash2, FileText, Loader2, TrendingUp, Download, ExternalLink } from 'lucide-react';
import { textbooksApi, curriculumApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

const fileTypeIcons: Record<string, string> = {
  pdf: '📄',
  epub: '📖',
  txt: '📝',
  doc: '📃',
  image: '🖼️',
};

function formatFileSize(bytes: number): string {
  if (!bytes || bytes === 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function TextbooksPage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('');

  const { data: textbooks, isLoading, error } = useQuery({
    queryKey: ['textbooks'],
    queryFn: async () => {
      const res = await textbooksApi.getAll();
      const payload = res.data.data || res.data;
      return Array.isArray(payload) ? payload : [];
    },
  });

  const { data: subjects } = useQuery({
    queryKey: ['textbook-subjects'],
    queryFn: async () => {
      const res = await curriculumApi.getSubjects();
      const payload = res.data.data || res.data;
      return Array.isArray(payload) ? payload : [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => textbooksApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['textbooks'] });
      toast.success('Textbook deleted');
    },
    onError: () => toast.error('Failed to delete textbook'),
  });

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', file.name.replace(/\.[^/.]+$/, ''));
      if (selectedSubject) formData.append('subject_id', selectedSubject);
      await textbooksApi.upload(formData);
      queryClient.invalidateQueries({ queryKey: ['textbooks'] });
      toast.success('Textbook uploaded!');
      setSelectedSubject('');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to upload textbook';
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  if (isLoading) return <TextbooksSkeleton />;
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <TrendingUp className="h-10 w-10" />
          <p>Failed to load textbooks. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Textbooks</h1>
          <p className="text-muted-foreground mt-1">Upload and manage your textbooks.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {subjects && subjects.length > 0 && (
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="h-10 w-40 bg-muted border-border text-xs">
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border text-foreground">
                {subjects.map((s: any) => (
                  <SelectItem key={s.id} value={s.id} className="text-xs">{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleUpload}
            accept=".pdf,.epub,.txt,.doc,.docx,.png,.jpg,.jpeg,.webp"
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="gap-2 w-full sm:w-auto"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {uploading ? 'Uploading...' : 'Upload Textbook'}
          </Button>
        </div>
      </div>

      {textbooks && textbooks.length > 0 ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        >
          {textbooks.map((textbook: any) => (
            <motion.div key={textbook.id} variants={itemVariants}>
              <Card className="bg-card border-border h-full flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0 text-xl">
                      {fileTypeIcons[textbook.file_type] || '📄'}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => deleteMutation.mutate(textbook.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardTitle className="text-base text-foreground mt-2 truncate">{textbook.title}</CardTitle>
                  {textbook.author && (
                    <p className="text-xs text-muted-foreground">by {textbook.author}</p>
                  )}
                  {textbook.subjects?.name && (
                    <p className="text-xs text-muted-foreground">{textbook.subjects.name}</p>
                  )}
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-end">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                    <span>{formatFileSize(textbook.file_size)}</span>
                    <span>{textbook.created_at ? formatDate(textbook.created_at) : ''}</span>
                  </div>
                  {textbook.file_url && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-1.5 text-xs h-8"
                        onClick={() => window.open(textbook.file_url, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3" /> View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-1.5 text-xs h-8"
                        onClick={() => {
                          const a = document.createElement('a');
                          a.href = textbook.file_url;
                          a.download = textbook.title;
                          a.click();
                        }}
                      >
                        <Download className="h-3 w-3" /> Download
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <Card className="bg-card border-border">
          <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <BookOpen className="h-10 w-10 mb-3" />
            <p className="text-lg font-medium">No textbooks yet</p>
            <p className="text-sm mt-1">Upload your textbooks to access them anytime.</p>
            <Button
              className="mt-4 gap-2"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Upload className="h-4 w-4" />
              Upload Textbook
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function TextbooksSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <div>
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-5 w-48 mt-2" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="bg-card border-border">
            <CardHeader>
              <Skeleton className="h-10 w-10 rounded-lg" />
              <Skeleton className="h-5 w-32 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-3 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
