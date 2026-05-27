import { ButtonHTMLAttributes } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const variantClasses: Record<string, string> = {
  primary: 'bg-primary text-on-primary hover:opacity-90 disabled:opacity-50',
  outline: 'border border-primary text-primary bg-transparent hover:bg-primary-fixed disabled:opacity-50',
  danger: 'bg-error text-on-error hover:opacity-90 disabled:opacity-50',
};

const sizeClasses: Record<string, string> = {
  sm: 'px-sm py-xs text-label-md font-label-md rounded',
  md: 'px-md py-sm text-body-md font-body-md rounded-lg',
  lg: 'px-lg py-sm text-body-lg font-body-lg rounded-xl',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-xs transition-all cursor-pointer ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {loading && <LoadingSpinner size="sm" />}
      {children}
    </button>
  );
}
