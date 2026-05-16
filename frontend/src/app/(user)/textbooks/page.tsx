'use client';

import { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { BookOpen, Upload, Trash2, FileText, Loader2, TrendingUp } from 'lucide-react';
import { textbooksApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
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

export default function TextbooksPage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const { data: textbooks, isLoading, error } = useQuery({
    queryKey: ['textbooks'],
    queryFn: async () => {
      const res = await textbooksApi.getAll();
      return res.data;
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
      await textbooksApi.upload(formData);
      queryClient.invalidateQueries({ queryKey: ['textbooks'] });
      toast.success('Textbook uploaded!');
    } catch {
      toast.error('Failed to upload textbook');
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
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleUpload}
            accept=".pdf,.epub,.txt,.doc,.docx"
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
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <FileText className="h-5 w-5 text-blue-500" />
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
                  <CardTitle className="text-base text-foreground mt-2">{textbook.name || textbook.title}</CardTitle>
                  {textbook.author && (
                    <p className="text-xs text-muted-foreground">by {textbook.author}</p>
                  )}
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-end">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{textbook.file_size ? `${(textbook.file_size / 1024 / 1024).toFixed(1)} MB` : ''}</span>
                    <span>{textbook.created_at ? formatDate(textbook.created_at) : ''}</span>
                  </div>
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
