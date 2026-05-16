'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { toast } from 'sonner';
import { Trash2, Edit, Shield, User as UserIcon, Search } from 'lucide-react';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from '@/components/ui/table';
import { adminApi } from '@/lib/api';
import { User } from '@/types';
import { formatDate, getInitials } from '@/lib/utils';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ display_name: '', role: '' as User['role'], xp_total: 0 });

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminApi.getUsers().then((r) => r.data),
  });

  const users: User[] = Array.isArray(usersData) ? usersData : (usersData?.users ?? []);

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => adminApi.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User updated successfully');
      setEditingUser(null);
    },
    onError: () => toast.error('Failed to update user'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User deleted successfully');
      setDeletingUser(null);
    },
    onError: () => toast.error('Failed to delete user'),
  });

  const openEdit = (user: User) => {
    setEditForm({
      display_name: user.display_name ?? '',
      role: user.role,
      xp_total: user.xp_total,
    });
    setEditingUser(user);
  };

  const handleEdit = () => {
    if (!editingUser) return;
    updateMutation.mutate({ id: editingUser.id, data: editForm });
  };

  const filtered = users.filter(
    (u) =>
      u.display_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={{ hidden: {}, show: {} }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Users</h1>
          <p className="text-muted-foreground mt-1">Manage platform users and their roles</p>
        </div>
      </motion.div>

      <motion.div variants={{ hidden: {}, show: {} }}>
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <CardTitle className="text-foreground text-lg">All Users ({users.length})</CardTitle>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-muted border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-14 w-full bg-muted" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-muted-foreground text-sm py-12 text-center">
                {search ? 'No users match your search' : 'No users found'}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead className="text-muted-foreground">User</TableHead>
                      <TableHead className="text-muted-foreground">Email</TableHead>
                      <TableHead className="text-muted-foreground">Role</TableHead>
                      <TableHead className="text-muted-foreground">XP</TableHead>
                      <TableHead className="text-muted-foreground">Joined</TableHead>
                      <TableHead className="text-muted-foreground text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((user) => (
                      <TableRow key={user.id} className="border-border hover:bg-accent">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.avatar_url ?? undefined} />
                              <AvatarFallback className="bg-muted text-xs text-foreground">
                                {getInitials(user.display_name || user.email)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-foreground font-medium">
                              {user.display_name || 'Unnamed'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="capitalize">
                            {user.role === 'admin' ? <Shield className="w-3 h-3 mr-1" /> : <UserIcon className="w-3 h-3 mr-1" />}
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{user.xp_total.toLocaleString()}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{formatDate(user.created_at)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => openEdit(user)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeletingUser(user)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="bg-card border-border text-foreground p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Update user details and permissions
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="display_name">Display Name</Label>
              <Input
                id="display_name"
                value={editForm.display_name}
                onChange={(e) => setEditForm((f) => ({ ...f, display_name: e.target.value }))}
                className="bg-muted border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={editForm.role}
                onValueChange={(v) => setEditForm((f) => ({ ...f, role: v as User['role'] }))}
              >
                <SelectTrigger className="bg-muted border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground">
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="xp_total">Total XP</Label>
              <Input
                id="xp_total"
                type="number"
                value={editForm.xp_total}
                onChange={(e) => setEditForm((f) => ({ ...f, xp_total: parseInt(e.target.value) || 0 }))}
                className="bg-muted border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingUser} onOpenChange={(open) => !open && setDeletingUser(null)}>
        <DialogContent className="bg-card border-border text-foreground p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Are you sure you want to delete {deletingUser?.display_name || deletingUser?.email}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingUser(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deletingUser && deleteMutation.mutate(deletingUser.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
