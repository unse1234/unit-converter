import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * Button.
 *
 * Ghost-first, following DESIGN.md §4: the default state is transparent and
 * feedback comes from background and text colour only. There is no transform,
 * scale or opacity animation on interaction, which also keeps the control
 * predictable for users who have reduced motion enabled.
 */

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-fg text-canvas hover:bg-fg-secondary disabled:bg-fg-muted disabled:text-canvas shadow-border',
  secondary: 'bg-surface text-fg shadow-border hover:bg-hover active:bg-active',
  ghost: 'bg-transparent text-fg-secondary hover:bg-hover hover:text-fg',
  danger: 'bg-transparent text-danger shadow-border hover:bg-danger-subtle',
};

/*
 * Visual heights. On a touch screen the `tap-target` class in globals.css
 * lifts anything under 44px to a 44px hit area without changing these.
 */
const sizes: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-5 text-base gap-2',
  icon: 'h-10 w-10 justify-center',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children?: ReactNode;
}

export function Button({
  variant = 'secondary',
  size = 'md',
  className,
  type = 'button',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'tap-target inline-flex shrink-0 items-center rounded-md font-medium whitespace-nowrap',
        'transition-colors duration-150',
        'disabled:cursor-not-allowed disabled:opacity-60',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
