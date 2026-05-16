'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Award, Sparkles } from 'lucide-react';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { adminApi, gamificationApi } from '@/lib/api';
import { Badge as BadgeType } from '@/types';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const rarityVariant: Record<string, 'default' | 'secondary' | 'info' | 'warning' | 'success' | 'destructive' | 'outline'> = {
  common: 'default',
  uncommon: 'secondary',
  rare: 'info',
  epic: 'warning',
  legendary: 'success',
};

const defaultForm = { name: '', description: '', icon_url: '', badge_type: 'achievement', rarity: 'common', xp_reward: 100 };

export default function AdminBadges() {
  const queryClient = useQueryClient();
  const [dialog, setDialog] = useState<{ open: boolean; edit?: BadgeType }>({ open: false });
  const [form, setForm] = useState(defaultForm);

  const { data: badgesData, isLoading } = useQuery({
    queryKey: ['admin-badges'],
    queryFn: () => gamificationApi.getAllBadges().then((r) => r.data),
  });

  const badges: BadgeType[] = Array.isArray(badgesData) ? badgesData : (badgesData?.badges ?? []);

  const createMutation = useMutation({
    mutationFn: () => adminApi.createBadge(form),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-badges'] }); toast.success('Badge created'); setDialog({ open: false }); },
    onError: () => toast.error('Failed to create badge'),
  });

  const updateMutation = useMutation({
    mutationFn: () => adminApi.updateBadge(dialog.edit!.id, form),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-badges'] }); toast.success('Badge updated'); setDialog({ open: false }); },
    onError: () => toast.error('Failed to update badge'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteBadge(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-badges'] }); toast.success('Badge deleted'); },
    onError: () => toast.error('Failed to delete badge'),
  });

  const openDialog = (badge?: BadgeType) => {
    if (badge) {
      setForm({ name: badge.name, description: badge.description, icon_url: badge.icon_url ?? '', badge_type: badge.badge_type, rarity: badge.rarity, xp_reward: badge.xp_reward });
      setDialog({ open: true, edit: badge });
    } else {
      setForm(defaultForm);
      setDialog({ open: true });
    }
  };

  const rarityTier = { common: 1, uncommon: 2, rare: 3, epic: 4, legendary: 5 };

  const sorted = [...badges].sort(
    (a, b) => (rarityTier[b.rarity as keyof typeof rarityTier] || 0) - (rarityTier[a.rarity as keyof typeof rarityTier] || 0),
  );

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={{ hidden: {}, show: {} }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Badges</h1>
          <p className="text-muted-foreground mt-1">Create and manage achievement badges</p>
        </div>
        <Button onClick={() => openDialog()} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-1" /> Add Badge
        </Button>
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-40 bg-muted rounded-xl" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="py-12 text-center">
            <Award className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No badges yet. Create your first badge!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sorted.map((badge, idx) => (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
            >
              <Card className="bg-card border-border group hover:border-border transition-colors">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-secondary/50 text-muted-foreground">
                        {badge.icon_url ? <img src={badge.icon_url} alt="" className="w-8 h-8" /> : <Sparkles className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="text-foreground font-semibold">{badge.name}</p>
                        <p className="text-muted-foreground text-xs mt-0.5 line-clamp-2">{badge.description}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => openDialog(badge)}>
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => deleteMutation.mutate(badge.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <Badge variant={rarityVariant[badge.rarity] || 'outline'} className="text-[10px] px-2 py-0 capitalize">
                      {badge.rarity}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px] px-2 py-0 capitalize">
                      {badge.badge_type}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground ml-auto">+{badge.xp_reward} XP</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={dialog.open} onOpenChange={(o) => !o && setDialog({ open: false })}>
        <DialogContent className="bg-card border-border text-foreground p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>{dialog.edit ? 'Edit Badge' : 'Add Badge'}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {dialog.edit ? 'Update badge details' : 'Create a new achievement badge'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="bg-muted border-border text-foreground placeholder:text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <Label>Icon URL</Label>
                <Input value={form.icon_url} onChange={(e) => setForm((f) => ({ ...f, icon_url: e.target.value }))} className="bg-muted border-border text-foreground placeholder:text-muted-foreground" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="flex h-20 w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={form.badge_type} onValueChange={(v) => setForm((f) => ({ ...f, badge_type: v }))}>
                  <SelectTrigger className="bg-muted border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border text-foreground">
                    <SelectItem value="achievement">Achievement</SelectItem>
                    <SelectItem value="milestone">Milestone</SelectItem>
                    <SelectItem value="special">Special</SelectItem>
                    <SelectItem value="skill">Skill</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Rarity</Label>
                <Select value={form.rarity} onValueChange={(v) => setForm((f) => ({ ...f, rarity: v }))}>
                  <SelectTrigger className="bg-muted border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border text-foreground">
                    <SelectItem value="common">Common</SelectItem>
                    <SelectItem value="uncommon">Uncommon</SelectItem>
                    <SelectItem value="rare">Rare</SelectItem>
                    <SelectItem value="epic">Epic</SelectItem>
                    <SelectItem value="legendary">Legendary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>XP Reward</Label>
                <Input type="number" value={form.xp_reward} onChange={(e) => setForm((f) => ({ ...f, xp_reward: parseInt(e.target.value) || 0 }))} className="bg-muted border-border text-foreground placeholder:text-muted-foreground" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog({ open: false })}>Cancel</Button>
            <Button onClick={() => (dialog.edit ? updateMutation : createMutation).mutate()} disabled={createMutation.isPending || updateMutation.isPending}>
              {dialog.edit ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
