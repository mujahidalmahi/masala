import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-2xl border-2 px-3 py-1 text-xs font-bold transition-all duration-200 uppercase tracking-wide shadow-sm hover:scale-105',
  {
    variants: {
      variant: {
        default: 'border-primary/30 bg-primary/10 text-primary shadow-glow-sm',
        secondary: 'border-secondary/30 bg-secondary/10 text-secondary shadow-glow-sm',
        destructive: 'border-destructive/30 bg-destructive/10 text-destructive',
        outline: 'border-border bg-background text-foreground hover:bg-accent',
        success: 'border-success/30 bg-success/10 text-success',
        warning: 'border-warning/30 bg-warning/10 text-warning',
        info: 'border-primary/30 bg-primary/10 text-primary',
        gradient: 'border-transparent bg-gradient-to-r from-primary via-secondary to-accent text-white shadow-glow-md',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
