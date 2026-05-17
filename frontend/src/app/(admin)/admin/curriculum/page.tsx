'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, BookOpen, Book, FileText } from 'lucide-react';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { adminApi, curriculumApi } from '@/lib/api';
import { Subject, Chapter, Topic } from '@/types';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

export default function AdminCurriculum() {
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('subjects');

  const [subjectDialog, setSubjectDialog] = useState<{ open: boolean; edit?: Subject }>({ open: false });
  const [subjectForm, setSubjectForm] = useState({ name: '', description: '', icon: '', color: '#6366f1', grade_id: '' });

  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [chapterDialog, setChapterDialog] = useState<{ open: boolean; edit?: Chapter }>({ open: false });
  const [chapterForm, setChapterForm] = useState({ name: '', description: '', display_order: 1, grade_id: '' });

  const [selectedChapterId, setSelectedChapterId] = useState('');
  const [topicDialog, setTopicDialog] = useState<{ open: boolean; edit?: Topic }>({ open: false });
  const [topicForm, setTopicForm] = useState({ name: '', content_summary: '', display_order: 1 });

  const { data: gradesData } = useQuery({
    queryKey: ['curriculum-grades'],
    queryFn: async () => { const r = await curriculumApi.getGrades(); return r.data.data || r.data; },
  });
  const grades: any[] = Array.isArray(gradesData) ? gradesData : [];
  const gradeMap = Object.fromEntries(grades.map((g: any) => [g.id, g.name || g.grade_name || g.level]));

  const { data: subjectsData, isLoading: subjectsLoading } = useQuery({
    queryKey: ['admin-subjects'],
    queryFn: async () => { const r = await curriculumApi.getSubjects(); return r.data.data || r.data; },
  });
  const subjects: Subject[] = Array.isArray(subjectsData) ? subjectsData : [];

  const { data: chaptersData, isLoading: chaptersLoading } = useQuery({
    queryKey: ['admin-chapters', selectedSubjectId],
    queryFn: async () => { const r = await curriculumApi.getChapters(selectedSubjectId); return r.data.data || r.data; },
    enabled: !!selectedSubjectId,
  });
  const chapters: Chapter[] = Array.isArray(chaptersData) ? chaptersData : [];

  const { data: topicsData, isLoading: topicsLoading } = useQuery({
    queryKey: ['admin-topics', selectedChapterId],
    queryFn: async () => { const r = await curriculumApi.getTopics(selectedChapterId); return r.data.data || r.data; },
    enabled: !!selectedChapterId,
  });
  const topics: Topic[] = Array.isArray(topicsData) ? topicsData : [];

  const createSubject = useMutation({
    mutationFn: () => adminApi.createSubject(subjectForm),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-subjects'] }); toast.success('Subject created'); setSubjectDialog({ open: false }); },
    onError: () => toast.error('Failed to create subject'),
  });
  const updateSubject = useMutation({
    mutationFn: () => adminApi.updateSubject(subjectDialog.edit!.id, subjectForm),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-subjects'] }); toast.success('Subject updated'); setSubjectDialog({ open: false }); },
    onError: () => toast.error('Failed to update subject'),
  });
  const deleteSubject = useMutation({
    mutationFn: (id: string) => adminApi.deleteSubject(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-subjects'] }); toast.success('Subject deleted'); },
    onError: () => toast.error('Failed to delete subject'),
  });

  const createChapter = useMutation({
    mutationFn: () => adminApi.createChapter({ ...chapterForm, subject_id: selectedSubjectId }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-chapters'] }); toast.success('Chapter created'); setChapterDialog({ open: false }); },
    onError: () => toast.error('Failed to create chapter'),
  });
  const updateChapter = useMutation({
    mutationFn: () => adminApi.updateChapter(chapterDialog.edit!.id, chapterForm),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-chapters'] }); toast.success('Chapter updated'); setChapterDialog({ open: false }); },
    onError: () => toast.error('Failed to update chapter'),
  });

  const createTopic = useMutation({
    mutationFn: () => adminApi.createTopic({ ...topicForm, chapter_id: selectedChapterId }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-topics'] }); toast.success('Topic created'); setTopicDialog({ open: false }); },
    onError: () => toast.error('Failed to create topic'),
  });
  const updateTopic = useMutation({
    mutationFn: () => adminApi.updateTopic(topicDialog.edit!.id, topicForm),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-topics'] }); toast.success('Topic updated'); setTopicDialog({ open: false }); },
    onError: () => toast.error('Failed to update topic'),
  });

  const openSubjectDialog = (subject?: Subject) => {
    if (subject) {
      setSubjectForm({ name: subject.name, description: subject.description ?? '', icon: subject.icon ?? '', color: subject.color ?? '#6366f1', grade_id: '' });
      setSubjectDialog({ open: true, edit: subject });
    } else {
      setSubjectForm({ name: '', description: '', icon: '', color: '#6366f1', grade_id: '' });
      setSubjectDialog({ open: true });
    }
  };

  const openChapterDialog = (chapter?: Chapter) => {
    if (chapter) {
      setChapterForm({ name: chapter.name, description: chapter.description ?? '', display_order: chapter.display_order, grade_id: chapter.grade_id });
      setChapterDialog({ open: true, edit: chapter });
    } else {
      setChapterForm({ name: '', description: '', display_order: chapters.length + 1, grade_id: '' });
      setChapterDialog({ open: true });
    }
  };

  const openTopicDialog = (topic?: Topic) => {
    if (topic) {
      setTopicForm({ name: topic.name, content_summary: topic.content_summary ?? '', display_order: topic.display_order });
      setTopicDialog({ open: true, edit: topic });
    } else {
      setTopicForm({ name: '', content_summary: '', display_order: topics.length + 1 });
      setTopicDialog({ open: true });
    }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={{ hidden: {}, show: {} }}>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Curriculum</h1>
        <p className="text-muted-foreground mt-1">Manage subjects, chapters, and topics</p>
      </motion.div>

      <motion.div variants={{ hidden: {}, show: {} }}>
        <Card className="bg-card border-border">
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="px-6 pt-4">
                <TabsList className="bg-muted inline-flex w-full sm:w-auto overflow-x-auto">
                  <TabsTrigger value="subjects" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">Subjects</TabsTrigger>
                  <TabsTrigger value="chapters" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">Chapters</TabsTrigger>
                  <TabsTrigger value="topics" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">Topics</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="subjects" className="p-6 pt-4">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-muted-foreground">{subjects.length} subjects</p>
                  <Button size="sm" onClick={() => openSubjectDialog()}>
                    <Plus className="w-4 h-4 mr-1" /> Add Subject
                  </Button>
                </div>
                {subjectsLoading ? (
                  <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full bg-muted" />)}</div>
                ) : subjects.length === 0 ? (
                  <p className="text-muted-foreground text-sm py-8 text-center">No subjects yet</p>
                ) : (
                  <div className="space-y-2">
                    {subjects.map((subject) => (
                      <div key={subject.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: subject.color || '#6366f1', opacity: 0.2 }}>
                            <BookOpen className="w-4 h-4" style={{ color: subject.color || '#6366f1' }} />
                          </div>
                          <div>
                            <p className="text-foreground font-medium text-sm">{subject.name}</p>
                            {subject.description && <p className="text-muted-foreground text-xs">{subject.description}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => openSubjectDialog(subject)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => deleteSubject.mutate(subject.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="chapters" className="p-6 pt-4">
                <div className="mb-4">
                  <Label className="text-muted-foreground mb-2 block">Select Subject</Label>
                  <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
                    <SelectTrigger className="bg-muted border-border text-foreground w-72">
                      <SelectValue placeholder="Choose a subject..." />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border text-foreground">
                      {subjects.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedSubjectId ? (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm text-muted-foreground">{chapters.length} chapters</p>
                      <Button size="sm" onClick={() => openChapterDialog()}>
                        <Plus className="w-4 h-4 mr-1" /> Add Chapter
                      </Button>
                    </div>
                    {chaptersLoading ? (
                      <div className="space-y-3">{[1, 2].map((i) => <Skeleton key={i} className="h-16 w-full bg-muted" />)}</div>
                    ) : chapters.length === 0 ? (
                      <p className="text-muted-foreground text-sm py-8 text-center">No chapters for this subject</p>
                    ) : (
                      <div className="space-y-2">
                        {chapters.map((chapter) => (
                          <div key={chapter.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                <Book className="w-4 h-4 text-blue-500" />
                              </div>
                              <div>
                                <p className="text-foreground font-medium text-sm">{chapter.name}</p>
                                <p className="text-muted-foreground text-xs">Order: {chapter.display_order}{chapter.description ? ` — ${chapter.description}` : ''}</p>
                              </div>
                              <Badge variant="outline" className="text-xs bg-muted/50">{gradeMap[chapter.grade_id] || 'Unknown'}</Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => openChapterDialog(chapter)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-muted-foreground text-sm py-8 text-center">Select a subject to view chapters</p>
                )}
              </TabsContent>

              <TabsContent value="topics" className="p-6 pt-4">
                <div className="mb-4 space-y-3">
                  <div>
                    <Label className="text-muted-foreground mb-2 block">Select Subject</Label>
                    <Select value={selectedSubjectId} onValueChange={(v) => { setSelectedSubjectId(v); setSelectedChapterId(''); }}>
                      <SelectTrigger className="bg-muted border-border text-foreground w-72">
                        <SelectValue placeholder="Choose a subject..." />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border text-foreground">
                        {subjects.map((s) => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {selectedSubjectId && (
                    <div>
                      <Label className="text-muted-foreground mb-2 block">Select Chapter</Label>
                      <Select value={selectedChapterId} onValueChange={setSelectedChapterId}>
                        <SelectTrigger className="bg-muted border-border text-foreground w-72">
                          <SelectValue placeholder="Choose a chapter..." />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border text-foreground">
                          {chapters.map((c) => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                {selectedChapterId ? (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm text-muted-foreground">{topics.length} topics</p>
                      <Button size="sm" onClick={() => openTopicDialog()}>
                        <Plus className="w-4 h-4 mr-1" /> Add Topic
                      </Button>
                    </div>
                    {topicsLoading ? (
                      <div className="space-y-3">{[1, 2].map((i) => <Skeleton key={i} className="h-16 w-full bg-muted" />)}</div>
                    ) : topics.length === 0 ? (
                      <p className="text-muted-foreground text-sm py-8 text-center">No topics for this chapter</p>
                    ) : (
                      <div className="space-y-2">
                        {topics.map((topic) => (
                          <div key={topic.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                                <FileText className="w-4 h-4 text-violet-500" />
                              </div>
                              <div>
                                <p className="text-foreground font-medium text-sm">{topic.name}</p>
                                <p className="text-muted-foreground text-xs">Order: {topic.display_order}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => openTopicDialog(topic)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-muted-foreground text-sm py-8 text-center">Select a subject and chapter to view topics</p>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={subjectDialog.open} onOpenChange={(o) => !o && setSubjectDialog({ open: false })}>
        <DialogContent className="bg-card border-border text-foreground p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>{subjectDialog.edit ? 'Edit Subject' : 'Add Subject'}</DialogTitle>
            <DialogDescription className="text-muted-foreground">Configure subject details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={subjectForm.name} onChange={(e) => setSubjectForm((f) => ({ ...f, name: e.target.value }))} className="bg-muted border-border text-foreground placeholder:text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={subjectForm.description} onChange={(e) => setSubjectForm((f) => ({ ...f, description: e.target.value }))} className="bg-muted border-border text-foreground placeholder:text-muted-foreground" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label>Icon (emoji)</Label>
                <Input value={subjectForm.icon} onChange={(e) => setSubjectForm((f) => ({ ...f, icon: e.target.value }))} className="bg-muted border-border text-foreground placeholder:text-muted-foreground" placeholder="🔬" />
              </div>
              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex gap-2">
                  <Input type="color" value={subjectForm.color} onChange={(e) => setSubjectForm((f) => ({ ...f, color: e.target.value }))} className="w-12 h-10 p-1 bg-muted border-border" />
                  <Input value={subjectForm.color} onChange={(e) => setSubjectForm((f) => ({ ...f, color: e.target.value }))} className="bg-muted border-border text-foreground flex-1" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Grade</Label>
              <Select value={subjectForm.grade_id} onValueChange={(v) => setSubjectForm((f) => ({ ...f, grade_id: v }))}>
                <SelectTrigger className="bg-muted border-border text-foreground">
                  <SelectValue placeholder="Select grade..." />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground">
                  {grades.map((g: any) => (
                    <SelectItem key={g.id} value={g.id}>{g.name || g.grade_name || g.level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubjectDialog({ open: false })}>Cancel</Button>
            <Button onClick={() => (subjectDialog.edit ? updateSubject : createSubject).mutate()} disabled={createSubject.isPending || updateSubject.isPending}>
              {subjectDialog.edit ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={chapterDialog.open} onOpenChange={(o) => !o && setChapterDialog({ open: false })}>
        <DialogContent className="bg-card border-border text-foreground p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>{chapterDialog.edit ? 'Edit Chapter' : 'Add Chapter'}</DialogTitle>
            <DialogDescription className="text-muted-foreground">Configure chapter details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={chapterForm.name} onChange={(e) => setChapterForm((f) => ({ ...f, name: e.target.value }))} className="bg-muted border-border text-foreground placeholder:text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={chapterForm.description} onChange={(e) => setChapterForm((f) => ({ ...f, description: e.target.value }))} className="bg-muted border-border text-foreground placeholder:text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <Label>Display Order</Label>
              <Input type="number" value={chapterForm.display_order} onChange={(e) => setChapterForm((f) => ({ ...f, display_order: parseInt(e.target.value) || 1 }))} className="bg-muted border-border text-foreground placeholder:text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <Label>Grade</Label>
              <Select value={chapterForm.grade_id} onValueChange={(v) => setChapterForm((f) => ({ ...f, grade_id: v }))}>
                <SelectTrigger className="bg-muted border-border text-foreground">
                  <SelectValue placeholder="Select grade..." />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground">
                  {grades.map((g: any) => (
                    <SelectItem key={g.id} value={g.id}>{g.name || g.grade_name || g.level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChapterDialog({ open: false })}>Cancel</Button>
            <Button onClick={() => (chapterDialog.edit ? updateChapter : createChapter).mutate()} disabled={createChapter.isPending || updateChapter.isPending}>
              {chapterDialog.edit ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={topicDialog.open} onOpenChange={(o) => !o && setTopicDialog({ open: false })}>
        <DialogContent className="bg-card border-border text-foreground p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>{topicDialog.edit ? 'Edit Topic' : 'Add Topic'}</DialogTitle>
            <DialogDescription className="text-muted-foreground">Configure topic details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={topicForm.name} onChange={(e) => setTopicForm((f) => ({ ...f, name: e.target.value }))} className="bg-muted border-border text-foreground placeholder:text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <Label>Content Summary</Label>
              <Textarea value={topicForm.content_summary} onChange={(e) => setTopicForm((f) => ({ ...f, content_summary: e.target.value }))} className="bg-muted border-border text-foreground placeholder:text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <Label>Display Order</Label>
              <Input type="number" value={topicForm.display_order} onChange={(e) => setTopicForm((f) => ({ ...f, display_order: parseInt(e.target.value) || 1 }))} className="bg-muted border-border text-foreground placeholder:text-muted-foreground" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTopicDialog({ open: false })}>Cancel</Button>
            <Button onClick={() => (topicDialog.edit ? updateTopic : createTopic).mutate()} disabled={createTopic.isPending || updateTopic.isPending}>
              {topicDialog.edit ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
