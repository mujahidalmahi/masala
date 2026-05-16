import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getProgressColor(level: number): string {
  if (level >= 80) return 'text-emerald-500';
  if (level >= 60) return 'text-blue-500';
  if (level >= 40) return 'text-yellow-500';
  return 'text-red-500';
}

export function getProgressBarColor(level: number): string {
  if (level >= 80) return 'bg-emerald-500';
  if (level >= 60) return 'bg-blue-500';
  if (level >= 40) return 'bg-yellow-500';
  return 'bg-red-500';
}

export function getDifficultyLabel(difficulty: number): string {
  const labels = ['', 'Easy', 'Medium', 'Hard', 'Expert', 'Master'];
  return labels[difficulty] || 'Unknown';
}

export function getXPForNextLevel(currentXp: number, level: number): { current: number; needed: number; percentage: number } {
  const xpForCurrent = level * 500 - 500;
  const xpForNext = level * 500;
  const needed = xpForNext - currentXp;
  const progress = ((currentXp - xpForCurrent) / (xpForNext - xpForCurrent)) * 100;
  return {
    current: currentXp - xpForCurrent,
    needed: xpForNext - xpForCurrent,
    percentage: Math.min(100, Math.max(0, progress)),
  };
}
