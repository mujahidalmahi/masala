'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Save, User, AtSign, Text, Loader2, TrendingUp } from 'lucide-react';
import { usersApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { getInitials } from '@/lib/utils';
import { toast } from 'sonner';
import { User as UserType } from '@/types';

export default function SettingsPage() {
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await usersApi.getProfile();
      return (res.data.data || res.data) as UserType;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-5 w-48 mt-2" />
        </div>
        <Card className="bg-card border-border">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-3 w-56" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <TrendingUp className="h-10 w-10" />
          <p>Failed to load profile. Please try again later.</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <TrendingUp className="h-10 w-10" />
          <p>Profile not available.</p>
        </div>
      </div>
    );
  }

  return <SettingsForm profile={profile} />;
}

function SettingsForm({ profile }: { profile: UserType }) {
  const queryClient = useQueryClient();
  const [displayName, setDisplayName] = useState(profile.display_name || '');
  const [username, setUsername] = useState(profile.username || '');
  const [bio, setBio] = useState(profile.bio || '');

  const updateMutation = useMutation({
    mutationFn: (data: { display_name?: string; username?: string; bio?: string }) =>
      usersApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile updated!');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to update profile'),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateMutation.mutate({
      display_name: displayName || undefined,
      username: username || undefined,
      bio: bio || undefined,
    });
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your profile and account settings.</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="text-lg">
                  {getInitials(profile.display_name || profile.username || 'U')}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-xl text-foreground">{profile.display_name || 'User'}</CardTitle>
                <CardDescription>@{profile.username || 'username'}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <Separator className="bg-border" />
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="display-name" className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  Display Name
                </Label>
                <Input
                  id="display-name"
                  placeholder="Your display name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username" className="flex items-center gap-2">
                  <AtSign className="h-4 w-4 text-muted-foreground" />
                  Username
                </Label>
                <Input
                  id="username"
                  placeholder="your-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="flex items-center gap-2">
                  <Text className="h-4 w-4 text-muted-foreground" />
                  Bio
                </Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                />
              </div>

              <Separator className="bg-border" />

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Email: {profile.email}</span>
                <span className="text-muted-foreground">|</span>
                <span>Role: {profile.role}</span>
              </div>

              <Button type="submit" className="gap-2" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
