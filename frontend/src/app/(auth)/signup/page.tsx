'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, UserPlus, Zap, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store';

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  display_name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/, 'Letters, numbers, and underscores only')
    .optional()
    .or(z.literal('')),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type SignupForm = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupForm>({ resolver: zodResolver(signupSchema) });

  const onSubmit = async (data: SignupForm) => {
    setLoading(true);
    setError('');
    try {
      const res = await authApi.signup({
        email: data.email,
        password: data.password,
        display_name: data.display_name,
        username: data.username || undefined,
      });
      const { user, access_token } = res.data.data || res.data;
      setAuth(user, access_token);
      router.push('/onboarding');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-3 sm:p-4">
      <div className="fixed inset-0 bg-gradient-to-b from-violet-600/10 via-transparent to-blue-600/10" />
      <div className="fixed top-1/4 right-1/3 w-64 h-64 bg-violet-500/10 rounded-full blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative"
      >
        <Link href="/" className="flex items-center justify-center gap-2 mb-6 sm:mb-8">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <span className="font-bold text-lg sm:text-xl text-foreground">StudySprint OS</span>
        </Link>

        <div className="rounded-2xl border border-border bg-card p-5 sm:p-8 shadow-xl">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1">Create your account</h1>
          <p className="text-muted-foreground text-sm mb-4 sm:mb-6">Start your learning journey today</p>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="display_name" className="text-foreground/70 text-sm">Full Name</Label>
                <Input
                  id="display_name"
                  placeholder="John Doe"
                  {...register('display_name')}
                />
                {errors.display_name && <p className="text-destructive text-xs">{errors.display_name.message}</p>}
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="username" className="text-foreground/70 text-sm">Username</Label>
                <Input
                  id="username"
                  placeholder="johndoe"
                  {...register('username')}
                />
                {errors.username && <p className="text-destructive text-xs">{errors.username.message}</p>}
              </div>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="email" className="text-foreground/70 text-sm">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@school.edu"
                {...register('email')}
              />
              {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="password" className="text-foreground/70 text-sm">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 8 characters"
                  className="pr-10"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-destructive text-xs">{errors.password.message}</p>}
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="confirmPassword" className="text-foreground/70 text-sm">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Repeat your password"
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && <p className="text-destructive text-xs">{errors.confirmPassword.message}</p>}
            </div>

            <Button type="submit" className="w-full gap-2" size="lg" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <p className="mt-4 sm:mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:text-primary/80 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
