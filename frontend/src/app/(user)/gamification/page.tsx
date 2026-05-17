'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Zap, Flame, Trophy, Award, Medal, Target, BadgeCheck,
  TrendingUp, Crown, Swords,
} from 'lucide-react';
import { useAuthStore } from '@/store';
import { gamificationApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getXPForNextLevel, getInitials } from '@/lib/utils';
import { GamificationProfile, Badge as BadgeType, LeaderboardEntry } from '@/types';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export default function GamificationPage() {
  const currentUser = useAuthStore((s) => s.user);
  const { data: profile, isLoading: profileLoading, error: profileError } = useQuery<GamificationProfile>({
    queryKey: ['gamification-profile'],
    queryFn: async () => {
      const res = await gamificationApi.getProfile();
      return res.data.data || res.data;
    },
  });

  const { data: badges, isLoading: badgesLoading } = useQuery({
    queryKey: ['gamification-badges'],
    queryFn: async () => {
      const res = await gamificationApi.getBadges();
      return (res.data.data || res.data) as BadgeType[];
    },
  });

  const { data: leaderboard, isLoading: leaderboardLoading } = useQuery({
    queryKey: ['gamification-leaderboard'],
    queryFn: async () => {
      const res = await gamificationApi.getLeaderboard({ limit: 20 });
      return (res.data.data || res.data) as LeaderboardEntry[];
    },
  });

  const { data: challenges, isLoading: challengesLoading } = useQuery({
    queryKey: ['gamification-challenges'],
    queryFn: async () => {
      const res = await gamificationApi.getChallenges();
      return res.data.data || res.data;
    },
  });

  const isLoading = profileLoading || badgesLoading || leaderboardLoading || challengesLoading;

  if (isLoading) return <GamificationSkeleton />;
  if (profileError) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <TrendingUp className="h-10 w-10" />
          <p>Failed to load gamification data. Please try again later.</p>
        </div>
      </div>
    );
  }

  const xp = profile
    ? getXPForNextLevel(profile.xp_total, profile.level_id || 1)
    : { current: 0, needed: 100, percentage: 0 };

  const rarityColor: Record<string, string> = {
    common: 'text-muted-foreground',
    uncommon: 'text-emerald-500',
    rare: 'text-blue-500',
    epic: 'text-purple-500',
    legendary: 'text-yellow-500',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Gamification</h1>
        <p className="text-muted-foreground mt-1">Track your achievements and compete on the leaderboard.</p>
      </div>

      {profile && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4"
        >
          <motion.div variants={itemVariants}>
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Level</CardTitle>
                <div className="h-8 w-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-yellow-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-foreground">{profile.level_id}</div>
                <p className="text-xs text-muted-foreground mt-1">{profile.xp_total.toLocaleString()} XP</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Current Streak</CardTitle>
                <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <Flame className="h-4 w-4 text-orange-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-foreground">{profile.current_streak} days</div>
                <p className="text-xs text-muted-foreground mt-1">Longest: {profile.longest_streak} days</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Badges Earned</CardTitle>
                <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Award className="h-4 w-4 text-purple-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-foreground">{badges?.length ?? 0}</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Rank</CardTitle>
                <div className="h-8 w-8 rounded-lg bg-rose-500/10 flex items-center justify-center">
                  <Crown className="h-4 w-4 text-rose-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-foreground">
                  {leaderboard?.find((e) => e.user_id === currentUser?.id)?.rank || '-'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">On leaderboard</p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}

      {profile && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">Level {profile.level_id} Progress</CardTitle>
            <CardDescription>{xp.current.toLocaleString()} / {xp.needed.toLocaleString()} XP</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={xp.percentage} className="h-2.5" />
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="badges" className="space-y-4">
        <TabsList>
          <TabsTrigger value="badges" className="gap-2">
            <Award className="h-4 w-4" /> Badges
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="gap-2">
            <Medal className="h-4 w-4" /> Leaderboard
          </TabsTrigger>
          <TabsTrigger value="challenges" className="gap-2">
            <Target className="h-4 w-4" /> Challenges
          </TabsTrigger>
        </TabsList>

        <TabsContent value="badges">
          {badges && badges.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
            >
              {badges.map((badge) => (
                <motion.div key={badge.id} variants={itemVariants}>
                  <Card className="bg-card border-border transition-colors text-center">
                    <CardContent className="p-4 flex flex-col items-center gap-2">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <BadgeCheck className={`h-5 w-5 ${rarityColor[badge.rarity] || 'text-blue-500'}`} />
                      </div>
                      <p className="text-xs font-medium text-foreground line-clamp-1">{badge.name}</p>
                      <Badge variant="secondary" className="text-[10px]">
                        {badge.rarity}
                      </Badge>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <Card className="bg-card border-border">
              <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Award className="h-10 w-10 mb-3" />
                <p className="text-lg font-medium">No badges yet</p>
                <p className="text-sm mt-1">Complete challenges and study to earn badges.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

      <TabsContent value="leaderboard">
  {leaderboard && leaderboard.length > 0 ? (
    <Card className="bg-card border-border overflow-hidden">
      <ScrollArea className="h-[500px] w-full">
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead className="w-12">Rank</TableHead>
              <TableHead>User</TableHead>
              <TableHead className="text-right">Level</TableHead>
              <TableHead className="text-right">XP</TableHead>
              <TableHead className="text-right">Streak</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaderboard.map((entry) => (
              <TableRow key={entry.user_id} className="border-border">
                <TableCell className="font-medium">
                  {entry.rank <= 3 ? (
                    <span className="flex items-center gap-1">
                      {entry.rank === 1 ? <Crown className="h-4 w-4 text-yellow-500" /> : null}
                      {entry.rank === 2 ? <Medal className="h-4 w-4 text-muted-foreground" /> : null}
                      {entry.rank === 3 ? <Medal className="h-4 w-4 text-amber-600" /> : null}
                      {entry.rank}
                    </span>
                  ) : (
                    entry.rank
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={entry.avatar_url || undefined} />
                      <AvatarFallback className="text-[10px]">
                        {getInitials(entry.display_name || entry.username || 'U')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-foreground">{entry.display_name || entry.username}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant="secondary" className="text-xs">Lv.{entry.level_id}</Badge>
                </TableCell>
                <TableCell className="text-right text-sm text-foreground">{entry.xp_total.toLocaleString()}</TableCell>
                <TableCell className="text-right">
                  <span className="flex items-center justify-end gap-1 text-sm">
                    <Flame className="h-3 w-3 text-orange-500" />
                    {entry.current_streak}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </Card>
  ) : (
            <Card className="bg-card border-border">
              <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Medal className="h-10 w-10 mb-3" />
                <p className="text-lg font-medium">Leaderboard is empty</p>
                <p className="text-sm mt-1">Start studying to appear on the leaderboard.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="challenges">
          {challenges && (Array.isArray(challenges) ? challenges.length > 0 : Object.keys(challenges).length > 0) ? (
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {(Array.isArray(challenges) ? challenges : challenges.active || []).map((challenge: any, i: number) => (
                <motion.div key={challenge.id || i} variants={itemVariants}>
                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle className="text-sm text-foreground flex items-center gap-2">
                        <Target className="h-4 w-4 text-rose-500" />
                        {challenge.title || challenge.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground mb-3">
                        {challenge.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge variant="info" className="text-xs">
                          +{challenge.xp_reward || 0} XP
                        </Badge>
                        <Progress value={challenge.progress ?? 0} className="h-1.5 w-20" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="bg-card border-border">
              <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Swords className="h-10 w-10 mb-3" />
                <p className="text-lg font-medium">No challenges available</p>
                <p className="text-sm mt-1">New challenges will appear here.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function GamificationSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-5 w-56 mt-2" />
      </div>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="bg-card border-border">
            <CardHeader className="pb-2"><Skeleton className="h-4 w-20" /></CardHeader>
            <CardContent><Skeleton className="h-8 w-16" /></CardContent>
          </Card>
        ))}
      </div>
      <Card className="bg-card border-border">
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-48" />
        </CardHeader>
        <CardContent><Skeleton className="h-2.5 w-full" /></CardContent>
      </Card>
      <Skeleton className="h-10 w-80" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="bg-card border-border">
            <CardContent className="p-4 flex flex-col items-center gap-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-12 rounded-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
