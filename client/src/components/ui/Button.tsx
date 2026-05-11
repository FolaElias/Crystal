import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold tracking-wide transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40 overflow-hidden',
  {
    variants: {
      variant: {
        default: [
          'bg-neon-gradient text-crystal-bg border border-neon-cyan/30',
          'shadow-neon-cyan hover:shadow-[0_0_20px_rgba(0,212,255,0.6),0_0_60px_rgba(0,212,255,0.2)]',
          'hover:scale-[1.02] active:scale-[0.98]',
          'before:absolute before:inset-0 before:bg-white/10 before:opacity-0 hover:before:opacity-100 before:transition-opacity',
        ].join(' '),
        outline: [
          'bg-transparent border border-neon-cyan/40 text-neon-cyan',
          'hover:bg-neon-cyan/10 hover:border-neon-cyan hover:shadow-neon-cyan',
          'hover:scale-[1.02] active:scale-[0.98]',
        ].join(' '),
        ghost: [
          'bg-transparent border border-transparent text-muted-foreground',
          'hover:bg-crystal-hover hover:text-neon-cyan hover:border-neon-cyan/20',
        ].join(' '),
        success: [
          'bg-success-gradient text-crystal-bg border border-neon-green/30',
          'shadow-neon-green hover:shadow-[0_0_20px_rgba(0,255,136,0.6)]',
          'hover:scale-[1.02] active:scale-[0.98] font-bold',
        ].join(' '),
        danger: [
          'bg-danger-gradient text-white border border-neon-red/30',
          'shadow-neon-red hover:shadow-[0_0_20px_rgba(255,51,102,0.6)]',
          'hover:scale-[1.02] active:scale-[0.98] font-bold',
        ].join(' '),
        gold: [
          'bg-gold-gradient text-crystal-bg border border-neon-gold/30',
          'shadow-neon-gold hover:shadow-[0_0_20px_rgba(240,185,11,0.6)]',
          'hover:scale-[1.02] active:scale-[0.98] font-bold',
        ].join(' '),
        secondary: [
          'bg-crystal-card border border-crystal-border text-foreground',
          'hover:border-neon-cyan/30 hover:bg-crystal-hover hover:text-neon-cyan',
        ].join(' '),
      },
      size: {
        sm:      'h-8 px-3 text-xs rounded-md',
        default: 'h-10 px-5 py-2',
        lg:      'h-12 px-8 text-base rounded-xl',
        xl:      'h-14 px-10 text-lg rounded-xl',
        icon:    'h-10 w-10 rounded-lg',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
